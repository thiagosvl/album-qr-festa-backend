import type { FastifyReply } from "fastify";
import { supabaseAdmin } from "../config/supabase.js";
import {
  FESTA_RPC,
  FESTA_STATUS_MODERACAO,
  FESTA_TABLES,
  FESTA_TIPO_MIDIA,
  FESTA_VARIACAO_CURTIDA,
  type FestaVariacaoCurtida,
} from "../constants/festa.enum.js";
import { messages } from "../constants/messages.js";
import { AppError } from "../errors/AppError.js";
import type {
  ListagemMidiasGestaoQuery,
  ListagemMidiasPublicaQuery,
  ModerarMidiaInput,
  ModerarMidiasEmLoteInput,
  RegistrarMidiaConvidadoInput,
} from "../schemas/midia.schema.js";
import type {
  ItemManifestoDownloadDto,
  ListaMidiasPaginadaDto,
  MidiaResponseDto,
} from "../types/dtos/midia.dto.js";
import {
  escreverStreamZipMidiasEvento,
  formatarMidiaDto,
  montarManifestoDownloadEvento,
  removerMidiasEArquivosStorage,
} from "../utils/midia-storage.helper.js";

export { formatarMidiaDto };

export class MidiaService {
  async listarMidiasPublicasPorSlug(
    slug: string,
    query: ListagemMidiasPublicaQuery
  ): Promise<ListaMidiasPaginadaDto> {
    const { data: evento, error: evError } = await supabaseAdmin
      .from(FESTA_TABLES.EVENTOS)
      .select("id, ativo, galeria_publica, is_demo, expira_em")
      .eq("slug", slug)
      .maybeSingle();

    if (evError) throw new AppError(evError.message, 500);
    if (!evento) throw new AppError(messages.evento.naoEncontrado, 404);
    if (!evento.ativo) throw new AppError(messages.evento.inativo, 403);

    if (evento.expira_em && new Date(evento.expira_em).getTime() < Date.now()) {
      return { itens: [], proximo_cursor: null, tem_mais: false };
    }

    if (!evento.galeria_publica && !query.sessao_id) {
      return { itens: [], proximo_cursor: null, tem_mais: false };
    }

    let dbQuery = supabaseAdmin
      .from(FESTA_TABLES.EVENTO_MIDIAS)
      .select("*")
      .eq("evento_id", evento.id)
      .eq("status_moderacao", FESTA_STATUS_MODERACAO.APROVADA)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(query.limite + 1);

    if (!evento.galeria_publica && query.sessao_id) {
      dbQuery = dbQuery.eq("sessao_id", query.sessao_id);
    } else if (evento.is_demo) {
      if (query.sessao_id) {
        dbQuery = dbQuery.or(
          `fixada_demo.eq.true,sessao_id.eq.${query.sessao_id}`
        );
      } else {
        dbQuery = dbQuery.eq("fixada_demo", true);
      }
    }

    if (query.cursor) {
      dbQuery = dbQuery.lt("created_at", query.cursor);
    }

    const { data, error } = await dbQuery;
    if (error) throw new AppError(error.message, 500);

    const temMais = data.length > query.limite;
    const recortados = temMais ? data.slice(0, query.limite) : data;
    const proximoCursor =
      temMais && recortados.length > 0
        ? recortados[recortados.length - 1].created_at
        : null;

    return {
      itens: recortados.map(formatarMidiaDto),
      proximo_cursor: proximoCursor,
      tem_mais: temMais,
    };
  }

