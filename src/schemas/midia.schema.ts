import { z } from "zod";
import { FESTA_TIPO_MIDIA } from "../constants/festa.enum.js";
import { Constants } from "../types/database.types.js";

export const registrarMidiaConvidadoSchema = z.object({
  id: z.string().uuid().optional(),
  moldura_id: z.string().uuid().nullable().optional(),
  tipo_midia: z
    .enum(Constants.public.Enums.festa_tipo_midia_enum)
    .default(FESTA_TIPO_MIDIA.FOTO),
  path: z.string().min(5).max(260),
  thumb_path: z.string().min(5).max(260).nullable().optional(),
  autor: z.string().trim().max(40).nullable().optional(),
  duracao_segundos: z.number().int().min(1).max(120).nullable().optional(),
  tamanho_bytes: z.number().int().min(1).max(20971520).nullable().optional(),
  sessao_id: z.string().max(100).nullable().optional(),
});

export const listagemMidiasPublicaQuerySchema = z.object({
  cursor: z.string().datetime().optional(),
  limite: z.coerce.number().int().min(1).max(100).default(40),
  sessao_id: z.string().max(100).optional(),
});

export const listagemMidiasGestaoQuerySchema = z.object({
  status_moderacao: z.enum(Constants.public.Enums.festa_status_moderacao_enum).optional(),
  cursor: z.string().datetime().optional(),
  limite: z.coerce.number().int().min(1).max(200).default(60),
});

export const moderarMidiaSchema = z.object({
  status_moderacao: z
    .enum(Constants.public.Enums.festa_status_moderacao_enum)
    .optional(),
  fixada_demo: z.boolean().optional(),
});

export const moderarMidiasEmLoteSchema = z.object({
  midia_ids: z.array(z.string().uuid()).min(1).max(200),
  status_moderacao: z.enum(Constants.public.Enums.festa_status_moderacao_enum),
});

export const excluirMidiaConvidadoQuerySchema = z.object({
  sessao_id: z.string().min(3).max(100),
});

export type RegistrarMidiaConvidadoInput = z.infer<typeof registrarMidiaConvidadoSchema>;
export type ListagemMidiasPublicaQuery = z.infer<typeof listagemMidiasPublicaQuerySchema>;
export type ListagemMidiasGestaoQuery = z.infer<typeof listagemMidiasGestaoQuerySchema>;
export type ModerarMidiaInput = z.infer<typeof moderarMidiaSchema>;
export type ModerarMidiasEmLoteInput = z.infer<typeof moderarMidiasEmLoteSchema>;
