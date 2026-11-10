import { supabaseAdmin } from "../config/supabase.js";
import { FESTA_TABLES } from "../constants/festa.enum.js";
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
import { molduraService } from "./moldura.service.js";

const SELECT_EVENTO_ADMIN = `
  *,
  anfitriao:festa_usuarios(*),
  tema:festa_temas_catalogo(*),
  extras:festa_evento_extras(*),
  molduras:festa_evento_molduras(*)
`;

export class EventoService {
  async obterEventoPublicoPorSlug(slug: string): Promise<EventoPublicoResponseDto> {
    const { data: evento, error } = await supabaseAdmin
      .from(FESTA_TABLES.EVENTOS)
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw new AppError(error.message, 500);
    if (!evento) throw new AppError(messages.evento.naoEncontrado, 404);
    if (!evento.ativo) throw new AppError(messages.evento.inativo, 403);

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
        `titulo.ilike.${termo},slug.ilike.${termo},nome_aniversariante.ilike.${termo}`
      );
    }

    const { data, error } = await query;
    if (error) throw new AppError(error.message, 500);

    const rows = data as EventoComRelacoesRow[];
    return Promise.all(
      rows.map(async (item) => {
        const { count } = await supabaseAdmin
          .from(FESTA_TABLES.EVENTO_MIDIAS)
          .select("id", { count: "exact", head: true })
          .eq("evento_id", item.id);

        return mapearEventoAdminDto(item, count ?? 0);
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

    const { count } = await supabaseAdmin
      .from(FESTA_TABLES.EVENTO_MIDIAS)
      .select("id", { count: "exact", head: true })
      .eq("evento_id", item.id);

    return mapearEventoAdminDto(item as EventoComRelacoesRow, count ?? 0);
  }

  async criarEventoAdmin(input: CriarEventoAdminInput): Promise<EventoAdminResponseDto> {
    const { data: pacoteBase } = await supabaseAdmin
      .from(FESTA_TABLES.CATALOGO_PACOTES_B2C)
      .select("*")
      .eq("tipo_pacote", input.pacote)
      .maybeSingle();

    const efeitos = await calcularEfeitosExtrasEvento(input.extras);

    const valorPacoteCentavos =
      input.valor_pacote_centavos ?? pacoteBase?.preco_centavos ?? 0;
    const descontoCentavos = input.desconto_centavos ?? 0;
    const valorTotalCentavos = Math.max(
      0,
      valorPacoteCentavos + efeitos.valorExtrasCentavos - descontoCentavos
    );
    const valorSinalCentavos =
      input.valor_sinal_centavos ?? Math.round(valorTotalCentavos / 2);

    const limiteMoldurasBase = pacoteBase?.limite_molduras ?? 1;
    const limiteMolduras =
      input.limite_molduras ?? limiteMoldurasBase + efeitos.moldurasAdicionais;
    const incluiTelao =
      input.inclui_telao ?? (Boolean(pacoteBase?.inclui_telao) || efeitos.liberarTelao);
    const permiteVideo =
      input.permite_video ?? (Boolean(pacoteBase?.permite_video) || efeitos.liberarVideo);

    const diasGaleriaBase = pacoteBase?.dias_galeria_ativa ?? 90;
    const expiraEm =
      input.expira_em ??
      calcularDataExpiracaoGaleria(
        input.data_evento,
        diasGaleriaBase + efeitos.diasGaleriaAdicionais
      );

    const anfitriaoId = await sincronizarAnfitriaoEvento(input.anfitriao, null);

    const { data: eventoCriado, error: insertError } = await supabaseAdmin
      .from(FESTA_TABLES.EVENTOS)
      .insert({
        slug: input.slug,
        titulo: input.titulo,
        subtitulo: input.subtitulo ?? null,
        boas_vindas: input.boas_vindas ?? null,
        nome_aniversariante: input.nome_aniversariante ?? null,
        idade_aniversariante: input.idade_aniversariante ?? null,
        data_evento: input.data_evento ?? null,
        cor_primaria: input.cor_primaria,
        cor_secundaria: input.cor_secundaria,
        capa_url: input.capa_url ?? null,
        qr_code_pdf_url: input.qr_code_pdf_url ?? null,
        tema_id: input.tema_id ?? null,
        parceiro_id: input.parceiro_id ?? null,
        anfitriao_id: anfitriaoId,
        pacote: input.pacote,
        status_pedido: input.status_pedido,
        metodo_pagamento: input.metodo_pagamento,
        valor_pacote_centavos: valorPacoteCentavos,
        valor_extras_centavos: efeitos.valorExtrasCentavos,
        desconto_centavos: descontoCentavos,
        valor_total_centavos: valorTotalCentavos,
        valor_sinal_centavos: valorSinalCentavos,
        valor_pago_centavos: input.valor_pago_centavos ?? 0,
        observacoes_internas: input.observacoes_internas ?? null,
        limite_molduras: limiteMolduras,
        inclui_telao: incluiTelao,
        galeria_publica: input.galeria_publica,
        moderacao_previa: input.moderacao_previa,
        permite_envio_midias: input.permite_envio_midias,
        permite_video: permiteVideo,
        tempo_slideshow_segundos: input.tempo_slideshow_segundos,
        expira_em: expiraEm,
        ativo: input.ativo,
      })
      .select("id")
      .single();

    if (insertError) throw insertError;

    if (input.extras.length > 0) {
      await substituirExtrasEvento(eventoCriado.id, input.extras);
    }

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

    const pacoteAlvo = input.pacote ?? atual.pacote;
    const { data: pacoteBase } = await supabaseAdmin
      .from(FESTA_TABLES.CATALOGO_PACOTES_B2C)
      .select("*")
      .eq("tipo_pacote", pacoteAlvo)
      .maybeSingle();

    const listaExtrasParaCalculo =
      input.extras ??
      atual.extras.map((ex) => ({
        extra_id: ex.extra_id,
        nome: ex.nome,
        quantidade: ex.quantidade,
        preco_unitario_centavos: ex.preco_unitario_centavos,
        entregue: ex.entregue,
      }));

    const efeitos = await calcularEfeitosExtrasEvento(listaExtrasParaCalculo);
    const valorExtrasCentavos =
      input.extras !== undefined
        ? efeitos.valorExtrasCentavos
        : atual.valor_extras_centavos;

    if (input.extras !== undefined) {
      await substituirExtrasEvento(id, input.extras);
    }

    const recalcularRegrasPacoteOuExtras =
      input.pacote !== undefined || input.extras !== undefined;

    const limiteMolduras =
      input.limite_molduras ??
      (recalcularRegrasPacoteOuExtras
        ? (pacoteBase?.limite_molduras ?? 1) + efeitos.moldurasAdicionais
        : atual.limite_molduras);

    const incluiTelao =
      input.inclui_telao ??
      (recalcularRegrasPacoteOuExtras
        ? Boolean(pacoteBase?.inclui_telao) || efeitos.liberarTelao
        : atual.inclui_telao);

    const permiteVideo =
      input.permite_video ??
      (recalcularRegrasPacoteOuExtras
        ? Boolean(pacoteBase?.permite_video) || efeitos.liberarVideo
        : atual.permite_video);

    const dataEventoAlvo =
      input.data_evento !== undefined ? input.data_evento : atual.data_evento;
    const expiraEm =
      input.expira_em !== undefined
        ? input.expira_em
        : recalcularRegrasPacoteOuExtras || input.data_evento !== undefined
          ? calcularDataExpiracaoGaleria(
              dataEventoAlvo,
              (pacoteBase?.dias_galeria_ativa ?? 90) +
                efeitos.diasGaleriaAdicionais
            )
          : atual.expira_em;

    const valorPacoteCentavos = input.valor_pacote_centavos ?? atual.valor_pacote_centavos;
    const descontoCentavos = input.desconto_centavos ?? atual.desconto_centavos;
    const valorTotalCentavos = Math.max(
      0,
      valorPacoteCentavos + valorExtrasCentavos - descontoCentavos
    );

    const { anfitriao: _anfitriao, extras: _extras, ...camposTabela } = input;

    const { error } = await supabaseAdmin
      .from(FESTA_TABLES.EVENTOS)
      .update({
        ...camposTabela,
        anfitriao_id: novoAnfitriaoId,
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
