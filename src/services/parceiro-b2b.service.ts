import { supabaseAdmin } from "../config/supabase.js";
import {
  FESTA_TABLES,
  FESTA_TIPO_TRANSACAO_CREDITO,
} from "../constants/festa.enum.js";
import { messages } from "../constants/messages.js";
import { AppError } from "../errors/AppError.js";
import type {
  AtualizarEventoParceiroB2bInput,
  AtualizarOperadorParceiroInput,
  AtualizarParceiroB2bInput,
  AtualizarPerfilPortalParceiroInput,
  AtualizarPlanoB2bInput,
  CriarEventoParceiroB2bInput,
  CriarOperadorParceiroInput,
  RegistrarTransacaoCreditoB2bInput,
  SalvarParceiroB2bInput,
} from "../schemas/parceiro-b2b.schema.js";
import type {
  FestaCatalogoPlanoB2b,
  FestaParceiroB2b,
  FestaTipoPerfilEnum,
  FestaUsuario,
} from "../types/database.js";
import type { EventoAdminResponseDto } from "../types/dtos/evento.dto.js";
import type {
  ImpersonateParceiroResponseDto,
  ParceiroB2bAdminDto,
  PortalParceiroB2bDto,
} from "../types/dtos/parceiro-b2b.dto.js";
import {
  enriquecerParceiroB2bAdminDto,
  gerarTokenImpersonateParceiroB2b,
  obterMapaCredenciaisParceiros,
  sincronizarCredenciaisParceiroB2b,
} from "../utils/parceiro-auth.helper.js";
import {
  atualizarOperadorParceiroB2b,
  criarOperadorParceiroB2b,
  excluirOperadorParceiroB2b,
  listarOperadoresParceiroB2b,
  montarInputAtualizacaoEventoParceiroB2b,
  montarInputEventoCreditoParceiroB2b,
} from "../utils/parceiro-operadores.helper.js";
import { eventoService } from "./evento.service.js";

function validarParceiroIdObrigatorio(parceiroId: string | null | undefined): string {
  if (!parceiroId) {
    throw new AppError(messages.auth.acessoRestritoParceiro, 403);
  }
  return parceiroId;
}

export class ParceiroB2bService {
  async listarParceirosAdmin(): Promise<ParceiroB2bAdminDto[]> {
    const { data: parceiros, error } = await supabaseAdmin
      .from(FESTA_TABLES.PARCEIROS_B2B)
      .select("*, plano:festa_catalogo_planos_b2b(*)")
      .order("created_at", { ascending: false });

    if (error) throw new AppError(error.message, 500);

    const mapaCredenciais = await obterMapaCredenciaisParceiros(
      parceiros.map((p) => p.id)
    );

    return Promise.all(
      parceiros.map((row) =>
        enriquecerParceiroB2bAdminDto(
          row as FestaParceiroB2b & { plano: FestaCatalogoPlanoB2b | null },
          mapaCredenciais
        )
      )
    );
  }

  private async obterParceiroAdminPorId(id: string): Promise<ParceiroB2bAdminDto> {
    const todos = await this.listarParceirosAdmin();
    const encontrado = todos.find((p) => p.id === id);
    if (!encontrado) throw new AppError(messages.parceiro.naoEncontrado, 404);
    return encontrado;
  }

