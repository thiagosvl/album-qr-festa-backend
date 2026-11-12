import { supabaseAdmin } from "../config/supabase.js";
import { FESTA_PACOTE_TIPO, FESTA_TABLES } from "../constants/festa.enum.js";
import { messages } from "../constants/messages.js";
import { AppError } from "../errors/AppError.js";
import type {
  AtualizarEventoAdminInput,
  CriarEventoAdminInput,
  FiltroListagemEventosInput,
  RegistrarPagamentoManualInput,
} from "../schemas/evento.schema.js";
import type {
  EventoAdminResponseDto,
  EventoPublicoResponseDto,
} from "../types/dtos/evento.dto.js";
import {
  calcularDataExpiracaoGaleria,
  calcularEfeitosExtrasEvento,
  calcularNovaBaixaPagamento,
  type EventoComRelacoesRow,
  limparArquivosERelacoesEvento,
  mapearEventoAdminDto,
  mapearEventoPublicoDto,
  sincronizarAnfitriaoEvento,
  substituirExtrasEvento,
} from "../utils/evento-calculos.helper.js";
import {
  buscarEventoPorIdentificadorPublico,
  gerarSlugEventoPorTitulo,
  obterMapaTotalConfirmadosEventos,
  resolverProdutosEvento,
  resolverStatusPedidoPosUpgrade,
  substituirProdutosEvento,
} from "../utils/evento-produtos.helper.js";
import { molduraService } from "./moldura.service.js";

const SELECT_EVENTO_ADMIN = `
  *,
  anfitriao:festa_usuarios(*),
  tema:festa_temas_catalogo(*),
  produtos:festa_evento_produtos(*),
  extras:festa_evento_extras(*),
  molduras:festa_evento_molduras(*)
`;

export class EventoService {
  async obterEventoPublicoPorSlug(slug: string): Promise<EventoPublicoResponseDto> {
    const evento = await buscarEventoPorIdentificadorPublico(slug);
    if (!evento) throw new AppError(messages.evento.naoEncontrado, 404);
    if (!evento.ativo) throw new AppError(messages.evento.inativo, 403);
    if (!evento.inclui_galeria) {
      throw new AppError(messages.evento.galeriaNaoContratada, 403);
    }

    const molduras = await molduraService.listarPorEvento(evento.id, true);
    return mapearEventoPublicoDto(evento, molduras);
  }

  async listarEventosAdmin(
    filtros: FiltroListagemEventosInput
  ): Promise<EventoAdminResponseDto[]> {
    let query = supabaseAdmin
      .from(FESTA_TABLES.EVENTOS)
      .select(SELECT_EVENTO_ADMIN)
      .order("created_at", { ascending: false });

    if (filtros.status_pedido) {
      query = query.eq("status_pedido", filtros.status_pedido);
    }

    if (filtros.incluir_demo === false) {
      query = query.eq("is_demo", false);
    }

    if (filtros.busca && filtros.busca.trim().length > 0) {
      const termo = `%${filtros.busca.trim()}%`;
      query = query.or(
        `titulo.ilike.${termo},slug.ilike.${termo},codigo_url.ilike.${termo},nome_aniversariante.ilike.${termo}`
      );
    }

    const { data, error } = await query;
    if (error) throw new AppError(error.message, 500);

    const rows = data as EventoComRelacoesRow[];
    const mapaConfirmados = await obterMapaTotalConfirmadosEventos(
      rows.map((r) => r.id)
    );

    return Promise.all(
      rows.map(async (item) => {
        const { count } = await supabaseAdmin
          .from(FESTA_TABLES.EVENTO_MIDIAS)
          .select("id", { count: "exact", head: true })
          .eq("evento_id", item.id);

        return mapearEventoAdminDto(
          item,
          count ?? 0,
          mapaConfirmados.get(item.id) ?? 0
        );
      })
    );
  }

  async obterEventoAdminPorId(id: string): Promise<EventoAdminResponseDto> {
    const { data: item, error } = await supabaseAdmin
      .from(FESTA_TABLES.EVENTOS)
      .select(SELECT_EVENTO_ADMIN)
      .eq("id", id)
      .maybeSingle();

    if (error) throw new AppError(error.message, 500);
    if (!item) throw new AppError(messages.evento.naoEncontrado, 404);

    const [{ count }, mapaConfirmados] = await Promise.all([
      supabaseAdmin
        .from(FESTA_TABLES.EVENTO_MIDIAS)
        .select("id", { count: "exact", head: true })
        .eq("evento_id", item.id),
      obterMapaTotalConfirmadosEventos([item.id]),
    ]);

    return mapearEventoAdminDto(
      item as EventoComRelacoesRow,
      count ?? 0,
      mapaConfirmados.get(item.id) ?? 0
    );
  }

