import type {
  FestaCategoriaTemaEnum,
  FestaEfeitoExtraEnum,
  FestaMetodoPagamentoEnum,
  FestaPacoteTipoEnum,
  FestaStatusAssinaturaB2bEnum,
  FestaStatusModeracaoEnum,
  FestaStatusPedidoEnum,
  FestaTipoMidiaEnum,
  FestaTipoPerfilEnum,
  FestaTipoTransacaoCreditoEnum,
} from "../types/database.js";

export const FESTA_TABLES = {
  CATALOGO_PACOTES_B2C: "festa_catalogo_pacotes_b2c",
  CATALOGO_EXTRAS_B2C: "festa_catalogo_extras_b2c",
  CATALOGO_PLANOS_B2B: "festa_catalogo_planos_b2b",
  TEMAS_CATALOGO: "festa_temas_catalogo",
  PARCEIROS_B2B: "festa_parceiros_b2b",
  USUARIOS: "festa_usuarios",
  TRANSACOES_CREDITOS_B2B: "festa_transacoes_creditos_b2b",
  EVENTOS: "festa_eventos",
  EVENTO_EXTRAS: "festa_evento_extras",
  EVENTO_MOLDURAS: "festa_evento_molduras",
  EVENTO_MIDIAS: "festa_evento_midias",
} as const;

export const FESTA_RPC = {
  AJUSTAR_CURTIDAS_MIDIA: "festa_ajustar_curtidas_midia",
} as const;

export const FESTA_VARIACAO_CURTIDA = {
  CURTIR: 1,
  DESCURTIR: -1,
} as const;

export type FestaVariacaoCurtida =
  (typeof FESTA_VARIACAO_CURTIDA)[keyof typeof FESTA_VARIACAO_CURTIDA];

export const FESTA_BUCKETS = {
  MIDIAS: "festa-midias",
} as const;

export const FESTA_TIPO_PERFIL: Record<FestaTipoPerfilEnum, FestaTipoPerfilEnum> = {
  ADMIN: "ADMIN",
  ANFITRIAO: "ANFITRIAO",
  PARCEIRO_ADMIN: "PARCEIRO_ADMIN",
  PARCEIRO_OPERADOR: "PARCEIRO_OPERADOR",
} as const;

export const FESTA_PACOTE_TIPO: Record<FestaPacoteTipoEnum, FestaPacoteTipoEnum> = {
  BASICO: "BASICO",
  COMPLETO: "COMPLETO",
} as const;

export const FESTA_STATUS_PEDIDO: Record<FestaStatusPedidoEnum, FestaStatusPedidoEnum> = {
  AGUARDANDO_SINAL: "AGUARDANDO_SINAL",
  SINAL_PAGO: "SINAL_PAGO",
  AGUARDANDO_BRIEFING: "AGUARDANDO_BRIEFING",
  EM_MONTAGEM: "EM_MONTAGEM",
  ENTREGUE: "ENTREGUE",
  PAGO_COMPLETO: "PAGO_COMPLETO",
  CANCELADO: "CANCELADO",
} as const;

export const FESTA_METODO_PAGAMENTO: Record<FestaMetodoPagamentoEnum, FestaMetodoPagamentoEnum> = {
  PIX_MANUAL: "PIX_MANUAL",
  CARTAO_LINK: "CARTAO_LINK",
  CORTESIA: "CORTESIA",
  CREDITO_B2B: "CREDITO_B2B",
} as const;

export const FESTA_TIPO_MIDIA: Record<FestaTipoMidiaEnum, FestaTipoMidiaEnum> = {
  FOTO: "FOTO",
  VIDEO: "VIDEO",
} as const;

export const FESTA_STATUS_MODERACAO: Record<FestaStatusModeracaoEnum, FestaStatusModeracaoEnum> = {
  APROVADA: "APROVADA",
  PENDENTE: "PENDENTE",
  OCULTA: "OCULTA",
} as const;

export const FESTA_STATUS_ASSINATURA_B2B: Record<FestaStatusAssinaturaB2bEnum, FestaStatusAssinaturaB2bEnum> = {
  TRIAL: "TRIAL",
  ATIVA: "ATIVA",
  INADIMPLENTE: "INADIMPLENTE",
  CANCELADA: "CANCELADA",
} as const;

export const FESTA_TIPO_TRANSACAO_CREDITO: Record<FestaTipoTransacaoCreditoEnum, FestaTipoTransacaoCreditoEnum> = {
  RECARGA_PLANO: "RECARGA_PLANO",
  COMPRA_AVULSA: "COMPRA_AVULSA",
  CONSUMO_EVENTO: "CONSUMO_EVENTO",
  ESTORNO: "ESTORNO",
} as const;

export const FESTA_CATEGORIA_TEMA: Record<FestaCategoriaTemaEnum, FestaCategoriaTemaEnum> = {
  INFANTIL: "INFANTIL",
  QUINZE_ANOS: "QUINZE_ANOS",
  CASAMENTO: "CASAMENTO",
  ADULTO: "ADULTO",
  CORPORATIVO: "CORPORATIVO",
} as const;

export const FESTA_EFEITO_EXTRA: Record<FestaEfeitoExtraEnum, FestaEfeitoExtraEnum> = {
  MOLDURA_ADICIONAL: "MOLDURA_ADICIONAL",
  DIAS_GALERIA_ADICIONAIS: "DIAS_GALERIA_ADICIONAIS",
  LIBERAR_VIDEO: "LIBERAR_VIDEO",
  LIBERAR_TELAO: "LIBERAR_TELAO",
  ENTREGAVEL_MANUAL: "ENTREGAVEL_MANUAL",
} as const;

export const FESTA_TIPO_BAIXA_PAGAMENTO = {
  SINAL: "SINAL",
  QUITACAO_TOTAL: "QUITACAO_TOTAL",
  VALOR_PERSONALIZADO: "VALOR_PERSONALIZADO",
} as const;

export type FestaTipoBaixaPagamento =
  (typeof FESTA_TIPO_BAIXA_PAGAMENTO)[keyof typeof FESTA_TIPO_BAIXA_PAGAMENTO];

export const FESTA_CORES_PADRAO = {
  PRIMARIA: "#e6007e",
  SECUNDARIA: "#7b3fe4",
} as const;
