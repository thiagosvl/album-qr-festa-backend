import { supabaseAdmin } from "../config/supabase.js";
import {
  FESTA_EFEITO_EXTRA,
  FESTA_STATUS_PEDIDO,
  FESTA_TABLES,
  FESTA_TIPO_BAIXA_PAGAMENTO,
} from "../constants/festa.enum.js";
import type {
  ItemExtraPedidoInput,
  RegistrarPagamentoManualInput,
} from "../schemas/evento.schema.js";
import type {
  FestaCatalogoExtraB2c,
  FestaEvento,
  FestaEventoExtra,
  FestaEventoMoldura,
  FestaTemaCatalogo,
  FestaUsuario,
} from "../types/database.js";
import type { EventoAdminResponseDto } from "../types/dtos/evento.dto.js";
import { formatarMolduraDto } from "../services/moldura.service.js";

export interface EfeitosCalculadosExtras {
  valorExtrasCentavos: number;
  moldurasAdicionais: number;
  diasGaleriaAdicionais: number;
  liberarVideo: boolean;
  liberarTelao: boolean;
}

export interface EventoComRelacoesRow extends FestaEvento {
  anfitriao?: FestaUsuario | null;
  tema?: FestaTemaCatalogo | null;
  extras?: FestaEventoExtra[];
  molduras?: FestaEventoMoldura[];
}

export async function calcularEfeitosExtrasEvento(
  extrasInput: ItemExtraPedidoInput[]
): Promise<EfeitosCalculadosExtras> {
  let valorExtrasCentavos = 0;
  let moldurasAdicionais = 0;
  let diasGaleriaAdicionais = 0;
  let liberarVideo = false;
  let liberarTelao = false;

  const idsCatalogo = extrasInput
    .map((e) => e.extra_id)
    .filter((id): id is string => Boolean(id));

  const mapaCatalogo = new Map<string, FestaCatalogoExtraB2c>();
  if (idsCatalogo.length > 0) {
    const { data } = await supabaseAdmin
      .from(FESTA_TABLES.CATALOGO_EXTRAS_B2C)
      .select("*")
      .in("id", idsCatalogo);

    for (const c of data ?? []) {
      mapaCatalogo.set(c.id, c);
    }
  }

  for (const item of extrasInput) {
    valorExtrasCentavos += item.preco_unitario_centavos * item.quantidade;
    if (!item.extra_id) continue;
    const cat = mapaCatalogo.get(item.extra_id);
    if (!cat) continue;

    if (cat.efeito_tipo === FESTA_EFEITO_EXTRA.MOLDURA_ADICIONAL) {
      moldurasAdicionais += cat.efeito_valor * item.quantidade;
    } else if (cat.efeito_tipo === FESTA_EFEITO_EXTRA.DIAS_GALERIA_ADICIONAIS) {
      diasGaleriaAdicionais += cat.efeito_valor * item.quantidade;
    } else if (cat.efeito_tipo === FESTA_EFEITO_EXTRA.LIBERAR_VIDEO) {
      liberarVideo = true;
    } else if (cat.efeito_tipo === FESTA_EFEITO_EXTRA.LIBERAR_TELAO) {
      liberarTelao = true;
    }
  }

  return {
    valorExtrasCentavos,
    moldurasAdicionais,
    diasGaleriaAdicionais,
    liberarVideo,
    liberarTelao,
  };
}

export function calcularDataExpiracaoGaleria(
  dataEvento: string | null | undefined,
  diasTotais: number
): string {
  const base = dataEvento ? new Date(`${dataEvento}T23:59:59.000Z`) : new Date();
  base.setUTCDate(base.getUTCDate() + diasTotais);
  return base.toISOString();
}

export function calcularNovaBaixaPagamento(
  atual: FestaEvento,
  input: RegistrarPagamentoManualInput
): {
  novoValorPago: number;
  novoStatus: FestaEvento["status_pedido"];
} {
  let novoValorPago = atual.valor_pago_centavos;
  let novoStatus: FestaEvento["status_pedido"] = atual.status_pedido;

  if (input.tipo_baixa === FESTA_TIPO_BAIXA_PAGAMENTO.SINAL) {
    novoValorPago =
      input.valor_pago_centavos ??
      (atual.valor_sinal_centavos > 0
        ? atual.valor_sinal_centavos
        : Math.round(atual.valor_total_centavos / 2));
    if (atual.status_pedido === FESTA_STATUS_PEDIDO.AGUARDANDO_SINAL) {
      novoStatus = FESTA_STATUS_PEDIDO.SINAL_PAGO;
    }
  } else if (input.tipo_baixa === FESTA_TIPO_BAIXA_PAGAMENTO.QUITACAO_TOTAL) {
    novoValorPago = atual.valor_total_centavos;
    novoStatus = FESTA_STATUS_PEDIDO.PAGO_COMPLETO;
  } else if (input.valor_pago_centavos !== undefined) {
    novoValorPago = input.valor_pago_centavos;
    if (novoValorPago >= atual.valor_total_centavos && atual.valor_total_centavos > 0) {
      novoStatus = FESTA_STATUS_PEDIDO.PAGO_COMPLETO;
    } else if (
      novoValorPago > 0 &&
      atual.status_pedido === FESTA_STATUS_PEDIDO.AGUARDANDO_SINAL
    ) {
      novoStatus = FESTA_STATUS_PEDIDO.SINAL_PAGO;
    }
  }

  return { novoValorPago, novoStatus };
}

export function mapearEventoAdminDto(
  item: EventoComRelacoesRow,
  totalMidias: number
): EventoAdminResponseDto {
  const anfitriao = item.anfitriao ?? null;
  const tema = item.tema ?? null;
  const extras = item.extras ?? [];
  const molduras = [...(item.molduras ?? [])]
    .sort((a, b) => a.ordem - b.ordem)
    .map(formatarMolduraDto);

  return {
    ...item,
    anfitriao,
    tema,
    extras,
    molduras,
    total_midias: totalMidias,
    valor_restante_centavos: Math.max(
      0,
      item.valor_total_centavos - item.valor_pago_centavos
    ),
  };
}
