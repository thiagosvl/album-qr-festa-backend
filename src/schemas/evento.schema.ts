import { z } from "zod";
import {
  FESTA_CORES_PADRAO,
  FESTA_METODO_PAGAMENTO,
  FESTA_PACOTE_TIPO,
  FESTA_STATUS_PEDIDO,
  FESTA_TIPO_BAIXA_PAGAMENTO,
} from "../constants/festa.enum.js";
import { Constants } from "../types/database.types.js";

export const itemProdutoPedidoSchema = z.object({
  produto_id: z.string().uuid().nullable().optional(),
  codigo_modulo: z.enum(Constants.public.Enums.festa_codigo_modulo_enum),
  nome: z.string().min(2).max(120),
  preco_centavos: z.number().int().min(0),
  custo_creditos_b2b: z.number().int().min(0).default(0),
});

export const itemExtraPedidoSchema = z.object({
  extra_id: z.string().uuid().nullable().optional(),
  nome: z.string().min(2).max(120),
  quantidade: z.number().int().min(1).max(50).default(1),
  preco_unitario_centavos: z.number().int().min(0),
  custo_creditos_b2b: z.number().int().min(0).default(0),
  entregue: z.boolean().default(false),
});

export const camposConviteEventoSchema = z.object({
  convite_texto_chamada: z.string().max(300).nullable().optional(),
  convite_foto_url: z.string().max(500).nullable().optional(),
  convite_banner_topo_url: z.string().max(500).nullable().optional(),
  convite_musica_url: z.string().max(500).nullable().optional(),
  convite_audio_obrigado_url: z.string().max(500).nullable().optional(),
  convite_horario_inicio: z.string().max(40).nullable().optional(),
  convite_horario_texto: z.string().max(120).nullable().optional(),
  convite_nome_local: z.string().max(160).nullable().optional(),
  convite_endereco: z.string().max(300).nullable().optional(),
  convite_exibir_presentes: z.boolean().optional(),
  convite_titulo_tamanhos: z.string().max(120).nullable().optional(),
  convite_tamanho_calcado: z.string().max(80).nullable().optional(),
  convite_tamanho_roupa: z.string().max(80).nullable().optional(),
  convite_ideias_presentes: z.array(z.string().max(120)).optional(),
  convite_texto_prazo_rsvp: z.string().max(160).nullable().optional(),
  convite_whatsapp_contato: z.string().max(40).nullable().optional(),
});

export const dadosAnfitriaoInputSchema = z.object({
  nome: z.string().min(2).max(120),
  telefone: z.string().max(30).nullable().optional(),
  cpf: z.string().max(20).nullable().optional(),
  email: z.string().email().nullable().optional(),
});

export const criarEventoAdminSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  titulo: z.string().min(2).max(120),
  subtitulo: z.string().max(160).nullable().optional(),
  boas_vindas: z.string().max(300).nullable().optional(),
  nome_aniversariante: z.string().max(100).nullable().optional(),
  idade_aniversariante: z.string().max(40).nullable().optional(),
  data_evento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  cor_primaria: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .default(FESTA_CORES_PADRAO.PRIMARIA),
  cor_secundaria: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .default(FESTA_CORES_PADRAO.SECUNDARIA),
  capa_url: z.string().nullable().optional(),
  qr_code_pdf_url: z.string().nullable().optional(),
  tema_id: z.string().uuid().nullable().optional(),
  parceiro_id: z.string().uuid().nullable().optional(),
  anfitriao: dadosAnfitriaoInputSchema.optional(),
  pacote: z
    .enum(Constants.public.Enums.festa_pacote_tipo_enum)
    .nullable()
    .optional()
    .default(FESTA_PACOTE_TIPO.BASICO),
  inclui_galeria: z.boolean().optional(),
  inclui_convite: z.boolean().optional(),
  creditos_b2b_consumidos: z.number().int().min(0).optional(),
  status_pedido: z
    .enum(Constants.public.Enums.festa_status_pedido_enum)
    .default(FESTA_STATUS_PEDIDO.AGUARDANDO_SINAL),
  metodo_pagamento: z
    .enum(Constants.public.Enums.festa_metodo_pagamento_enum)
    .default(FESTA_METODO_PAGAMENTO.PIX_MANUAL),
  valor_pacote_centavos: z.number().int().min(0).optional(),
  desconto_centavos: z.number().int().min(0).default(0),
  valor_sinal_centavos: z.number().int().min(0).optional(),
  valor_pago_centavos: z.number().int().min(0).default(0),
  observacoes_internas: z.string().max(1000).nullable().optional(),
  limite_molduras: z.number().int().min(1).max(30).optional(),
  inclui_telao: z.boolean().optional(),
  galeria_publica: z.boolean().default(true),
  moderacao_previa: z.boolean().default(false),
  permite_envio_midias: z.boolean().default(true),
  permite_video: z.boolean().optional(),
  tempo_slideshow_segundos: z.number().int().min(3).max(30).default(6),
  expira_em: z.string().datetime().nullable().optional(),
  ativo: z.boolean().default(true),
  produtos: z.array(itemProdutoPedidoSchema).optional(),
  extras: z.array(itemExtraPedidoSchema).default([]),
}).merge(camposConviteEventoSchema);