  async registrarMidiaConvidado(
    slug: string,
    input: RegistrarMidiaConvidadoInput
  ): Promise<MidiaResponseDto> {
    const { data: evento, error: evError } = await supabaseAdmin
      .from(FESTA_TABLES.EVENTOS)
      .select(
        "id, ativo, permite_envio_midias, permite_video, moderacao_previa, expira_em"
      )
      .eq("slug", slug)
      .maybeSingle();

    if (evError) throw new AppError(evError.message, 500);
    if (!evento) throw new AppError(messages.evento.naoEncontrado, 404);
    if (!evento.ativo) throw new AppError(messages.evento.inativo, 403);

    if (evento.expira_em && new Date(evento.expira_em).getTime() < Date.now()) {
      throw new AppError(messages.evento.expirado, 403);
    }

    if (!evento.permite_envio_midias) {
      throw new AppError(messages.evento.envioBloqueado, 403);
    }

    if (input.tipo_midia === FESTA_TIPO_MIDIA.VIDEO && !evento.permite_video) {
      throw new AppError(messages.midia.videoNaoPermitido, 403);
    }

    const statusModeracao = evento.moderacao_previa
      ? FESTA_STATUS_MODERACAO.PENDENTE
      : FESTA_STATUS_MODERACAO.APROVADA;

    const thumbPath = input.thumb_path ?? input.path.replace(/\.jpg$/i, "_t.jpg");

    const { data, error } = await supabaseAdmin
      .from(FESTA_TABLES.EVENTO_MIDIAS)
      .insert({
        ...(input.id ? { id: input.id } : {}),
        evento_id: evento.id,
        moldura_id: input.moldura_id ?? null,
        tipo_midia: input.tipo_midia,
        path: input.path,
        thumb_path: thumbPath,
        autor: input.autor ?? null,
        duracao_segundos: input.duracao_segundos ?? null,
        tamanho_bytes: input.tamanho_bytes ?? null,
        status_moderacao: statusModeracao,
        sessao_id: input.sessao_id ?? null,
        fixada_demo: false,
      })
      .select("*")
      .single();

    if (error) throw new AppError(error.message, 400);
    return formatarMidiaDto(data);
  }

  async curtirMidiaPublica(midiaId: string): Promise<MidiaResponseDto> {
    return this.ajustarCurtidas(midiaId, FESTA_VARIACAO_CURTIDA.CURTIR);
  }

  async descurtirMidiaPublica(midiaId: string): Promise<MidiaResponseDto> {
    return this.ajustarCurtidas(midiaId, FESTA_VARIACAO_CURTIDA.DESCURTIR);
  }

  private async ajustarCurtidas(
    midiaId: string,
    variacao: FestaVariacaoCurtida
  ): Promise<MidiaResponseDto> {
    const { data, error } = await supabaseAdmin.rpc(
      FESTA_RPC.AJUSTAR_CURTIDAS_MIDIA,
      { p_midia_id: midiaId, p_variacao: variacao }
    );

    if (error) throw new AppError(error.message, 500);
    if (!data?.id) throw new AppError(messages.midia.naoEncontrada, 404);

    return formatarMidiaDto(data);
  }

  async excluirMidiaPropriaConvidado(
    slug: string,
    midiaId: string,
    sessaoId: string
  ): Promise<void> {
    const { data: evento } = await supabaseAdmin
      .from(FESTA_TABLES.EVENTOS)
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!evento) throw new AppError(messages.evento.naoEncontrado, 404);

    const { data: midia, error } = await supabaseAdmin
      .from(FESTA_TABLES.EVENTO_MIDIAS)
      .select("*")
      .eq("id", midiaId)
      .eq("evento_id", evento.id)
      .maybeSingle();

    if (error) throw new AppError(error.message, 500);
    if (!midia) throw new AppError(messages.midia.naoEncontrada, 404);

    if (!midia.sessao_id || midia.sessao_id !== sessaoId || midia.fixada_demo) {
      throw new AppError(messages.midia.semPermissaoExclusao, 403);
    }

