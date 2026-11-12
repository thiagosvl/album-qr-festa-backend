import { supabaseAdmin } from "../config/supabase.js";
import {
  FESTA_CODIGO_MODULO,
  FESTA_METODO_PAGAMENTO,
  FESTA_PACOTE_TIPO,
  FESTA_STATUS_PEDIDO,
  FESTA_TABLES,
  FESTA_TIPO_PERFIL,
} from "../constants/festa.enum.js";
import { messages } from "../constants/messages.js";
import { AppError } from "../errors/AppError.js";
import type {
  AtualizarEventoAdminInput,
  CriarEventoAdminInput,
  ItemExtraPedidoInput,
  ItemProdutoPedidoInput,
} from "../schemas/evento.schema.js";
import type {
  AtualizarEventoParceiroB2bInput,
  AtualizarOperadorParceiroInput,
  CriarEventoParceiroB2bInput,
  CriarOperadorParceiroInput,
} from "../schemas/parceiro-b2b.schema.js";
import type {
  FestaCatalogoExtraB2c,
  FestaCodigoModuloEnum,
  FestaUsuario,
} from "../types/database.js";
import type { EventoAdminResponseDto } from "../types/dtos/evento.dto.js";
import { carregarCatalogoProdutosMap } from "./evento-produtos.helper.js";

export async function resolverItensCreditoParceiroB2b(
  modulosInput: FestaCodigoModuloEnum[] | undefined,
  extrasInput: { extra_id: string; quantidade: number }[] | undefined,
  pacoteFallback?: CriarEventoParceiroB2bInput["pacote"]
): Promise<{
  produtos: ItemProdutoPedidoInput[];
  extras: ItemExtraPedidoInput[];
  totalCreditos: number;
}> {
  const [mapaProdutos, extrasRes] = await Promise.all([
    carregarCatalogoProdutosMap(),
    supabaseAdmin
      .from(FESTA_TABLES.CATALOGO_EXTRAS_B2C)
      .select("*")
      .eq("ativo", true),
  ]);

  const mapaExtras = new Map<string, FestaCatalogoExtraB2c>();
  for (const ex of extrasRes.data ?? []) {
    mapaExtras.set(ex.id, ex);
  }

  const modulosUnicos: FestaCodigoModuloEnum[] =
    modulosInput && modulosInput.length > 0
      ? Array.from(new Set(modulosInput))
      : [FESTA_CODIGO_MODULO.GALERIA];

  let totalCreditos = 0;

  const produtos: ItemProdutoPedidoInput[] = modulosUnicos.map((codigo) => {
    const cat = mapaProdutos.get(codigo);
    const creditos = cat?.custo_creditos_b2b ?? 1;
    totalCreditos += creditos;
    return {
      produto_id: cat?.id ?? null,
      codigo_modulo: codigo,
      nome: cat?.nome_exibicao ?? codigo,
      preco_centavos: 0,
      custo_creditos_b2b: creditos,
    };
  });

  if (
    (!modulosInput || modulosInput.length === 0) &&
    pacoteFallback === FESTA_PACOTE_TIPO.COMPLETO &&
    (!extrasInput || extrasInput.length === 0)
  ) {
    totalCreditos = Math.max(totalCreditos, 2);
  }

  const extras: ItemExtraPedidoInput[] = [];
  for (const item of extrasInput ?? []) {
    const cat = mapaExtras.get(item.extra_id);
    if (!cat) continue;
    const creditosUnit = cat.custo_creditos_b2b;
    totalCreditos += creditosUnit * item.quantidade;
    extras.push({
      extra_id: cat.id,
      nome: cat.nome,
      quantidade: item.quantidade,
      preco_unitario_centavos: 0,
      custo_creditos_b2b: creditosUnit,
      entregue: false,
    });
  }

  return { produtos, extras, totalCreditos };
}

