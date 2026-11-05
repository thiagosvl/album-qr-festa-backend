import { supabaseAdmin } from "../config/supabase.js";
import {
  FESTA_METODO_PAGAMENTO,
  FESTA_PACOTE_TIPO,
  FESTA_STATUS_PEDIDO,
  FESTA_TABLES,
  FESTA_TIPO_TRANSACAO_CREDITO,
} from "../constants/festa.enum.js";
import { AppError } from "../errors/AppError.js";
import type {
  AtualizarPlanoB2bInput,
  CriarEventoParceiroB2bInput,
  RegistrarTransacaoCreditoB2bInput,
  SalvarParceiroB2bInput,
} from "../schemas/parceiro-b2b.schema.js";
import type {
  FestaCatalogoPlanoB2b,
  FestaParceiroB2b,
  FestaTemaCatalogo,
  FestaTransacaoCreditoB2b,
} from "../types/database.js";
import type { EventoAdminResponseDto } from "../types/dtos/evento.dto.js";
import { eventoService } from "./evento.service.js";

export interface ParceiroB2bAdminDto extends FestaParceiroB2b {
  plano: FestaCatalogoPlanoB2b | null;
  total_eventos: number;
  transacoes: FestaTransacaoCreditoB2b[];
}

export interface PortalParceiroB2bDto {
  parceiro: ParceiroB2bAdminDto | null;
  parceiros_disponiveis: FestaParceiroB2b[];
  planos_b2b: FestaCatalogoPlanoB2b[];
  eventos: EventoAdminResponseDto[];
  temas: FestaTemaCatalogo[];
}

export class ParceiroB2bService {
  async listarParceirosAdmin(): Promise<ParceiroB2bAdminDto[]> {
    const { data: parceiros, error } = await supabaseAdmin
      .from(FESTA_TABLES.PARCEIROS_B2B)
      .select("*, plano:festa_catalogo_planos_b2b(*)")
      .order("created_at", { ascending: false });

    if (error) throw new AppError(error.message, 500);

    return Promise.all(
      parceiros.map(async (row) => {
        const [{ count }, { data: transacoes }] = await Promise.all([
          supabaseAdmin
            .from(FESTA_TABLES.EVENTOS)
            .select("id", { count: "exact", head: true })
            .eq("parceiro_id", row.id),
          supabaseAdmin
            .from(FESTA_TABLES.TRANSACOES_CREDITOS_B2B)
            .select("*")
            .eq("parceiro_id", row.id)
            .order("created_at", { ascending: false })
            .limit(20),
        ]);

        const { plano, ...parceiroPuro } = row as FestaParceiroB2b & {
          plano: FestaCatalogoPlanoB2b | null;
        };

        return {
          ...parceiroPuro,
          plano: plano ?? null,
          total_eventos: count ?? 0,
          transacoes: transacoes ?? [],
        };
      })
    );
  }

  async criarParceiro(input: SalvarParceiroB2bInput): Promise<ParceiroB2bAdminDto> {
    const { data: criado, error } = await supabaseAdmin
      .from(FESTA_TABLES.PARCEIROS_B2B)
      .insert({
        nome_empresa: input.nome_empresa,
        documento: input.documento ?? null,
        telefone: input.telefone ?? null,
        email: input.email ?? null,
        logo_url: input.logo_url ?? null,
        cor_marca: input.cor_marca,
        status_assinatura: input.status_assinatura,
        plano_b2b_id: input.plano_b2b_id ?? null,
        saldo_creditos: input.saldo_creditos,
        ativo: input.ativo,
      })
      .select("*")
      .single();

    if (error) throw new AppError(error.message, 400);

    if (input.saldo_creditos > 0) {
      await supabaseAdmin.from(FESTA_TABLES.TRANSACOES_CREDITOS_B2B).insert({
        parceiro_id: criado.id,
        tipo: FESTA_TIPO_TRANSACAO_CREDITO.RECARGA_PLANO,
        quantidade: input.saldo_creditos,
        observacao: "Saldo inicial de créditos na ativação do parceiro B2B",
      });
    }

    const todos = await this.listarParceirosAdmin();
    const encontrado = todos.find((p) => p.id === criado.id);
    if (!encontrado) throw new AppError("Parceiro não encontrado", 404);
    return encontrado;
  }

