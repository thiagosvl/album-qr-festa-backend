import { z } from "zod";
import {
  FESTA_CATEGORIA_TEMA,
  FESTA_CORES_PADRAO,
  FESTA_EFEITO_EXTRA,
} from "../constants/festa.enum.js";
import { Constants } from "../types/database.types.js";

export const atualizarPacoteB2cSchema = z.object({
  nome_exibicao: z.string().min(2).max(80).optional(),
  descricao: z.string().max(400).nullable().optional(),
  preco_centavos: z.number().int().min(0).optional(),
  preco_ancora_centavos: z.number().int().min(0).nullable().optional(),
  limite_molduras: z.number().int().min(1).max(20).optional(),
  inclui_qr_tematico: z.boolean().optional(),
  inclui_telao: z.boolean().optional(),
  dias_galeria_ativa: z.number().int().min(1).max(3650).optional(),
  permite_video: z.boolean().optional(),
  ativo: z.boolean().optional(),
  ordem: z.number().int().min(0).optional(),
});

export const salvarExtraB2cSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/),
  nome: z.string().min(2).max(100),
  descricao: z.string().max(300).nullable().optional(),
  preco_centavos: z.number().int().min(0),
  efeito_tipo: z
    .enum(Constants.public.Enums.festa_efeito_extra_enum)
    .default(FESTA_EFEITO_EXTRA.ENTREGAVEL_MANUAL),
  efeito_valor: z.number().int().min(1).default(1),
  ordem: z.number().int().min(0).default(0),
  ativo: z.boolean().default(true),
});

export const atualizarExtraB2cSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  nome: z.string().min(2).max(100).optional(),
  descricao: z.string().max(300).nullable().optional(),
  preco_centavos: z.number().int().min(0).optional(),
  efeito_tipo: z
    .enum(Constants.public.Enums.festa_efeito_extra_enum)
    .optional(),
  efeito_valor: z.number().int().min(1).optional(),
  ordem: z.number().int().min(0).optional(),
  ativo: z.boolean().optional(),
});

export const salvarTemaCatalogoSchema = z.object({
  nome: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/),
  categoria: z
    .enum(Constants.public.Enums.festa_categoria_tema_enum)
    .default(FESTA_CATEGORIA_TEMA.INFANTIL),
  cor_primaria_padrao: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .default(FESTA_CORES_PADRAO.PRIMARIA),
  cor_secundaria_padrao: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .default(FESTA_CORES_PADRAO.SECUNDARIA),
  thumb_url: z.string().max(500).nullable().optional(),
  moldura_preview_url: z.string().max(500).nullable().optional(),
  publico: z.boolean().default(true),
  parceiro_proprietario_id: z.string().uuid().nullable().optional(),
  ordem: z.number().int().min(0).default(0),
  ativo: z.boolean().default(true),
});

export const atualizarTemaCatalogoSchema = z.object({
  nome: z.string().min(2).max(100).optional(),
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  categoria: z
    .enum(Constants.public.Enums.festa_categoria_tema_enum)
    .optional(),
  cor_primaria_padrao: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  cor_secundaria_padrao: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  thumb_url: z.string().max(500).nullable().optional(),
  moldura_preview_url: z.string().max(500).nullable().optional(),
  publico: z.boolean().optional(),
  parceiro_proprietario_id: z.string().uuid().nullable().optional(),
  ordem: z.number().int().min(0).optional(),
  ativo: z.boolean().optional(),
});

export type AtualizarPacoteB2cInput = z.infer<typeof atualizarPacoteB2cSchema>;
export type SalvarExtraB2cInput = z.infer<typeof salvarExtraB2cSchema>;
export type SalvarTemaCatalogoInput = z.infer<typeof salvarTemaCatalogoSchema>;