export const atualizarEventoAdminSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  titulo: z.string().min(2).max(120).optional(),
  subtitulo: z.string().max(160).nullable().optional(),
  boas_vindas: z.string().max(300).nullable().optional(),
  nome_aniversariante: z.string().max(100).nullable().optional(),
  idade_aniversariante: z.string().max(40).nullable().optional(),
  data_evento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  cor_primaria: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  cor_secundaria: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  capa_url: z.string().nullable().optional(),
  qr_code_pdf_url: z.string().nullable().optional(),
  tema_id: z.string().uuid().nullable().optional(),
  parceiro_id: z.string().uuid().nullable().optional(),
  anfitriao: dadosAnfitriaoInputSchema.optional(),
  pacote: z.enum(Constants.public.Enums.festa_pacote_tipo_enum).nullable().optional(),
  inclui_galeria: z.boolean().optional(),
  inclui_convite: z.boolean().optional(),
  creditos_b2b_consumidos: z.number().int().min(0).optional(),
  status_pedido: z
    .enum(Constants.public.Enums.festa_status_pedido_enum)
    .optional(),
  metodo_pagamento: z
    .enum(Constants.public.Enums.festa_metodo_pagamento_enum)
    .optional(),
  valor_pacote_centavos: z.number().int().min(0).optional(),
  desconto_centavos: z.number().int().min(0).optional(),
  valor_sinal_centavos: z.number().int().min(0).optional(),
  valor_pago_centavos: z.number().int().min(0).optional(),
  observacoes_internas: z.string().max(1000).nullable().optional(),
  limite_molduras: z.number().int().min(1).max(30).optional(),
  inclui_telao: z.boolean().optional(),
  galeria_publica: z.boolean().optional(),
  moderacao_previa: z.boolean().optional(),
  permite_envio_midias: z.boolean().optional(),
  permite_video: z.boolean().optional(),
  tempo_slideshow_segundos: z.number().int().min(3).max(30).optional(),
  expira_em: z.string().datetime().nullable().optional(),
  ativo: z.boolean().optional(),
  produtos: z.array(itemProdutoPedidoSchema).optional(),
  extras: z.array(itemExtraPedidoSchema).optional(),
}).merge(camposConviteEventoSchema);

export const registrarPagamentoManualSchema = z.object({
  tipo_baixa: z.enum([
    FESTA_TIPO_BAIXA_PAGAMENTO.SINAL,
    FESTA_TIPO_BAIXA_PAGAMENTO.QUITACAO_TOTAL,
    FESTA_TIPO_BAIXA_PAGAMENTO.VALOR_PERSONALIZADO,
  ]),
  valor_pago_centavos: z.number().int().min(0).optional(),
  metodo_pagamento: z
    .enum(Constants.public.Enums.festa_metodo_pagamento_enum)
    .optional(),
  observacoes_internas: z.string().max(1000).optional(),
});

export const filtroListagemEventosSchema = z.object({
  status_pedido: z.enum(Constants.public.Enums.festa_status_pedido_enum).optional(),
  busca: z.string().optional(),
  incluir_demo: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
});

export type CriarEventoAdminInput = z.infer<typeof criarEventoAdminSchema>;
export type AtualizarEventoAdminInput = z.infer<typeof atualizarEventoAdminSchema>;
export type RegistrarPagamentoManualInput = z.infer<typeof registrarPagamentoManualSchema>;
export type FiltroListagemEventosInput = z.infer<typeof filtroListagemEventosSchema>;
export type ItemProdutoPedidoInput = z.infer<typeof itemProdutoPedidoSchema>;
export type ItemExtraPedidoInput = z.infer<typeof itemExtraPedidoSchema>;