  async atualizarParceiro(
    id: string,
    input: Partial<SalvarParceiroB2bInput>
  ): Promise<ParceiroB2bAdminDto> {
    const { error } = await supabaseAdmin
      .from(FESTA_TABLES.PARCEIROS_B2B)
      .update(input)
      .eq("id", id);

    if (error) throw new AppError(error.message, 400);

    const todos = await this.listarParceirosAdmin();
    const encontrado = todos.find((p) => p.id === id);
    if (!encontrado) throw new AppError("Parceiro não encontrado", 404);
    return encontrado;
  }

  async registrarTransacaoCredito(
    parceiroId: string,
    input: RegistrarTransacaoCreditoB2bInput
  ): Promise<ParceiroB2bAdminDto> {
    const { data: parceiro, error: findError } = await supabaseAdmin
      .from(FESTA_TABLES.PARCEIROS_B2B)
      .select("*")
      .eq("id", parceiroId)
      .maybeSingle();

    if (findError) throw new AppError(findError.message, 500);
    if (!parceiro) throw new AppError("Parceiro B2B não encontrado", 404);

    const ehDebito = input.tipo === FESTA_TIPO_TRANSACAO_CREDITO.CONSUMO_EVENTO;
    if (ehDebito && parceiro.saldo_creditos < input.quantidade) {
      throw new AppError(
        "Saldo de créditos insuficiente para realizar este débito.",
        400
      );
    }

    const novoSaldo = ehDebito
      ? parceiro.saldo_creditos - input.quantidade
      : parceiro.saldo_creditos + input.quantidade;

    const { error: txError } = await supabaseAdmin
      .from(FESTA_TABLES.TRANSACOES_CREDITOS_B2B)
      .insert({
        parceiro_id: parceiroId,
        tipo: input.tipo,
        quantidade: ehDebito ? -input.quantidade : input.quantidade,
        observacao: input.observacao ?? null,
      });

    if (txError) throw new AppError(txError.message, 400);

    const { error: updError } = await supabaseAdmin
      .from(FESTA_TABLES.PARCEIROS_B2B)
      .update({ saldo_creditos: novoSaldo })
      .eq("id", parceiroId);

    if (updError) throw new AppError(updError.message, 400);

    const todos = await this.listarParceirosAdmin();
    const atualizado = todos.find((p) => p.id === parceiroId);
    if (!atualizado) throw new AppError("Parceiro não encontrado", 404);
    return atualizado;
  }

