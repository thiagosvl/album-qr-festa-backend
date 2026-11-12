import { z } from "zod";

export const UPLOAD_TIPOS_PERMITIDOS = {
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/webp": ["webp"],
  "application/pdf": ["pdf"],
  "video/mp4": ["mp4"],
  "video/quicktime": ["mov"],
  "video/webm": ["webm"],
} as const;

export const UPLOAD_LIMITE_BYTES_IMAGEM = 25 * 1024 * 1024;
export const UPLOAD_LIMITE_BYTES_VIDEO = 100 * 1024 * 1024;

export const solicitarUploadSchema = z.object({
  path: z
    .string()
    .min(5)
    .max(260)
    .regex(
      /^[a-z0-9][a-z0-9_-]*(\/[A-Za-z0-9][A-Za-z0-9._-]*)+$/,
      "Caminho de arquivo inválido."
    )
    .refine((p) => !p.includes(".."), "Caminho de arquivo inválido."),
  content_type: z.enum(
    Object.keys(UPLOAD_TIPOS_PERMITIDOS) as [
      keyof typeof UPLOAD_TIPOS_PERMITIDOS,
      ...(keyof typeof UPLOAD_TIPOS_PERMITIDOS)[],
    ]
  ),
  tamanho_bytes: z.number().int().min(1).max(UPLOAD_LIMITE_BYTES_VIDEO),
});

export type SolicitarUploadInput = z.infer<typeof solicitarUploadSchema>;
