import archiver from "archiver";
import type { FastifyReply } from "fastify";
import { Readable } from "stream";
import type { ReadableStream as WebReadableStream } from "stream/web";
import { getPublicStorageUrl, removerArquivosStorage } from "../config/r2.js";
import { supabaseAdmin } from "../config/supabase.js";
import {
  FESTA_STATUS_MODERACAO,
  FESTA_TABLES,
  FESTA_TIPO_MIDIA,
} from "../constants/festa.enum.js";
import { messages } from "../constants/messages.js";
import { AppError } from "../errors/AppError.js";
import type { RegistrarMidiaConvidadoInput } from "../schemas/midia.schema.js";
import type { FestaEventoMidia } from "../types/database.js";
import type {
  ItemManifestoDownloadDto,
  ListaMidiasPaginadaDto,
  MidiaResponseDto,
} from "../types/dtos/midia.dto.js";

export async function validarEventoParaEnvioMidia(
  slug: string,
  tipoMidia: RegistrarMidiaConvidadoInput["tipo_midia"]
) {
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

  if (tipoMidia === FESTA_TIPO_MIDIA.VIDEO && !evento.permite_video) {
    throw new AppError(messages.midia.videoNaoPermitido, 403);
  }

  return evento;
}

export function formatarMidiaDto(midia: FestaEventoMidia): MidiaResponseDto {
  const thumbPath = midia.thumb_path || midia.path.replace(/\.jpg$/i, "_t.jpg");

  return {
    ...midia,
    url_publica: getPublicStorageUrl(midia.path),
    url_miniatura: getPublicStorageUrl(thumbPath),
  };
}

export function montarListaMidiasPaginada(
  data: FestaEventoMidia[],
  limite: number
): ListaMidiasPaginadaDto {
  const temMais = data.length > limite;
  const recortados = temMais ? data.slice(0, limite) : data;
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

export async function removerMidiasEArquivosStorage(
  midias: FestaEventoMidia[]
): Promise<void> {
  if (midias.length === 0) return;

  const ids = midias.map((m) => m.id);
  const pathsParaRemover: string[] = [];

  for (const m of midias) {
    pathsParaRemover.push(m.path);
    const thumb = m.thumb_path || m.path.replace(/\.jpg$/i, "_t.jpg");
    if (thumb !== m.path) pathsParaRemover.push(thumb);
  }

  const { error } = await supabaseAdmin
    .from(FESTA_TABLES.EVENTO_MIDIAS)
    .delete()
    .in("id", ids);

  if (error) throw new AppError(error.message, 500);

  if (pathsParaRemover.length > 0) {
    await removerArquivosStorage(pathsParaRemover);
  }
}

export async function montarManifestoDownloadEvento(
  eventoId: string
): Promise<ItemManifestoDownloadDto[]> {
  const { data, error } = await supabaseAdmin
    .from(FESTA_TABLES.EVENTO_MIDIAS)
    .select("*")
    .eq("evento_id", eventoId)
    .eq("status_moderacao", FESTA_STATUS_MODERACAO.APROVADA)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });

  if (error) throw new AppError(error.message, 500);

  return data.map((midia, idx) => {
    const numero = String(idx + 1).padStart(3, "0");
    const sufixoAutor = midia.autor
      ? `-${midia.autor.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
      : "";
    const extensao =
      midia.tipo_midia === FESTA_TIPO_MIDIA.VIDEO ? "mp4" : "jpg";

    return {
      id: midia.id,
      nome_arquivo: `foto-${numero}${sufixoAutor}.${extensao}`,
      url_publica: getPublicStorageUrl(midia.path),
      autor: midia.autor,
      created_at: midia.created_at,
    };
  });
}

export async function escreverStreamZipMidiasEvento(
  eventoId: string,
  slugEvento: string,
  reply: FastifyReply
): Promise<void> {
  const manifesto = await montarManifestoDownloadEvento(eventoId);

  reply.raw.writeHead(200, {
    "Content-Type": "application/zip",
    "Content-Disposition": `attachment; filename="fotos-${slugEvento}.zip"`,
  });

  const archive = archiver("zip", { zlib: { level: 5 } });
  archive.pipe(reply.raw);

  for (const item of manifesto) {
    try {
      const res = await fetch(item.url_publica);
      if (res.ok && res.body) {
        const nodeStream = Readable.fromWeb(
          res.body as unknown as WebReadableStream
        );
        archive.append(nodeStream, { name: item.nome_arquivo });
      }
    } catch {
      continue;
    }
  }

  await archive.finalize();
}