export async function montarInputEventoCreditoParceiroB2b(
  parceiroId: string,
  input: CriarEventoParceiroB2bInput
): Promise<{ adminInput: CriarEventoAdminInput; custoCreditos: number }> {
  const { produtos, extras, totalCreditos } =
    await resolverItensCreditoParceiroB2b(
      input.modulos,
      input.extras,
      input.pacote
    );

  const {
    modulos: _modulos,
    extras: _extras,
    nome_anfitriao,
    telefone_anfitriao,
    ...camposRestantes
  } = input;

  return {
    custoCreditos: totalCreditos,
    adminInput: {
      ...camposRestantes,
      subtitulo: input.subtitulo ?? null,
      boas_vindas: input.boas_vindas ?? null,
      nome_aniversariante: input.nome_aniversariante ?? null,
      idade_aniversariante: input.idade_aniversariante ?? null,
      data_evento: input.data_evento ?? null,
      tema_id: input.tema_id ?? null,
      parceiro_id: parceiroId,
      pacote: input.pacote,
      inclui_galeria: produtos.some(
        (p) => p.codigo_modulo === FESTA_CODIGO_MODULO.GALERIA
      ),
      inclui_convite: produtos.some(
        (p) => p.codigo_modulo === FESTA_CODIGO_MODULO.CONVITE
      ),
      creditos_b2b_consumidos: totalCreditos,
      status_pedido: FESTA_STATUS_PEDIDO.PAGO_COMPLETO,
      metodo_pagamento: FESTA_METODO_PAGAMENTO.CREDITO_B2B,
      valor_pacote_centavos: 0,
      desconto_centavos: 0,
      valor_sinal_centavos: 0,
      valor_pago_centavos: 0,
      galeria_publica: true,
      moderacao_previa: false,
      permite_envio_midias: true,
      tempo_slideshow_segundos: 6,
      ativo: true,
      produtos,
      extras,
      anfitriao: nome_anfitriao
        ? {
            nome: nome_anfitriao,
            telefone: telefone_anfitriao ?? null,
            cpf: null,
            email: null,
          }
        : undefined,
    },
  };
}

export async function montarInputAtualizacaoEventoParceiroB2b(
  eventoAtual: EventoAdminResponseDto,
  input: AtualizarEventoParceiroB2bInput
): Promise<{
  adminInput: AtualizarEventoAdminInput;
  diferencaCreditos: number;
  novoTotalCreditos: number;
}> {
  const modulosAlvo =
    input.modulos ??
    eventoAtual.produtos.map((p) => p.codigo_modulo);
  const extrasAlvo =
    input.extras ??
    eventoAtual.extras
      .filter((e): e is typeof e & { extra_id: string } => Boolean(e.extra_id))
      .map((e) => ({ extra_id: e.extra_id, quantidade: e.quantidade }));

  const { produtos, extras, totalCreditos } =
    await resolverItensCreditoParceiroB2b(modulosAlvo, extrasAlvo);

  const novoTotalCreditos = Math.max(
    eventoAtual.creditos_b2b_consumidos,
    totalCreditos
  );
  const diferencaCreditos = Math.max(
    0,
    novoTotalCreditos - eventoAtual.creditos_b2b_consumidos
  );

  const {
    modulos: _modulos,
    extras: _extras,
    nome_anfitriao,
    telefone_anfitriao,
    ...camposRestantes
  } = input;

  return {
    diferencaCreditos,
    novoTotalCreditos,
    adminInput: {
      ...camposRestantes,
      inclui_galeria: produtos.some(
        (p) => p.codigo_modulo === FESTA_CODIGO_MODULO.GALERIA
      ),
      inclui_convite: produtos.some(
        (p) => p.codigo_modulo === FESTA_CODIGO_MODULO.CONVITE
      ),
      creditos_b2b_consumidos: novoTotalCreditos,
      produtos,
      extras,
      ...(nome_anfitriao
        ? {
            anfitriao: {
              nome: nome_anfitriao,
              telefone: telefone_anfitriao ?? null,
              cpf: eventoAtual.anfitriao?.cpf ?? null,
              email: eventoAtual.anfitriao?.email ?? null,
            },
          }
        : {}),
    },
  };
}

export async function listarOperadoresParceiroB2b(
  parceiroId: string
): Promise<FestaUsuario[]> {
  const { data, error } = await supabaseAdmin
    .from(FESTA_TABLES.USUARIOS)
    .select("*")
    .eq("parceiro_id", parceiroId)
    .eq("tipo_perfil", FESTA_TIPO_PERFIL.PARCEIRO_OPERADOR)
    .order("created_at", { ascending: false });

  if (error) {
    throw new AppError(error.message, 500);
  }

  return data ?? [];
}

