import { z } from "zod";
import {
  FESTA_CORES_PADRAO,
  FESTA_PACOTE_TIPO,
  FESTA_STATUS_ASSINATURA_B2B,
  FESTA_TIPO_TRANSACAO_CREDITO,
} from "../constants/festa.enum.js";
import { Constants } from "../types/database.types.js";

export const salvarParceiroB2bSchema = z.object({
  nome_empresa: z.string().min(2).max(120),
  documento: z.string().max(30).nullable().optional(),
  telefone: z.string().max(30).nullable().optional(),
  email: z.string().email().nullable().optional(),
  senha_acesso: z.string().min(6).max(72).nullable().optional(),
  logo_url: z.string().max(500).nullable().optional(),
  cor_marca: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .default(FESTA_CORES_PADRAO.PARCEIRO_MARCA),
  status_assinatura: z
    .enum(Constants.public.Enums.festa_status_assinatura_b2b_enum)
    .default(FESTA_STATUS_ASSINATURA_B2B.ATIVA),
  plano_b2b_id: z.string().uuid().nullable().optional(),
  saldo_creditos: z.number().int().min(0).default(6),
  ativo: z.boolean().default(true),
});

export const atualizarParceiroB2bSchema = z.object({
  nome_empresa: z.string().min(2).max(120).optional(),
  documento: z.string().max(30).nullable().optional(),
  telefone: z.string().max(30).nullable().optional(),
  email: z.string().email().nullable().optional(),
  senha_acesso: z.string().min(6).max(72).nullable().optional(),
  logo_url: z.string().max(500).nullable().optional(),
  cor_marca: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  status_assinatura: z
    .enum(Constants.public.Enums.festa_status_assinatura_b2b_enum)
    .optional(),
  plano_b2b_id: z.string().uuid().nullable().optional(),
  saldo_creditos: z.number().int().min(0).optional(),
  ativo: z.boolean().optional(),
});

export const atualizarPerfilPortalParceiroSchema = atualizarParceiroB2bSchema.pick({
  nome_empresa: true,
  documento: true,
  telefone: true,
  email: true,
  cor_marca: true,
  logo_url: true,
});

export const registrarTransacaoCreditoB2bSchema = z.object({
  tipo: z
    .enum(Constants.public.Enums.festa_tipo_transacao_credito_enum)
    .default(FESTA_TIPO_TRANSACAO_CREDITO.RECARGA_PLANO),
  quantidade: z.number().int().min(1).max(500),
  observacao: z.string().max(240).nullable().optional(),
});

export const atualizarPlanoB2bSchema = z.object({
  nome: z.string().min(2).max(100).optional(),
  descricao: z.string().max(300).nullable().optional(),
  preco_mensal_centavos: z.number().int().min(0).optional(),
  creditos_mensais: z.number().int().min(1).optional(),
  custo_creditos_basico: z.number().int().min(1).optional(),
  custo_creditos_completo: z.number().int().min(1).optional(),
  preco_credito_avulso_centavos: z.number().int().min(0).optional(),
  ativo: z.boolean().optional(),
});

export const criarEventoParceiroB2bSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/),
  titulo: z.string().min(2).max(120),
  subtitulo: z.string().max(160).nullable().optional(),
  boas_vindas: z.string().max(300).nullable().optional(),
  nome_aniversariante: z.string().max(100).nullable().optional(),
  idade_aniversariante: z.string().max(40).nullable().optional(),
  data_evento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  pacote: z
    .enum(Constants.public.Enums.festa_pacote_tipo_enum)
    .default(FESTA_PACOTE_TIPO.COMPLETO),
  tema_id: z.string().uuid().nullable().optional(),
  cor_primaria: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .default(FESTA_CORES_PADRAO.PRIMARIA),
  cor_secundaria: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .default(FESTA_CORES_PADRAO.PARCEIRO_MARCA),
  nome_anfitriao: z.string().max(100).nullable().optional(),
  telefone_anfitriao: z.string().max(30).nullable().optional(),
});

export const criarOperadorParceiroSchema = z.object({
  nome: z.string().min(2).max(120),
  email: z.string().email().max(160),
  telefone: z.string().max(30).nullable().optional(),
  senha_acesso: z.string().min(6).max(72),
  ativo: z.boolean().default(true),
});

export const atualizarOperadorParceiroSchema = z.object({
  nome: z.string().min(2).max(120).optional(),
  email: z.string().email().max(160).optional(),
  telefone: z.string().max(30).nullable().optional(),
  senha_acesso: z.string().min(6).max(72).nullable().optional(),
  ativo: z.boolean().optional(),
});

export type SalvarParceiroB2bInput = z.infer<typeof salvarParceiroB2bSchema>;
export type AtualizarParceiroB2bInput = z.infer<typeof atualizarParceiroB2bSchema>;
export type AtualizarPerfilPortalParceiroInput = z.infer<
  typeof atualizarPerfilPortalParceiroSchema
>;
export type RegistrarTransacaoCreditoB2bInput = z.infer<
  typeof registrarTransacaoCreditoB2bSchema
>;
export type AtualizarPlanoB2bInput = z.infer<typeof atualizarPlanoB2bSchema>;
export type CriarEventoParceiroB2bInput = z.infer<
  typeof criarEventoParceiroB2bSchema
>;
export type CriarOperadorParceiroInput = z.infer<
  typeof criarOperadorParceiroSchema
>;
export type AtualizarOperadorParceiroInput = z.infer<
  typeof atualizarOperadorParceiroSchema
>;
