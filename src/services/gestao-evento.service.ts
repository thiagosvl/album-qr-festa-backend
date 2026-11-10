import { supabaseAdmin } from "../config/supabase.js";
import {
  FESTA_STATUS_MODERACAO,
  FESTA_STATUS_PEDIDO,
  FESTA_TABLES,
} from "../constants/festa.enum.js";
import { messages } from "../constants/messages.js";
import { AppError } from "../errors/AppError.js";
import type { AtualizarBriefingPaiInput } from "../schemas/gestao.schema.js";
import type { FestaEvento, FestaEventoExtra } from "../types/database.js";
import type { EventoGestaoResponseDto } from "../types/dtos/evento.dto.js";
import {
  calcularDataExpiracaoGaleria,
  calcularEfeitosExtrasEvento,
} from "../utils/evento-calculos.helper.js";
import { formatarMolduraDto } from "./moldura.service.js";

export class GestaoEventoService {
  async validarTokenGestao(token: string): Promise<FestaEvento> {
    const { data: evento, error } = await supabaseAdmin
      .from(FESTA_TABLES.EVENTOS)
      .select("*")
      .eq("token_gestao", token)
      .maybeSingle();

    if (error) throw new AppError(error.message, 500);
    if (!evento) throw new AppError(messages.evento.tokenGestaoInvalido, 404);
    return evento;
  }

  async obterPorTokenGestao(token: string): Promise<EventoGestaoResponseDto> {
    const { data: item, error } = await supabaseAdmin
      .from(FESTA_TABLES.EVENTOS)
      .select(
        `
        *,
        anfitriao:festa_usuarios(id, nome, telefone, email),
        extras:festa_evento_extras(*),
        molduras:festa_evento_molduras(*)
      `
      )
      .eq("token_gestao", token)
      .maybeSingle();

    if (error) throw new AppError(error.message, 500);
    if (!item) throw new AppError(messages.evento.tokenGestaoInvalido, 404);

    const [aprovadasRes, pendentesRes, ocultasRes] = await Promise.all([
      supabaseAdmin
        .from(FESTA_TABLES.EVENTO_MIDIAS)
        .select("id", { count: "exact", head: true })
        .eq("evento_id", item.id)
        .eq("status_moderacao", FESTA_STATUS_MODERACAO.APROVADA),
      supabaseAdmin
        .from(FESTA_TABLES.EVENTO_MIDIAS)
        .select("id", { count: "exact", head: true })
        .eq("evento_id", item.id)
        .eq("status_moderacao", FESTA_STATUS_MODERACAO.PENDENTE),
      supabaseAdmin
        .from(FESTA_TABLES.EVENTO_MIDIAS)
        .select("id", { count: "exact", head: true })
        .eq("evento_id", item.id)
        .eq("status_moderacao", FESTA_STATUS_MODERACAO.OCULTA),
    ]);

    const aprovadas = aprovadasRes.count ?? 0;
    const pendentes = pendentesRes.count ?? 0;
    const ocultas = ocultasRes.count ?? 0;

    const anfitriao = item.anfitriao ?? null;
    const extras = item.extras ?? [];
    const molduras = [...(item.molduras ?? [])]
      .sort((a, b) => a.ordem - b.ordem)
      .map(formatarMolduraDto);

    const {
      anfitriao: _anf,
      extras: _ext,
      molduras: _mold,
      ...eventoPuro
    } = item;

    return {
      evento: eventoPuro,
      anfitriao,
      extras,
      molduras,
      resumo_midias: {
        total: aprovadas + pendentes + ocultas,
        aprovadas,
        pendentes,
        ocultas,
      },
      valor_restante_centavos: Math.max(
        0,
        eventoPuro.valor_total_centavos - eventoPuro.valor_pago_centavos
      ),
    };
  }

  async atualizarBriefingPorToken(
    token: string,
    input: AtualizarBriefingPaiInput
  ): Promise<EventoGestaoResponseDto> {
    const evento = await this.validarTokenGestao(token);

    let novaExpiracao: string | undefined;
    if (input.data_evento !== undefined && input.data_evento !== evento.data_evento) {
      const [{ data: pacoteBase }, { data: extrasContratados }] = await Promise.all([
        supabaseAdmin
          .from(FESTA_TABLES.CATALOGO_PACOTES_B2C)
          .select("dias_galeria_ativa")
          .eq("tipo_pacote", evento.pacote)
          .maybeSingle(),
        supabaseAdmin
          .from(FESTA_TABLES.EVENTO_EXTRAS)
          .select("extra_id, nome, quantidade, preco_unitario_centavos, entregue")
          .eq("evento_id", evento.id),
      ]);

      const efeitos = await calcularEfeitosExtrasEvento(extrasContratados ?? []);
      const diasTotais =
        (pacoteBase?.dias_galeria_ativa ?? 90) + efeitos.diasGaleriaAdicionais;
      novaExpiracao = calcularDataExpiracaoGaleria(input.data_evento, diasTotais);
    }

    const deveAvancarStatus =
      (evento.status_pedido === FESTA_STATUS_PEDIDO.SINAL_PAGO ||
        evento.status_pedido === FESTA_STATUS_PEDIDO.AGUARDANDO_BRIEFING) &&
      Boolean(input.titulo || input.nome_aniversariante || input.data_evento);

    const { error } = await supabaseAdmin
      .from(FESTA_TABLES.EVENTOS)
      .update({
        ...input,
        ...(novaExpiracao !== undefined ? { expira_em: novaExpiracao } : {}),
        ...(deveAvancarStatus ? { status_pedido: FESTA_STATUS_PEDIDO.EM_MONTAGEM } : {}),
      })
      .eq("id", evento.id);

    if (error) throw new AppError(error.message, 400);
    return this.obterPorTokenGestao(token);
  }

  async alternarExtraEntregue(
    eventoId: string,
    extraEventoId: string,
    entregue: boolean
  ): Promise<FestaEventoExtra> {
    const { data, error } = await supabaseAdmin
      .from(FESTA_TABLES.EVENTO_EXTRAS)
      .update({ entregue })
      .eq("id", extraEventoId)
      .eq("evento_id", eventoId)
      .select("*")
      .maybeSingle();

    if (error) throw new AppError(error.message, 400);
    if (!data) throw new AppError(messages.catalogo.extraNaoEncontrado, 404);
    return data;
  }
}

export const gestaoEventoService = new GestaoEventoService();
