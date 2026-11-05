import { z } from "zod";
import {
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
  logo_url: z.string().url().nullable().optional(),
  cor_marca: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .default("#7c3aed"),
  status_assinatura: z
    .enum(Constants.public.Enums.festa_status_assinatura_b2b_enum)
    .default(FESTA_STATUS_ASSINATURA_B2B.ATIVA),
  plano_b2b_id: z.string().uuid().nullable().optional(),
  saldo_creditos: z.number().int().min(0).default(6),
  ativo: z.boolean().default(true),
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
    .default("#e6007e"),
  cor_secundaria: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .default("#7c3aed"),
  nome_anfitriao: z.string().max(100).nullable().optional(),
  telefone_anfitriao: z.string().max(30).nullable().optional(),
});

export type SalvarParceiroB2bInput = z.infer<typeof salvarParceiroB2bSchema>;
export type RegistrarTransacaoCreditoB2bInput = z.infer<
  typeof registrarTransacaoCreditoB2bSchema
>;
export type AtualizarPlanoB2bInput = z.infer<typeof atualizarPlanoB2bSchema>;
export type CriarEventoParceiroB2bInput = z.infer<
  typeof criarEventoParceiroB2bSchema
>;