  async criarEventoAdmin(input: CriarEventoAdminInput): Promise<EventoAdminResponseDto> {
    const [calculoProdutos, efeitos] = await Promise.all([
      resolverProdutosEvento(
        input.produtos,
        input.inclui_galeria,
        input.inclui_convite
      ),
      calcularEfeitosExtrasEvento(input.extras),
    ]);

    const valorPacoteCentavos =
      input.valor_pacote_centavos ?? calculoProdutos.valorProdutosCentavos;
    const descontoCentavos = input.desconto_centavos ?? 0;
    const valorTotalCentavos = Math.max(
      0,
      valorPacoteCentavos + efeitos.valorExtrasCentavos - descontoCentavos
    );
    const valorSinalCentavos =
      input.valor_sinal_centavos ?? Math.round(valorTotalCentavos / 2);

    const limiteMolduras =
      input.limite_molduras ??
      calculoProdutos.limiteMoldurasBase + efeitos.moldurasAdicionais;
    const incluiTelao = input.inclui_telao ?? efeitos.liberarTelao;
    const permiteVideo = input.permite_video ?? efeitos.liberarVideo;

    const expiraEm =
      input.expira_em ??
      calcularDataExpiracaoGaleria(
        input.data_evento,
        calculoProdutos.diasGaleriaBase + efeitos.diasGaleriaAdicionais
      );

    const anfitriaoId = await sincronizarAnfitriaoEvento(input.anfitriao, null);
    const {
      anfitriao: _anfitriao,
      produtos: _produtos,
      extras: _extras,
      slug: slugInput,
      ...camposEvento
    } = input;

    const slugResolvido = gerarSlugEventoPorTitulo(input.titulo, slugInput);

    const { data: eventoCriado, error: insertError } = await supabaseAdmin
      .from(FESTA_TABLES.EVENTOS)
      .insert({
        ...camposEvento,
        slug: slugResolvido,
        anfitriao_id: anfitriaoId,
        pacote: input.pacote ?? FESTA_PACOTE_TIPO.BASICO,
        inclui_galeria: calculoProdutos.incluiGaleria,
        inclui_convite: calculoProdutos.incluiConvite,
        creditos_b2b_consumidos:
          input.creditos_b2b_consumidos ??
          calculoProdutos.creditosProdutosB2b + efeitos.creditosExtrasB2b,
        valor_pacote_centavos: valorPacoteCentavos,
        valor_extras_centavos: efeitos.valorExtrasCentavos,
        desconto_centavos: descontoCentavos,
        valor_total_centavos: valorTotalCentavos,
        valor_sinal_centavos: valorSinalCentavos,
        valor_pago_centavos: input.valor_pago_centavos ?? 0,
        limite_molduras: limiteMolduras,
        inclui_telao: incluiTelao,
        permite_video: permiteVideo,
        expira_em: expiraEm,
      })
      .select("id")
      .single();

    if (insertError) throw insertError;

    await Promise.all([
      substituirProdutosEvento(
        eventoCriado.id,
        calculoProdutos.produtosNormalizados
      ),
      input.extras.length > 0
        ? substituirExtrasEvento(eventoCriado.id, input.extras)
        : Promise.resolve(),
    ]);

    return this.obterEventoAdminPorId(eventoCriado.id);
  }