  async criarParceiro(
    input: SalvarParceiroB2bInput
  ): Promise<ParceiroB2bAdminDto> {
    const { data: criado, error } = await supabaseAdmin
      .from(FESTA_TABLES.PARCEIROS_B2B)
      .insert({
        nome_empresa: input.nome_empresa,
        documento: input.documento ?? null,
        telefone: input.telefone ?? null,
        email: input.email?.trim().toLowerCase() ?? null,
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

    await sincronizarCredenciaisParceiroB2b(criado, input.senha_acesso);

    if (input.saldo_creditos > 0) {
      await supabaseAdmin.from(FESTA_TABLES.TRANSACOES_CREDITOS_B2B).insert({
        parceiro_id: criado.id,
        tipo: FESTA_TIPO_TRANSACAO_CREDITO.RECARGA_PLANO,
        quantidade: input.saldo_creditos,
        observacao: messages.parceiro.observacaoSaldoInicial,
      });
    }

    return this.obterParceiroAdminPorId(criado.id);
  }

  async atualizarParceiro(
    id: string,
    input: AtualizarParceiroB2bInput
  ): Promise<ParceiroB2bAdminDto> {
    const { senha_acesso, ...dadosParceiro } = input;
    if (dadosParceiro.email !== undefined) {
      dadosParceiro.email = dadosParceiro.email?.trim().toLowerCase() ?? null;
    }

    const { data: atualizado, error } = await supabaseAdmin
      .from(FESTA_TABLES.PARCEIROS_B2B)
      .update(dadosParceiro)
      .eq("id", id)
      .select("*")
      .single();

    if (error || !atualizado) {
      throw new AppError(error?.message || messages.parceiro.naoEncontrado, 400);
    }

    await sincronizarCredenciaisParceiroB2b(atualizado, senha_acesso);
    return this.obterParceiroAdminPorId(id);
  }

  async atualizarPerfilPortal(
    parceiroId: string | null | undefined,
    input: AtualizarPerfilPortalParceiroInput
  ): Promise<ParceiroB2bAdminDto> {
    return this.atualizarParceiro(validarParceiroIdObrigatorio(parceiroId), input);
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
    if (!parceiro) throw new AppError(messages.parceiro.naoEncontrado, 404);

    const ehDebito = input.tipo === FESTA_TIPO_TRANSACAO_CREDITO.CONSUMO_EVENTO;
    if (ehDebito && parceiro.saldo_creditos < input.quantidade) {
      throw new AppError(messages.parceiro.saldoInsuficienteDebito, 400);
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
    return this.obterParceiroAdminPorId(parceiroId);
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
    if (!data) throw new AppError(messages.catalogo.planoB2bNaoEncontrado, 404);
    return data;
  }

  async obterPortalParceiro(
    parceiroId: string | null | undefined,
    perfilUsuario: FestaTipoPerfilEnum
  ): Promise<PortalParceiroB2bDto> {
    const idValido = validarParceiroIdObrigatorio(parceiroId);

    const [
      parceirosAdmin,
      planosRes,
      produtosRes,
      extrasRes,
      temasRes,
      todosEventos,
      operadores,
    ] = await Promise.all([
      this.listarParceirosAdmin(),
      supabaseAdmin
        .from(FESTA_TABLES.CATALOGO_PLANOS_B2B)
        .select("*")
        .order("ordem", { ascending: true }),
      supabaseAdmin
        .from(FESTA_TABLES.CATALOGO_PRODUTOS)
        .select("*")
        .eq("ativo", true)
        .eq("disponivel_b2b", true)
        .order("ordem", { ascending: true }),
      supabaseAdmin
        .from(FESTA_TABLES.CATALOGO_EXTRAS_B2C)
        .select("*")
        .eq("ativo", true)
        .eq("disponivel_b2b", true)
        .order("ordem", { ascending: true }),
      supabaseAdmin
        .from(FESTA_TABLES.TEMAS_CATALOGO)
        .select("*")
        .eq("ativo", true)
        .order("ordem", { ascending: true }),
      eventoService.listarEventosAdmin({
        incluir_demo: false,
      }),
      listarOperadoresParceiroB2b(idValido),
    ]);

    if (planosRes.error) throw new AppError(planosRes.error.message, 500);
    if (produtosRes.error) throw new AppError(produtosRes.error.message, 500);
    if (extrasRes.error) throw new AppError(extrasRes.error.message, 500);
    if (temasRes.error) throw new AppError(temasRes.error.message, 500);

    const parceiroAutenticado = parceirosAdmin.find((p) => p.id === idValido);
    if (!parceiroAutenticado) {
      throw new AppError(messages.parceiro.naoEncontrado, 404);
    }

    const eventosParceiro = todosEventos.filter(
      (ev) => ev.parceiro_id === parceiroAutenticado.id
    );

    const temasDisponiveis = (temasRes.data ?? []).filter(
      (tema) =>
        tema.publico || tema.parceiro_proprietario_id === parceiroAutenticado.id
    );

    return {
      parceiro: parceiroAutenticado,
      perfil_usuario: perfilUsuario,
      planos_b2b: planosRes.data ?? [],
      produtos_b2c: produtosRes.data ?? [],
      extras_b2c: extrasRes.data ?? [],
      eventos: eventosParceiro,
      temas: temasDisponiveis,
      operadores,
    };
  }

  async gerarLinkImpersonateAdmin(
    parceiroId: string
  ): Promise<ImpersonateParceiroResponseDto> {
    return gerarTokenImpersonateParceiroB2b(parceiroId);
  }

  async criarOperadorParceiro(
    parceiroId: string | null | undefined,
    input: CriarOperadorParceiroInput
  ): Promise<FestaUsuario> {
    const idValido = validarParceiroIdObrigatorio(parceiroId);
    return criarOperadorParceiroB2b(idValido, input);
  }

  async atualizarOperadorParceiro(
    parceiroId: string | null | undefined,
    operadorId: string,
    input: AtualizarOperadorParceiroInput
  ): Promise<FestaUsuario> {
    const idValido = validarParceiroIdObrigatorio(parceiroId);
    return atualizarOperadorParceiroB2b(idValido, operadorId, input);
  }

  async excluirOperadorParceiro(
    parceiroId: string | null | undefined,
    operadorId: string
  ): Promise<void> {
    const idValido = validarParceiroIdObrigatorio(parceiroId);
    return excluirOperadorParceiroB2b(idValido, operadorId);
  }

  async criarEventoComCreditoParceiro(
    parceiroId: string | null | undefined,
    input: CriarEventoParceiroB2bInput
  ): Promise<EventoAdminResponseDto> {
    const idValido = validarParceiroIdObrigatorio(parceiroId);
    const parceiro = await this.obterParceiroAdminPorId(idValido);

    const { adminInput, custoCreditos } =
      await montarInputEventoCreditoParceiroB2b(parceiro.id, input);

    if (parceiro.saldo_creditos < custoCreditos) {
      throw new AppError(
        `Saldo de créditos insuficiente. Necessário: ${custoCreditos} crédito(s); disponível: ${parceiro.saldo_creditos}.`,
        400
      );
    }

    const eventoCriado = await eventoService.criarEventoAdmin(adminInput);

    await supabaseAdmin.from(FESTA_TABLES.TRANSACOES_CREDITOS_B2B).insert({
      parceiro_id: parceiro.id,
      evento_id: eventoCriado.id,
      tipo: FESTA_TIPO_TRANSACAO_CREDITO.CONSUMO_EVENTO,
      quantidade: -custoCreditos,
      observacao: `Criação do evento "${eventoCriado.titulo}" (${custoCreditos} crédito(s))`,
    });

    await supabaseAdmin
      .from(FESTA_TABLES.PARCEIROS_B2B)
      .update({ saldo_creditos: parceiro.saldo_creditos - custoCreditos })
      .eq("id", parceiro.id);

    return eventoCriado;
  }

  async atualizarEventoComCreditoParceiro(
    parceiroId: string | null | undefined,
    eventoId: string,
    input: AtualizarEventoParceiroB2bInput
  ): Promise<EventoAdminResponseDto> {
    const idValido = validarParceiroIdObrigatorio(parceiroId);
    const [parceiro, eventoAtual] = await Promise.all([
      this.obterParceiroAdminPorId(idValido),
      eventoService.obterEventoAdminPorId(eventoId),
    ]);

    if (eventoAtual.parceiro_id !== parceiro.id) {
      throw new AppError(messages.auth.eventoNaoPertenceAoParceiro, 403);
    }

    const { adminInput, diferencaCreditos } =
      await montarInputAtualizacaoEventoParceiroB2b(eventoAtual, input);

    if (diferencaCreditos > 0 && parceiro.saldo_creditos < diferencaCreditos) {
      throw new AppError(
        `Saldo de créditos insuficiente para o upgrade. Necessário: +${diferencaCreditos} crédito(s); disponível: ${parceiro.saldo_creditos}.`,
        400
      );
    }

    const eventoAtualizado = await eventoService.atualizarEventoAdmin(
      eventoId,
      adminInput
    );

    if (diferencaCreditos > 0) {
      await supabaseAdmin.from(FESTA_TABLES.TRANSACOES_CREDITOS_B2B).insert({
        parceiro_id: parceiro.id,
        evento_id: eventoAtualizado.id,
        tipo: FESTA_TIPO_TRANSACAO_CREDITO.CONSUMO_EVENTO,
        quantidade: -diferencaCreditos,
        observacao: `Upgrade do evento "${eventoAtualizado.titulo}" (+${diferencaCreditos} crédito(s))`,
      });

      await supabaseAdmin
        .from(FESTA_TABLES.PARCEIROS_B2B)
        .update({ saldo_creditos: parceiro.saldo_creditos - diferencaCreditos })
        .eq("id", parceiro.id);
    }

    return eventoAtualizado;
  }
}

export const parceiroB2bService = new ParceiroB2bService();