export async function criarOperadorParceiroB2b(
  parceiroId: string,
  input: CriarOperadorParceiroInput
): Promise<FestaUsuario> {
  const emailLimpo = input.email.trim().toLowerCase();
  const senhaLimpa = input.senha_acesso.trim();

  const { data: criadoAuth, error: createAuthErr } =
    await supabaseAdmin.auth.admin.createUser({
      email: emailLimpo,
      password: senhaLimpa,
      email_confirm: true,
    });

  if (createAuthErr || !criadoAuth.user) {
    throw new AppError(
      createAuthErr?.message || messages.auth.emailAcessoEmUso,
      400
    );
  }

  const { data: operador, error: insErr } = await supabaseAdmin
    .from(FESTA_TABLES.USUARIOS)
    .insert({
      auth_user_id: criadoAuth.user.id,
      parceiro_id: parceiroId,
      nome: input.nome.trim(),
      email: emailLimpo,
      telefone: input.telefone?.trim() || null,
      tipo_perfil: FESTA_TIPO_PERFIL.PARCEIRO_OPERADOR,
      ativo: input.ativo ?? true,
    })
    .select("*")
    .single();

  if (insErr || !operador) {
    await supabaseAdmin.auth.admin.deleteUser(criadoAuth.user.id);
    throw new AppError(
      insErr?.message || messages.parceiro.falhaCadastroOperador,
      400
    );
  }

  return operador;
}

export async function atualizarOperadorParceiroB2b(
  parceiroId: string,
  operadorId: string,
  input: AtualizarOperadorParceiroInput
): Promise<FestaUsuario> {
  const { data: operadorExistente, error: findErr } = await supabaseAdmin
    .from(FESTA_TABLES.USUARIOS)
    .select("*")
    .eq("id", operadorId)
    .eq("parceiro_id", parceiroId)
    .eq("tipo_perfil", FESTA_TIPO_PERFIL.PARCEIRO_OPERADOR)
    .maybeSingle();

  if (findErr || !operadorExistente) {
    throw new AppError(messages.parceiro.operadorNaoEncontrado, 404);
  }

  const emailLimpo = input.email?.trim().toLowerCase();
  const senhaLimpa = input.senha_acesso?.trim() || null;

  if (operadorExistente.auth_user_id) {
    const authUpdate: {
      email?: string;
      password?: string;
      email_confirm?: boolean;
    } = {};

    if (emailLimpo && emailLimpo !== operadorExistente.email?.toLowerCase()) {
      authUpdate.email = emailLimpo;
      authUpdate.email_confirm = true;
    }

    if (senhaLimpa) {
      authUpdate.password = senhaLimpa;
    }

    if (Object.keys(authUpdate).length > 0) {
      const { error: authErr } =
        await supabaseAdmin.auth.admin.updateUserById(
          operadorExistente.auth_user_id,
          authUpdate
        );
      if (authErr) {
        throw new AppError(authErr.message, 400);
      }
    }
  }

  const { data: atualizado, error: updErr } = await supabaseAdmin
    .from(FESTA_TABLES.USUARIOS)
    .update({
      nome: input.nome !== undefined ? input.nome.trim() : operadorExistente.nome,
      email: emailLimpo ?? operadorExistente.email,
      telefone:
        input.telefone !== undefined
          ? input.telefone?.trim() || null
          : operadorExistente.telefone,
      ativo:
        input.ativo !== undefined ? input.ativo : operadorExistente.ativo,
    })
    .eq("id", operadorExistente.id)
    .select("*")
    .single();

  if (updErr || !atualizado) {
    throw new AppError(
      updErr?.message || messages.parceiro.falhaAtualizacaoOperador,
      400
    );
  }

  return atualizado;
}

export async function excluirOperadorParceiroB2b(
  parceiroId: string,
  operadorId: string
): Promise<void> {
  const { data: operadorExistente, error: findErr } = await supabaseAdmin
    .from(FESTA_TABLES.USUARIOS)
    .select("*")
    .eq("id", operadorId)
    .eq("parceiro_id", parceiroId)
    .eq("tipo_perfil", FESTA_TIPO_PERFIL.PARCEIRO_OPERADOR)
    .maybeSingle();

  if (findErr || !operadorExistente) {
    throw new AppError(messages.parceiro.operadorNaoEncontrado, 404);
  }

  const { error: delErr } = await supabaseAdmin
    .from(FESTA_TABLES.USUARIOS)
    .delete()
    .eq("id", operadorExistente.id);

  if (delErr) {
    throw new AppError(delErr.message, 400);
  }

  if (operadorExistente.auth_user_id) {
    await supabaseAdmin.auth.admin.deleteUser(operadorExistente.auth_user_id);
  }
}