  async atualizarEventoAdmin(
    id: string,
    input: AtualizarEventoAdminInput
  ): Promise<EventoAdminResponseDto> {
    const atual = await this.obterEventoAdminPorId(id);

    const novoAnfitriaoId = await sincronizarAnfitriaoEvento(
      input.anfitriao,
      atual.anfitriao_id
    );

    const listaExtrasParaCalculo =
      input.extras ??
      atual.extras.map((ex) => ({
        extra_id: ex.extra_id,
        nome: ex.nome,
        quantidade: ex.quantidade,
        preco_unitario_centavos: ex.preco_unitario_centavos,
        custo_creditos_b2b: ex.custo_creditos_b2b,
        entregue: ex.entregue,
      }));

    const [calculoProdutos, efeitos] = await Promise.all([
      resolverProdutosEvento(
        input.produtos,
        input.inclui_galeria,
        input.inclui_convite,
        atual.produtos
      ),
      calcularEfeitosExtrasEvento(listaExtrasParaCalculo),
    ]);

    const valorExtrasCentavos =
      input.extras !== undefined
        ? efeitos.valorExtrasCentavos
        : atual.valor_extras_centavos;

    await Promise.all([
      input.produtos !== undefined
        ? substituirProdutosEvento(id, calculoProdutos.produtosNormalizados)
        : Promise.resolve(),
      input.extras !== undefined
        ? substituirExtrasEvento(id, input.extras)
        : Promise.resolve(),
    ]);

    const recalcularRegras =
      input.produtos !== undefined || input.extras !== undefined;

    const limiteMolduras =
      input.limite_molduras ??
      (recalcularRegras
        ? calculoProdutos.limiteMoldurasBase + efeitos.moldurasAdicionais
        : atual.limite_molduras);

    const incluiTelao =
      input.inclui_telao ??
      (recalcularRegras ? efeitos.liberarTelao : atual.inclui_telao);

    const permiteVideo =
      input.permite_video ??
      (recalcularRegras ? efeitos.liberarVideo : atual.permite_video);

    const dataEventoAlvo =
      input.data_evento !== undefined ? input.data_evento : atual.data_evento;
    const expiraEm =
      input.expira_em !== undefined
        ? input.expira_em
        : recalcularRegras || input.data_evento !== undefined
          ? calcularDataExpiracaoGaleria(
              dataEventoAlvo,
              calculoProdutos.diasGaleriaBase + efeitos.diasGaleriaAdicionais
            )
          : atual.expira_em;

    const valorPacoteCentavos =
      input.valor_pacote_centavos ??
      (input.produtos !== undefined
        ? calculoProdutos.valorProdutosCentavos
        : atual.valor_pacote_centavos);
    const descontoCentavos = input.desconto_centavos ?? atual.desconto_centavos;
    const valorTotalCentavos = Math.max(
      0,
      valorPacoteCentavos + valorExtrasCentavos - descontoCentavos
    );
    const valorPagoAlvo = input.valor_pago_centavos ?? atual.valor_pago_centavos;
    const metodoPagamentoAlvo = input.metodo_pagamento ?? atual.metodo_pagamento;

    const novoStatusPedido = resolverStatusPedidoPosUpgrade(
      atual.status_pedido,
      input.status_pedido,
      valorTotalCentavos,
      valorPagoAlvo,
      metodoPagamentoAlvo
    );

    const {
      anfitriao: _anfitriao,
      produtos: _produtos,
      extras: _extras,
      slug: slugInput,
      ...camposTabela
    } = input;

    const slugAtualizado = slugInput
      ? gerarSlugEventoPorTitulo(input.titulo ?? atual.titulo, slugInput)
      : input.titulo && !atual.is_demo
        ? gerarSlugEventoPorTitulo(input.titulo)
        : atual.slug;

    const { error } = await supabaseAdmin
      .from(FESTA_TABLES.EVENTOS)
      .update({
        ...camposTabela,
        slug: slugAtualizado,
        anfitriao_id: novoAnfitriaoId,
        inclui_galeria: calculoProdutos.incluiGaleria,
        inclui_convite: calculoProdutos.incluiConvite,
        status_pedido: novoStatusPedido,
        limite_molduras: limiteMolduras,
        inclui_telao: incluiTelao,
        permite_video: permiteVideo,
        expira_em: expiraEm,
        valor_pacote_centavos: valorPacoteCentavos,
        valor_extras_centavos: valorExtrasCentavos,
        desconto_centavos: descontoCentavos,
        valor_total_centavos: valorTotalCentavos,
      })
      .eq("id", id);

    if (error) throw error;
    return this.obterEventoAdminPorId(id);
  }

  async registrarPagamentoManual(
    id: string,
    input: RegistrarPagamentoManualInput
  ): Promise<EventoAdminResponseDto> {
    const atual = await this.obterEventoAdminPorId(id);
    const { novoValorPago, novoStatus } = calcularNovaBaixaPagamento(atual, input);

    const { error } = await supabaseAdmin
      .from(FESTA_TABLES.EVENTOS)
      .update({
        valor_pago_centavos: novoValorPago,
        status_pedido: novoStatus,
        ...(input.metodo_pagamento ? { metodo_pagamento: input.metodo_pagamento } : {}),
        ...(input.observacoes_internas !== undefined
          ? { observacoes_internas: input.observacoes_internas }
          : {}),
      })
      .eq("id", id);

    if (error) throw new AppError(error.message, 400);
    return this.obterEventoAdminPorId(id);
  }

  async excluirEventoAdmin(id: string): Promise<void> {
    const atual = await this.obterEventoAdminPorId(id);
    if (atual.is_demo) {
      throw new AppError(messages.evento.eventoDemoProtegido, 400);
    }

    await limparArquivosERelacoesEvento(id);

    const { error } = await supabaseAdmin
      .from(FESTA_TABLES.EVENTOS)
      .delete()
      .eq("id", id);

    if (error) throw new AppError(error.message, 500);
  }
}

export const eventoService = new EventoService();