  async atualizarPlanoB2b(
    id: string,
    input: AtualizarPlanoB2bInput
  ): Promise<FestaCatalogoPlanoB2b> {
    const { data, error } = await supabaseAdmin
      .from(FESTA_TABLES.CATALOGO_PLANOS_B2B)
      .update(input)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) throw new AppError(error.message, 400);
    if (!data) throw new AppError("Plano B2B não encontrado", 404);
    return data;
  }

  async obterPortalParceiro(parceiroId?: string): Promise<PortalParceiroB2bDto> {
    const [parceirosAdmin, planosRes, temasRes] = await Promise.all([
      this.listarParceirosAdmin(),
      supabaseAdmin
        .from(FESTA_TABLES.CATALOGO_PLANOS_B2B)
        .select("*")
        .order("ordem", { ascending: true }),
      supabaseAdmin
        .from(FESTA_TABLES.TEMAS_CATALOGO)
        .select("*")
        .eq("ativo", true)
        .order("ordem", { ascending: true }),
    ]);

    if (planosRes.error) throw new AppError(planosRes.error.message, 500);
    if (temasRes.error) throw new AppError(temasRes.error.message, 500);

    const parceiroSelecionado =
      (parceiroId
        ? parceirosAdmin.find((p) => p.id === parceiroId)
        : parceirosAdmin[0]) ?? null;

    let eventosParceiro: EventoAdminResponseDto[] = [];
    if (parceiroSelecionado) {
      const todosEventos = await eventoService.listarEventosAdmin({
        incluir_demo: false,
      });
      eventosParceiro = todosEventos.filter(
        (ev) => ev.parceiro_id === parceiroSelecionado.id
      );
    }

    return {
      parceiro: parceiroSelecionado,
      parceiros_disponiveis: parceirosAdmin.map(
        ({ plano: _p, total_eventos: _t, transacoes: _tr, ...puro }) => puro
      ),
      planos_b2b: planosRes.data ?? [],
      eventos: eventosParceiro,
      temas: temasRes.data ?? [],
    };
  }

  async criarEventoComCreditoParceiro(
    parceiroId: string,
    input: CriarEventoParceiroB2bInput
  ): Promise<EventoAdminResponseDto> {
    const todos = await this.listarParceirosAdmin();
    const parceiro = todos.find((p) => p.id === parceiroId);
    if (!parceiro) throw new AppError("Parceiro B2B não encontrado", 404);

    const custoCreditos =
      input.pacote === FESTA_PACOTE_TIPO.COMPLETO
        ? (parceiro.plano?.custo_creditos_completo ?? 2)
        : (parceiro.plano?.custo_creditos_basico ?? 1);

    if (parceiro.saldo_creditos < custoCreditos) {
      throw new AppError(
        `Saldo de créditos insuficiente. Necessário: ${custoCreditos} crédito(s); disponível: ${parceiro.saldo_creditos}.`,
        400
      );
    }

    const eventoCriado = await eventoService.criarEventoAdmin({
      slug: input.slug,
      titulo: input.titulo,
      subtitulo: input.subtitulo ?? null,
      boas_vindas: input.boas_vindas ?? null,
      nome_aniversariante: input.nome_aniversariante ?? null,
      idade_aniversariante: input.idade_aniversariante ?? null,
      data_evento: input.data_evento ?? null,
      cor_primaria: input.cor_primaria,
      cor_secundaria: input.cor_secundaria,
      tema_id: input.tema_id ?? null,
      parceiro_id: parceiro.id,
      pacote: input.pacote,
      status_pedido: FESTA_STATUS_PEDIDO.PAGO_COMPLETO,
      metodo_pagamento: FESTA_METODO_PAGAMENTO.CREDITO_B2B,
      valor_pacote_centavos: 0,
      desconto_centavos: 0,
      valor_sinal_centavos: 0,
      valor_pago_centavos: 0,
      galeria_publica: true,
      moderacao_previa: false,
      permite_envio_midias: true,
      tempo_slideshow_segundos: 6,
      ativo: true,
      extras: [],
      anfitriao: input.nome_anfitriao
        ? {
            nome: input.nome_anfitriao,
            telefone: input.telefone_anfitriao ?? null,
            cpf: null,
            email: null,
          }
        : undefined,
    });

    await supabaseAdmin.from(FESTA_TABLES.TRANSACOES_CREDITOS_B2B).insert({
      parceiro_id: parceiro.id,
      evento_id: eventoCriado.id,
      tipo: FESTA_TIPO_TRANSACAO_CREDITO.CONSUMO_EVENTO,
      quantidade: -custoCreditos,
      observacao: `Criação do evento "${eventoCriado.titulo}" (${input.pacote})`,
    });

    await supabaseAdmin
      .from(FESTA_TABLES.PARCEIROS_B2B)
      .update({ saldo_creditos: parceiro.saldo_creditos - custoCreditos })
      .eq("id", parceiro.id);

    return eventoCriado;
  }
}

export const parceiroB2bService = new ParceiroB2bService();
