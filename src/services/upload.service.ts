import { getPublicStorageUrl, gerarUrlUploadAssinada } from "../config/r2.js";
import { supabaseAdmin } from "../config/supabase.js";
import { FESTA_TABLES } from "../constants/festa.enum.js";
import { messages } from "../constants/messages.js";
import { AppError } from "../errors/AppError.js";
import {
  UPLOAD_LIMITE_BYTES_IMAGEM,
  UPLOAD_TIPOS_PERMITIDOS,
  type SolicitarUploadInput,
} from "../schemas/upload.schema.js";

export const PREFIXOS_UPLOAD_AUTENTICADO = ["parceiros", "catalogo"] as const;

export interface UploadAssinadoDto {
  upload_url: string;
  public_url: string;
  path: string;
  content_type: string;
}

function validarArquivo(input: SolicitarUploadInput): void {
  const extensao = input.path.split(".").pop()?.toLowerCase() ?? "";
  const extensoesPermitidas: readonly string[] =
    UPLOAD_TIPOS_PERMITIDOS[input.content_type];

  if (!extensoesPermitidas.includes(extensao)) {
    throw new AppError(messages.upload.tipoInvalido, 400);
  }

  const ehVideo = input.content_type.startsWith("video/");
  if (!ehVideo && input.tamanho_bytes > UPLOAD_LIMITE_BYTES_IMAGEM) {
    throw new AppError(messages.upload.arquivoGrande, 400);
  }
}

async function gerarUploadAssinado(
  input: SolicitarUploadInput
): Promise<UploadAssinadoDto> {
  const uploadUrl = await gerarUrlUploadAssinada(input.path, input.content_type);
  return {
    upload_url: uploadUrl,
    public_url: getPublicStorageUrl(input.path),
    path: input.path,
    content_type: input.content_type,
  };
}

export class UploadService {
  async solicitarUploadEvento(
    input: SolicitarUploadInput
  ): Promise<UploadAssinadoDto> {
    validarArquivo(input);

    const [slug] = input.path.split("/");
    if ((PREFIXOS_UPLOAD_AUTENTICADO as readonly string[]).includes(slug)) {
      throw new AppError(messages.upload.caminhoNaoPermitido, 403);
    }

    const { data: evento, error } = await supabaseAdmin
      .from(FESTA_TABLES.EVENTOS)
      .select("id, ativo")
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw new AppError(error.message, 500);
    if (!evento) throw new AppError(messages.evento.naoEncontrado, 404);
    if (!evento.ativo) throw new AppError(messages.evento.inativo, 403);

    return gerarUploadAssinado(input);
  }

  async solicitarUploadAutenticado(
    input: SolicitarUploadInput
  ): Promise<UploadAssinadoDto> {
    validarArquivo(input);

    const [prefixo] = input.path.split("/");
    if (!(PREFIXOS_UPLOAD_AUTENTICADO as readonly string[]).includes(prefixo)) {
      throw new AppError(messages.upload.caminhoNaoPermitido, 403);
    }

    return gerarUploadAssinado(input);
  }
}

export const uploadService = new UploadService();
