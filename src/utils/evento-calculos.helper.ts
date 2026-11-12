import { supabaseAdmin } from "../config/supabase.js";
import {
  FESTA_EFEITO_EXTRA,
  FESTA_STATUS_PEDIDO,
  FESTA_TABLES,
  FESTA_TIPO_BAIXA_PAGAMENTO,
  FESTA_TIPO_PERFIL,
} from "../constants/festa.enum.js";
import { AppError } from "../errors/AppError.js";
import type {
  CriarEventoAdminInput,
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
import type {
  EventoAdminResponseDto,
  EventoPublicoResponseDto,
} from "../types/dtos/evento.dto.js";
import type { MolduraResponseDto } from "../types/dtos/moldura.dto.js";
import { formatarMolduraDto } from "../services/moldura.service.js";
import { removerArquivosStorage } from "../config/r2.js";
import { removerMidiasEArquivosStorage } from "./midia-storage.helper.js";

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
    if (
      novoValorPago >= atual.valor_total_centavos &&
      atual.valor_total_centavos > 0
    ) {
      novoStatus = FESTA_STATUS_PEDIDO.PAGO_COMPLETO;
    } else if (atual.status_pedido === FESTA_STATUS_PEDIDO.AGUARDANDO_SINAL) {
      novoStatus = FESTA_STATUS_PEDIDO.SINAL_PAGO;
    }
  } else if (input.tipo_baixa === FESTA_TIPO_BAIXA_PAGAMENTO.QUITACAO_TOTAL) {
    novoValorPago = atual.valor_total_centavos;
    novoStatus = FESTA_STATUS_PEDIDO.PAGO_COMPLETO;
  } else if (input.valor_pago_centavos !== undefined) {
    const restanteAtual = Math.max(
      0,
      atual.valor_total_centavos - atual.valor_pago_centavos
    );
    novoValorPago =
      atual.valor_pago_centavos > 0 && input.valor_pago_centavos <= restanteAtual
        ? atual.valor_pago_centavos + input.valor_pago_centavos
        : input.valor_pago_centavos;

    if (
      novoValorPago >= atual.valor_total_centavos &&
      atual.valor_total_centavos > 0
    ) {
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

export async function sincronizarAnfitriaoEvento(
  anfitriaoInput: CriarEventoAdminInput["anfitriao"],
  anfitriaoIdAtual?: string | null
): Promise<string | null> {
  if (!anfitriaoInput) return anfitriaoIdAtual ?? null;

  if (anfitriaoIdAtual) {
    await supabaseAdmin
      .from(FESTA_TABLES.USUARIOS)
      .update({
        nome: anfitriaoInput.nome,
        telefone: anfitriaoInput.telefone ?? null,
        cpf: anfitriaoInput.cpf ?? null,
        email: anfitriaoInput.email ?? null,
      })
      .eq("id", anfitriaoIdAtual);
    return anfitriaoIdAtual;
  }

  const { data: novoAnf, error } = await supabaseAdmin
    .from(FESTA_TABLES.USUARIOS)
    .insert({
      nome: anfitriaoInput.nome,
      telefone: anfitriaoInput.telefone ?? null,
      cpf: anfitriaoInput.cpf ?? null,
      email: anfitriaoInput.email ?? null,
      tipo_perfil: FESTA_TIPO_PERFIL.ANFITRIAO,
      ativo: true,
    })
    .select("id")
    .single();

  if (error) throw new AppError(error.message, 400);
  return novoAnf.id;
}

export async function substituirExtrasEvento(
  eventoId: string,
  extras: ItemExtraPedidoInput[]
): Promise<void> {
  await supabaseAdmin
    .from(FESTA_TABLES.EVENTO_EXTRAS)
    .delete()
    .eq("evento_id", eventoId);

  if (extras.length > 0) {
    const { error } = await supabaseAdmin
      .from(FESTA_TABLES.EVENTO_EXTRAS)
      .insert(
        extras.map((ex) => ({
          evento_id: eventoId,
          extra_id: ex.extra_id ?? null,
          nome: ex.nome,
          quantidade: ex.quantidade,
          preco_unitario_centavos: ex.preco_unitario_centavos,
          entregue: ex.entregue,
        }))
      );
    if (error) throw new AppError(error.message, 400);
  }
}

export function mapearEventoPublicoDto(
  evento: FestaEvento,
  molduras: MolduraResponseDto[]
): EventoPublicoResponseDto {
  const galeriaExpirada = Boolean(
    evento.expira_em && new Date(evento.expira_em).getTime() < Date.now()
  );

  return {
    id: evento.id,
    slug: evento.slug,
    titulo: evento.titulo,
    subtitulo: evento.subtitulo,
    boas_vindas: evento.boas_vindas,
    nome_aniversariante: evento.nome_aniversariante,
    idade_aniversariante: evento.idade_aniversariante,
    data_evento: evento.data_evento,
    cor_primaria: evento.cor_primaria,
    cor_secundaria: evento.cor_secundaria,
    capa_url: evento.capa_url,
    pacote: evento.pacote,
    inclui_telao: evento.inclui_telao,
    galeria_publica: evento.galeria_publica,
    moderacao_previa: evento.moderacao_previa,
    permite_envio_midias: galeriaExpirada ? false : evento.permite_envio_midias,
    permite_video: evento.permite_video,
    tempo_slideshow_segundos: evento.tempo_slideshow_segundos,
    is_demo: evento.is_demo,
    expira_em: evento.expira_em,
    galeria_expirada: galeriaExpirada,
    molduras,
  };
}

export async function limparArquivosERelacoesEvento(
  eventoId: string
): Promise<void> {
  const [{ data: midias }, { data: molduras }] = await Promise.all([
    supabaseAdmin
      .from(FESTA_TABLES.EVENTO_MIDIAS)
      .select("*")
      .eq("evento_id", eventoId),
    supabaseAdmin
      .from(FESTA_TABLES.EVENTO_MOLDURAS)
      .select("*")
      .eq("evento_id", eventoId),
  ]);

  if (midias && midias.length > 0) {
    await removerMidiasEArquivosStorage(midias);
  }

  const pathsMolduras = (molduras ?? [])
    .map((m) => m.arquivo_path)
    .filter((p) => !p.startsWith("http") && !p.startsWith("/"));

  if (pathsMolduras.length > 0) {
    await removerArquivosStorage(pathsMolduras);
  }

  await supabaseAdmin
    .from(FESTA_TABLES.TRANSACOES_CREDITOS_B2B)
    .update({ evento_id: null })
    .eq("evento_id", eventoId);
}
