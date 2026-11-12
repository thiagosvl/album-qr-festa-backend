import { getPublicStorageUrl, removerArquivosStorage } from "../config/r2.js";
import { supabaseAdmin } from "../config/supabase.js";
import { FESTA_TABLES } from "../constants/festa.enum.js";
import { messages } from "../constants/messages.js";
import { AppError } from "../errors/AppError.js";
import type {
  AtualizarMolduraEventoInput,
  CriarMolduraEventoInput,
  ReordenarMoldurasInput,
} from "../schemas/moldura.schema.js";
import type { FestaEventoMoldura } from "../types/database.js";
import type { MolduraResponseDto } from "../types/dtos/moldura.dto.js";
import { gestaoEventoService } from "./gestao-evento.service.js";

export function formatarMolduraDto(moldura: FestaEventoMoldura): MolduraResponseDto {
  const isDirectUrl =
    moldura.arquivo_path.startsWith("http://") ||
    moldura.arquivo_path.startsWith("https://") ||
    moldura.arquivo_path.startsWith("/");

  return {
    ...moldura,
    arquivo_url: isDirectUrl
      ? moldura.arquivo_path
      : getPublicStorageUrl(moldura.arquivo_path),
  };
}

export class MolduraService {
  async listarPorEvento(
    eventoId: string,
    apenasAtivas = false
  ): Promise<MolduraResponseDto[]> {
    let query = supabaseAdmin
      .from(FESTA_TABLES.EVENTO_MOLDURAS)
      .select("*")
      .eq("evento_id", eventoId)
      .order("ordem", { ascending: true })
      .order("created_at", { ascending: true });

    if (apenasAtivas) {
      query = query.eq("ativa", true);
    }

    const { data, error } = await query;
    if (error) throw new AppError(error.message, 500);

    return data.map(formatarMolduraDto);
  }

  async criarMoldura(
    eventoId: string,
    input: CriarMolduraEventoInput
  ): Promise<MolduraResponseDto> {
    const { data: evento, error: eventoError } = await supabaseAdmin
      .from(FESTA_TABLES.EVENTOS)
      .select("id, limite_molduras")
      .eq("id", eventoId)
      .maybeSingle();

    if (eventoError) throw new AppError(eventoError.message, 500);
    if (!evento) throw new AppError(messages.evento.naoEncontrado, 404);

    if (input.ativa) {
      const { count, error: countError } = await supabaseAdmin
        .from(FESTA_TABLES.EVENTO_MOLDURAS)
        .select("id", { count: "exact", head: true })
        .eq("evento_id", eventoId)
        .eq("ativa", true);

      if (countError) throw new AppError(countError.message, 500);
      if ((count ?? 0) >= evento.limite_molduras) {
        throw new AppError(messages.moldura.limiteAtingido, 400);
      }
    }

    const { data, error } = await supabaseAdmin
      .from(FESTA_TABLES.EVENTO_MOLDURAS)
      .insert({
        evento_id: eventoId,
        nome: input.nome,
        arquivo_path: input.arquivo_path,
        ordem: input.ordem,
        ativa: input.ativa,
      })
      .select("*")
      .single();

    if (error) throw new AppError(error.message, 400);
    return formatarMolduraDto(data);
  }