    await removerMidiasEArquivosStorage([midia]);
  }

  async listarMidiasGestao(
    eventoId: string,
    query: ListagemMidiasGestaoQuery
  ): Promise<ListaMidiasPaginadaDto> {
    let dbQuery = supabaseAdmin
      .from(FESTA_TABLES.EVENTO_MIDIAS)
      .select("*")
      .eq("evento_id", eventoId)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(query.limite + 1);

    if (query.status_moderacao) {
      dbQuery = dbQuery.eq("status_moderacao", query.status_moderacao);
    }

    if (query.cursor) {
      dbQuery = dbQuery.lt("created_at", query.cursor);
    }

    const { data, error } = await dbQuery;
    if (error) throw new AppError(error.message, 500);

    const temMais = data.length > query.limite;
    const recortados = temMais ? data.slice(0, query.limite) : data;
    const proximoCursor =
      temMais && recortados.length > 0
        ? recortados[recortados.length - 1].created_at
        : null;

    return {
      itens: recortados.map(formatarMidiaDto),
      proximo_cursor: proximoCursor,
      tem_mais: temMais,
    };
  }

  async moderarMidia(
    eventoId: string,
    midiaId: string,
    input: ModerarMidiaInput
  ): Promise<MidiaResponseDto> {
    const updatePayload: {
      status_moderacao?: ModerarMidiaInput["status_moderacao"];
      fixada_demo?: boolean;
    } = {};

    if (input.status_moderacao !== undefined) {
      updatePayload.status_moderacao = input.status_moderacao;
    }
    if (input.fixada_demo !== undefined) {
      updatePayload.fixada_demo = input.fixada_demo;
    }

    if (Object.keys(updatePayload).length === 0) {
      const { data: existente, error: findErr } = await supabaseAdmin
        .from(FESTA_TABLES.EVENTO_MIDIAS)
        .select("*")
        .eq("id", midiaId)
        .eq("evento_id", eventoId)
        .maybeSingle();

      if (findErr) throw new AppError(findErr.message, 400);
      if (!existente) throw new AppError(messages.midia.naoEncontrada, 404);
      return formatarMidiaDto(existente);
    }

    const { data, error } = await supabaseAdmin
      .from(FESTA_TABLES.EVENTO_MIDIAS)
      .update(updatePayload)
      .eq("id", midiaId)
      .eq("evento_id", eventoId)
      .select("*")
      .maybeSingle();

    if (error) throw new AppError(error.message, 400);
    if (!data) throw new AppError(messages.midia.naoEncontrada, 404);

    return formatarMidiaDto(data);
  }

  async moderarMidiasEmLote(
    eventoId: string,
    input: ModerarMidiasEmLoteInput
  ): Promise<number> {
    const { data, error } = await supabaseAdmin
      .from(FESTA_TABLES.EVENTO_MIDIAS)
      .update({ status_moderacao: input.status_moderacao })
      .eq("evento_id", eventoId)
      .in("id", input.midia_ids)
      .select("id");

    if (error) throw new AppError(error.message, 400);
    return data.length;
  }

  async excluirMidiaGestao(eventoId: string, midiaId: string): Promise<void> {
    const { data: midia, error } = await supabaseAdmin
      .from(FESTA_TABLES.EVENTO_MIDIAS)
      .select("*")
      .eq("id", midiaId)
      .eq("evento_id", eventoId)
      .maybeSingle();

    if (error) throw new AppError(error.message, 500);
    if (!midia) throw new AppError(messages.midia.naoEncontrada, 404);

    await removerMidiasEArquivosStorage([midia]);
  }

  async limparMidiasNaoFixadas(eventoId: string): Promise<number> {
    const { data: midias, error } = await supabaseAdmin
      .from(FESTA_TABLES.EVENTO_MIDIAS)
      .select("*")
      .eq("evento_id", eventoId)
      .eq("fixada_demo", false);

    if (error) throw new AppError(error.message, 500);
    if (!midias || midias.length === 0) return 0;

    await removerMidiasEArquivosStorage(midias);
    return midias.length;
  }

  async obterManifestoDownload(
    eventoId: string
  ): Promise<ItemManifestoDownloadDto[]> {
    return montarManifestoDownloadEvento(eventoId);
  }

  async gerarStreamZipMidias(
    eventoId: string,
    slugEvento: string,
    reply: FastifyReply
  ): Promise<void> {
    return escreverStreamZipMidiasEvento(eventoId, slugEvento, reply);
  }
}

export const midiaService = new MidiaService();
