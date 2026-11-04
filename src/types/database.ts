import type { Tables, TablesInsert, TablesUpdate, Enums } from "./database.types.js";

export type FestaCatalogoPacoteB2c = Tables<"festa_catalogo_pacotes_b2c">;
export type FestaCatalogoPacoteB2cInsert = TablesInsert<"festa_catalogo_pacotes_b2c">;
export type FestaCatalogoPacoteB2cUpdate = TablesUpdate<"festa_catalogo_pacotes_b2c">;

export type FestaCatalogoExtraB2c = Tables<"festa_catalogo_extras_b2c">;
export type FestaCatalogoExtraB2cInsert = TablesInsert<"festa_catalogo_extras_b2c">;
export type FestaCatalogoExtraB2cUpdate = TablesUpdate<"festa_catalogo_extras_b2c">;

export type FestaCatalogoPlanoB2b = Tables<"festa_catalogo_planos_b2b">;
export type FestaCatalogoPlanoB2bInsert = TablesInsert<"festa_catalogo_planos_b2b">;
export type FestaCatalogoPlanoB2bUpdate = TablesUpdate<"festa_catalogo_planos_b2b">;

export type FestaTemaCatalogo = Tables<"festa_temas_catalogo">;
export type FestaTemaCatalogoInsert = TablesInsert<"festa_temas_catalogo">;
export type FestaTemaCatalogoUpdate = TablesUpdate<"festa_temas_catalogo">;

export type FestaParceiroB2b = Tables<"festa_parceiros_b2b">;
export type FestaParceiroB2bInsert = TablesInsert<"festa_parceiros_b2b">;
export type FestaParceiroB2bUpdate = TablesUpdate<"festa_parceiros_b2b">;

export type FestaUsuario = Tables<"festa_usuarios">;
export type FestaUsuarioInsert = TablesInsert<"festa_usuarios">;
export type FestaUsuarioUpdate = TablesUpdate<"festa_usuarios">;

export type FestaTransacaoCreditoB2b = Tables<"festa_transacoes_creditos_b2b">;
export type FestaTransacaoCreditoB2bInsert = TablesInsert<"festa_transacoes_creditos_b2b">;

export type FestaEvento = Tables<"festa_eventos">;
export type FestaEventoInsert = TablesInsert<"festa_eventos">;
export type FestaEventoUpdate = TablesUpdate<"festa_eventos">;

export type FestaEventoExtra = Tables<"festa_evento_extras">;
export type FestaEventoExtraInsert = TablesInsert<"festa_evento_extras">;
export type FestaEventoExtraUpdate = TablesUpdate<"festa_evento_extras">;

export type FestaEventoMoldura = Tables<"festa_evento_molduras">;
export type FestaEventoMolduraInsert = TablesInsert<"festa_evento_molduras">;
export type FestaEventoMolduraUpdate = TablesUpdate<"festa_evento_molduras">;

export type FestaEventoMidia = Tables<"festa_evento_midias">;
export type FestaEventoMidiaInsert = TablesInsert<"festa_evento_midias">;
export type FestaEventoMidiaUpdate = TablesUpdate<"festa_evento_midias">;

export type FestaTipoPerfilEnum = Enums<"festa_tipo_perfil_enum">;
export type FestaPacoteTipoEnum = Enums<"festa_pacote_tipo_enum">;
export type FestaStatusPedidoEnum = Enums<"festa_status_pedido_enum">;
export type FestaTipoMidiaEnum = Enums<"festa_tipo_midia_enum">;
export type FestaStatusModeracaoEnum = Enums<"festa_status_moderacao_enum">;
export type FestaStatusAssinaturaB2bEnum = Enums<"festa_status_assinatura_b2b_enum">;
export type FestaTipoTransacaoCreditoEnum = Enums<"festa_tipo_transacao_credito_enum">;
export type FestaCategoriaTemaEnum = Enums<"festa_categoria_tema_enum">;
export type FestaEfeitoExtraEnum = Enums<"festa_efeito_extra_enum">;
export type FestaMetodoPagamentoEnum = Enums<"festa_metodo_pagamento_enum">;