  async atualizarMoldura(
    eventoId: string,
    molduraId: string,
    input: AtualizarMolduraEventoInput
  ): Promise<MolduraResponseDto> {
    const { data: atual, error: atualError } = await supabaseAdmin
      .from(FESTA_TABLES.EVENTO_MOLDURAS)
      .select("*")
      .eq("id", molduraId)
      .eq("evento_id", eventoId)
      .maybeSingle();

    if (atualError) throw new AppError(atualError.message, 500);
    if (!atual) throw new AppError(messages.moldura.naoEncontrada, 404);

    if (input.ativa === true && !atual.ativa) {
      const { data: evento } = await supabaseAdmin
        .from(FESTA_TABLES.EVENTOS)
        .select("limite_molduras")
        .eq("id", eventoId)
        .single();

      const { count } = await supabaseAdmin
        .from(FESTA_TABLES.EVENTO_MOLDURAS)
        .select("id", { count: "exact", head: true })
        .eq("evento_id", eventoId)
        .eq("ativa", true);

      if (evento && (count ?? 0) >= evento.limite_molduras) {
        throw new AppError(messages.moldura.limiteAtingido, 400);
      }
    }

    const { data, error } = await supabaseAdmin
      .from(FESTA_TABLES.EVENTO_MOLDURAS)
      .update(input)
      .eq("id", molduraId)
      .eq("evento_id", eventoId)
      .select("*")
      .single();

    if (error) throw new AppError(error.message, 400);
    return formatarMolduraDto(data);
  }

  async reordenarMolduras(
    eventoId: string,
    input: ReordenarMoldurasInput
  ): Promise<MolduraResponseDto[]> {
    await Promise.all(
      input.ordens.map((item) =>
        supabaseAdmin
          .from(FESTA_TABLES.EVENTO_MOLDURAS)
          .update({ ordem: item.ordem })
          .eq("id", item.id)
          .eq("evento_id", eventoId)
      )
    );

    return this.listarPorEvento(eventoId, false);
  }

  async excluirMoldura(eventoId: string, molduraId: string): Promise<void> {
    const { data: moldura, error: findError } = await supabaseAdmin
      .from(FESTA_TABLES.EVENTO_MOLDURAS)
      .select("*")
      .eq("id", molduraId)
      .eq("evento_id", eventoId)
      .maybeSingle();

    if (findError) throw new AppError(findError.message, 500);
    if (!moldura) throw new AppError(messages.moldura.naoEncontrada, 404);

    await supabaseAdmin
      .from(FESTA_TABLES.EVENTO_MIDIAS)
      .update({ moldura_id: null })
      .eq("moldura_id", molduraId);

    const { error: deleteError } = await supabaseAdmin
      .from(FESTA_TABLES.EVENTO_MOLDURAS)
      .delete()
      .eq("id", molduraId)
      .eq("evento_id", eventoId);

    if (deleteError) throw new AppError(deleteError.message, 500);

    const isStoragePath =
      !moldura.arquivo_path.startsWith("http") && !moldura.arquivo_path.startsWith("/");
    if (isStoragePath) {
      await removerArquivosStorage([moldura.arquivo_path]);
    }
  }

  async listarPorTokenGestao(token: string): Promise<MolduraResponseDto[]> {
    const evento = await gestaoEventoService.validarTokenGestao(token);
    return this.listarPorEvento(evento.id, false);
  }

  async criarMolduraPorTokenGestao(
    token: string,
    input: CriarMolduraEventoInput
  ): Promise<MolduraResponseDto> {
    const evento = await gestaoEventoService.validarTokenGestao(token);
    return this.criarMoldura(evento.id, input);
  }

  async atualizarMolduraPorTokenGestao(
    token: string,
    molduraId: string,
    input: AtualizarMolduraEventoInput
  ): Promise<MolduraResponseDto> {
    const evento = await gestaoEventoService.validarTokenGestao(token);
    return this.atualizarMoldura(evento.id, molduraId, input);
  }

  async reordenarMoldurasPorTokenGestao(
    token: string,
    input: ReordenarMoldurasInput
  ): Promise<MolduraResponseDto[]> {
    const evento = await gestaoEventoService.validarTokenGestao(token);
    return this.reordenarMolduras(evento.id, input);
  }

  async excluirMolduraPorTokenGestao(
    token: string,
    molduraId: string
  ): Promise<void> {
    const evento = await gestaoEventoService.validarTokenGestao(token);
    return this.excluirMoldura(evento.id, molduraId);
  }
}

export const molduraService = new MolduraService();
