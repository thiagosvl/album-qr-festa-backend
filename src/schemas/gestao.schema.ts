import { z } from "zod";

export const atualizarBriefingPaiSchema = z.object({
  titulo: z.string().min(2).max(120).optional(),
  subtitulo: z.string().max(160).nullable().optional(),
  boas_vindas: z.string().max(300).nullable().optional(),
  nome_aniversariante: z.string().max(100).nullable().optional(),
  idade_aniversariante: z.string().max(40).nullable().optional(),
  data_evento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  cor_primaria: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  cor_secundaria: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  capa_url: z.string().nullable().optional(),
  tema_id: z.string().uuid().nullable().optional(),
  galeria_publica: z.boolean().optional(),
  moderacao_previa: z.boolean().optional(),
  permite_envio_midias: z.boolean().optional(),
  tempo_slideshow_segundos: z.number().int().min(3).max(30).optional(),
});

export const alternarExtraEntregueSchema = z.object({
  entregue: z.boolean(),
});

export type AtualizarBriefingPaiInput = z.infer<typeof atualizarBriefingPaiSchema>;
export type AlternarExtraEntregueInput = z.infer<typeof alternarExtraEntregueSchema>;
