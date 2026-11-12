import { supabaseAdmin } from "../config/supabase.js";
import {
  FESTA_CODIGO_MODULO,
  FESTA_METODO_PAGAMENTO,
  FESTA_STATUS_PEDIDO,
  FESTA_TABLES,
} from "../constants/festa.enum.js";
import { AppError } from "../errors/AppError.js";
import type { ItemProdutoPedidoInput } from "../schemas/evento.schema.js";
import type {
  FestaCatalogoProduto,
  FestaEvento,
  FestaEventoProduto,
} from "../types/database.js";

export interface CalculoProdutosEvento {
  produtosNormalizados: ItemProdutoPedidoInput[];
  valorProdutosCentavos: number;
  creditosProdutosB2b: number;
  incluiGaleria: boolean;
  incluiConvite: boolean;
  limiteMoldurasBase: number;
  diasGaleriaBase: number;
}

export async function carregarCatalogoProdutosMap(): Promise<
  Map<string, FestaCatalogoProduto>
> {
  const { data, error } = await supabaseAdmin
    .from(FESTA_TABLES.CATALOGO_PRODUTOS)
    .select("*");

  if (error) throw new AppError(error.message, 500);

  const mapa = new Map<string, FestaCatalogoProduto>();
  for (const prod of data ?? []) {
    mapa.set(prod.codigo_modulo, prod);
    mapa.set(prod.id, prod);
  }
  return mapa;
}

export async function resolverProdutosEvento(
  produtosInput: ItemProdutoPedidoInput[] | undefined,
  incluiGaleriaInput?: boolean,
  incluiConviteInput?: boolean,
  produtosAtuais?: FestaEventoProduto[]
): Promise<CalculoProdutosEvento> {
  const mapaCatalogo = await carregarCatalogoProdutosMap();

  let listaBase: ItemProdutoPedidoInput[];

  if (produtosInput !== undefined) {
    listaBase = produtosInput;
  } else if (produtosAtuais && produtosAtuais.length > 0) {
    listaBase = produtosAtuais.map((p) => ({
      produto_id: p.produto_id,
      codigo_modulo: p.codigo_modulo,
      nome: p.nome,
      preco_centavos: p.preco_centavos,
      custo_creditos_b2b: p.custo_creditos_b2b,
    }));
  } else {
    listaBase = [];
    const habilitarGaleria = incluiGaleriaInput ?? true;
    const habilitarConvite = incluiConviteInput ?? false;

    if (habilitarGaleria) {
      const catGaleria = mapaCatalogo.get(FESTA_CODIGO_MODULO.GALERIA);
      listaBase.push({
        produto_id: catGaleria?.id ?? null,
        codigo_modulo: FESTA_CODIGO_MODULO.GALERIA,
        nome: catGaleria?.nome_exibicao ?? "Galeria QR Code Interativa",
        preco_centavos: catGaleria?.preco_centavos ?? 12990,
        custo_creditos_b2b: catGaleria?.custo_creditos_b2b ?? 1,
      });
    }

    if (habilitarConvite) {
      const catConvite = mapaCatalogo.get(FESTA_CODIGO_MODULO.CONVITE);
      listaBase.push({
        produto_id: catConvite?.id ?? null,
        codigo_modulo: FESTA_CODIGO_MODULO.CONVITE,
        nome: catConvite?.nome_exibicao ?? "Convite Interativo com RSVP",
        preco_centavos: catConvite?.preco_centavos ?? 8990,
        custo_creditos_b2b: catConvite?.custo_creditos_b2b ?? 1,
      });
    }
  }

  let valorProdutosCentavos = 0;
  let creditosProdutosB2b = 0;
  let incluiGaleria = false;
  let incluiConvite = false;
  let limiteMoldurasBase = 1;
  let diasGaleriaBase = 90;

  const produtosNormalizados = listaBase.map((item) => {
    const cat =
      (item.produto_id ? mapaCatalogo.get(item.produto_id) : undefined) ??
      mapaCatalogo.get(item.codigo_modulo);

    if (item.codigo_modulo === FESTA_CODIGO_MODULO.GALERIA) {
      incluiGaleria = true;
      limiteMoldurasBase = cat?.limite_molduras_base ?? 1;
      diasGaleriaBase = cat?.dias_validade_base ?? 90;
    } else if (item.codigo_modulo === FESTA_CODIGO_MODULO.CONVITE) {
      incluiConvite = true;
    }

    valorProdutosCentavos += item.preco_centavos;
    const creditosItem =
      item.custo_creditos_b2b > 0
        ? item.custo_creditos_b2b
        : (cat?.custo_creditos_b2b ?? 1);
    creditosProdutosB2b += creditosItem;

    return {
      produto_id: item.produto_id ?? cat?.id ?? null,
      codigo_modulo: item.codigo_modulo,
      nome: item.nome || cat?.nome_exibicao || item.codigo_modulo,
      preco_centavos: item.preco_centavos,
      custo_creditos_b2b: creditosItem,
    };
  });

  if (incluiGaleriaInput !== undefined) {
    incluiGaleria = incluiGaleriaInput;
  }
  if (incluiConviteInput !== undefined) {
    incluiConvite = incluiConviteInput;
  }

  return {
    produtosNormalizados,
    valorProdutosCentavos,
    creditosProdutosB2b,
    incluiGaleria,
    incluiConvite,
    limiteMoldurasBase,
    diasGaleriaBase,
  };
}

