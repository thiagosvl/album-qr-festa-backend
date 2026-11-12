import {
  DeleteObjectsCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "./env.js";
import { logger } from "./logger.js";

const r2Endpoint =
  env.R2_ENDPOINT.trim() ||
  (env.R2_ACCOUNT_ID.trim()
    ? `https://${env.R2_ACCOUNT_ID.trim()}.r2.cloudflarestorage.com`
    : "");

if (
  !r2Endpoint ||
  !env.R2_ACCESS_KEY_ID.trim() ||
  !env.R2_SECRET_ACCESS_KEY.trim() ||
  !env.R2_PUBLIC_URL.trim()
) {
  logger.warn(
    "Cloudflare R2 incompleto: configure R2_ENDPOINT (ou R2_ACCOUNT_ID), R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY e R2_PUBLIC_URL no .env."
  );
}

const r2Client = new S3Client({
  region: env.R2_REGION || "auto",
  endpoint: r2Endpoint || undefined,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID.trim(),
    secretAccessKey: env.R2_SECRET_ACCESS_KEY.trim(),
  },
});

const URL_PRESIGN_EXPIRA_SEGUNDOS = 600;
const LIMITE_DELETE_POR_LOTE = 1000;

export function getPublicStorageUrl(path: string): string {
  const base = env.R2_PUBLIC_URL.trim().replace(/\/+$/, "");
  const chave = path.replace(/^\/+/, "");
  return `${base}/${chave}`;
}

export async function gerarUrlUploadAssinada(
  path: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET,
    Key: path,
    ContentType: contentType,
  });
  return getSignedUrl(r2Client, command, {
    expiresIn: URL_PRESIGN_EXPIRA_SEGUNDOS,
  });
}

export async function removerArquivosStorage(paths: string[]): Promise<void> {
  const unicos = [...new Set(paths.filter(Boolean))];
  for (let i = 0; i < unicos.length; i += LIMITE_DELETE_POR_LOTE) {
    const lote = unicos.slice(i, i + LIMITE_DELETE_POR_LOTE);
    const resultado = await r2Client.send(
      new DeleteObjectsCommand({
        Bucket: env.R2_BUCKET,
        Delete: { Objects: lote.map((Key) => ({ Key })), Quiet: true },
      })
    );
    if (resultado.Errors && resultado.Errors.length > 0) {
      logger.warn(
        { erros: resultado.Errors.slice(0, 5) },
        "Falha ao remover alguns arquivos do R2"
      );
    }
  }
}