export async function substituirProdutosEvento(
  eventoId: string,
  produtos: ItemProdutoPedidoInput[]
): Promise<void> {
  await supabaseAdmin
    .from(FESTA_TABLES.EVENTO_PRODUTOS)
    .delete()
    .eq("evento_id", eventoId);

  if (produtos.length > 0) {
    const { error } = await supabaseAdmin
      .from(FESTA_TABLES.EVENTO_PRODUTOS)
      .insert(
        produtos.map((prod) => ({
          evento_id: eventoId,
          produto_id: prod.produto_id ?? null,
          codigo_modulo: prod.codigo_modulo,
          nome: prod.nome,
          preco_centavos: prod.preco_centavos,
          custo_creditos_b2b: prod.custo_creditos_b2b,
        }))
      );
    if (error) throw new AppError(error.message, 400);
  }
}

export function resolverStatusPedidoPosUpgrade(
  statusAtual: FestaEvento["status_pedido"],
  statusInput: FestaEvento["status_pedido"] | undefined,
  valorTotalCentavos: number,
  valorPagoCentavos: number,
  metodoPagamento: FestaEvento["metodo_pagamento"]
): FestaEvento["status_pedido"] {
  if (statusInput !== undefined) {
    return statusInput;
  }

  const ehIsentoCobrancaB2c =
    metodoPagamento === FESTA_METODO_PAGAMENTO.CREDITO_B2B ||
    metodoPagamento === FESTA_METODO_PAGAMENTO.CORTESIA;

  if (
    !ehIsentoCobrancaB2c &&
    statusAtual === FESTA_STATUS_PEDIDO.PAGO_COMPLETO &&
    valorTotalCentavos > valorPagoCentavos
  ) {
    return valorPagoCentavos > 0
      ? FESTA_STATUS_PEDIDO.SINAL_PAGO
      : FESTA_STATUS_PEDIDO.AGUARDANDO_SINAL;
  }

  return statusAtual;
}

export async function obterMapaTotalConfirmadosEventos(
  eventoIds: string[]
): Promise<Map<string, number>> {
  const mapa = new Map<string, number>();
  if (eventoIds.length === 0) return mapa;

  const { data } = await supabaseAdmin
    .from(FESTA_TABLES.EVENTO_CONFIRMACOES)
    .select("evento_id, adultos, criancas")
    .in("evento_id", eventoIds);

  for (const row of data ?? []) {
    const atual = mapa.get(row.evento_id) ?? 0;
    mapa.set(row.evento_id, atual + row.adultos + row.criancas);
  }

  return mapa;
}

const REGEX_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function gerarSlugEventoPorTitulo(
  titulo: string,
  slugInformado?: string | null
): string {
  const origem =
    slugInformado && slugInformado.trim().length > 0 ? slugInformado : titulo;
  const limpo = origem
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return limpo.length >= 2 ? limpo : "festa";
}

export async function buscarEventoPorIdentificadorPublico(
  identificador: string
): Promise<FestaEvento | null> {
  const limpo = identificador.trim().toLowerCase();
  if (!limpo) return null;

  if (limpo === "demo") {
    const { data, error } = await supabaseAdmin
      .from(FESTA_TABLES.EVENTOS)
      .select("*")
      .eq("slug", "demo")
      .limit(1)
      .maybeSingle();
    if (error) throw new AppError(error.message, 500);
    if (data) return data;
  }

  const { data: porCodigo, error: errCodigo } = await supabaseAdmin
    .from(FESTA_TABLES.EVENTOS)
    .select("*")
    .eq("codigo_url", limpo)
    .maybeSingle();
  if (errCodigo) throw new AppError(errCodigo.message, 500);
  if (porCodigo) return porCodigo;

  if (REGEX_UUID.test(limpo)) {
    const { data: porId, error: errId } = await supabaseAdmin
      .from(FESTA_TABLES.EVENTOS)
      .select("*")
      .eq("id", limpo)
      .maybeSingle();
    if (errId) throw new AppError(errId.message, 500);
    if (porId) return porId;
  }

  const { data: porSlug, error: errSlug } = await supabaseAdmin
    .from(FESTA_TABLES.EVENTOS)
    .select("*")
    .eq("slug", limpo)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (errSlug) throw new AppError(errSlug.message, 500);
  return porSlug;
}
