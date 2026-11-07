import { supabaseAdmin } from "../config/supabase.js";
import { FESTA_TABLES, FESTA_TIPO_PERFIL } from "../constants/festa.enum.js";
import { messages } from "../constants/messages.js";
import { AppError } from "../errors/AppError.js";
import type { FestaParceiroB2b } from "../types/database.js";

export interface StatusCredencialParceiro {
  possui_login: boolean;
  email_acesso: string | null;
}

export async function obterMapaCredenciaisParceiros(
  parceiroIds: string[]
): Promise<Map<string, StatusCredencialParceiro>> {
  const mapa = new Map<string, StatusCredencialParceiro>();
  if (parceiroIds.length === 0) return mapa;

  const { data: usuarios } = await supabaseAdmin
    .from(FESTA_TABLES.USUARIOS)
    .select("parceiro_id, auth_user_id, email, ativo")
    .in("parceiro_id", parceiroIds)
    .in("tipo_perfil", [
      FESTA_TIPO_PERFIL.PARCEIRO_ADMIN,
      FESTA_TIPO_PERFIL.PARCEIRO_OPERADOR,
    ]);

  for (const u of usuarios ?? []) {
    if (!u.parceiro_id) continue;
    if (u.auth_user_id && u.ativo) {
      mapa.set(u.parceiro_id, {
        possui_login: true,
        email_acesso: u.email ?? null,
      });
    } else if (!mapa.has(u.parceiro_id)) {
      mapa.set(u.parceiro_id, {
        possui_login: false,
        email_acesso: u.email ?? null,
      });
    }
  }

  return mapa;
}

export async function sincronizarCredenciaisParceiroB2b(
  parceiro: FestaParceiroB2b,
  senhaAcesso?: string | null
): Promise<void> {
  const senhaLimpa = senhaAcesso?.trim() || null;
  const emailLimpo = parceiro.email?.trim().toLowerCase() || null;

  const { data: usuarioExistente } = await supabaseAdmin
    .from(FESTA_TABLES.USUARIOS)
    .select("*")
    .eq("parceiro_id", parceiro.id)
    .eq("tipo_perfil", FESTA_TIPO_PERFIL.PARCEIRO_ADMIN)
    .maybeSingle();

  if (usuarioExistente?.auth_user_id) {
    const authUpdate: {
      email?: string;
      password?: string;
      email_confirm?: boolean;
    } = {};

    if (emailLimpo && emailLimpo !== usuarioExistente.email?.toLowerCase()) {
      authUpdate.email = emailLimpo;
      authUpdate.email_confirm = true;
    }

    if (senhaLimpa) {
      authUpdate.password = senhaLimpa;
    }

    if (Object.keys(authUpdate).length > 0) {
      const { error: authErr } =
        await supabaseAdmin.auth.admin.updateUserById(
          usuarioExistente.auth_user_id,
          authUpdate
        );
      if (authErr) {
        throw new AppError(authErr.message, 400);
      }
    }

    const { error: updErr } = await supabaseAdmin
      .from(FESTA_TABLES.USUARIOS)
      .update({
        nome: parceiro.nome_empresa,
        email: emailLimpo ?? usuarioExistente.email,
        telefone: parceiro.telefone,
        ativo: parceiro.ativo,
      })
      .eq("id", usuarioExistente.id);

    if (updErr) {
      throw new AppError(updErr.message, 400);
    }
    return;
  }

  if (!senhaLimpa) {
    return;
  }

  if (!emailLimpo) {
    throw new AppError(
      "Informe o e-mail do parceiro B2B para configurar a senha de acesso.",
      400
    );
  }

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

  if (usuarioExistente) {
    const { error: updErr } = await supabaseAdmin
      .from(FESTA_TABLES.USUARIOS)
      .update({
        auth_user_id: criadoAuth.user.id,
        nome: parceiro.nome_empresa,
        email: emailLimpo,
        telefone: parceiro.telefone,
        ativo: parceiro.ativo,
      })
      .eq("id", usuarioExistente.id);

    if (updErr) throw new AppError(updErr.message, 400);
  } else {
    const { error: insErr } = await supabaseAdmin
      .from(FESTA_TABLES.USUARIOS)
      .insert({
        auth_user_id: criadoAuth.user.id,
        parceiro_id: parceiro.id,
        nome: parceiro.nome_empresa,
        email: emailLimpo,
        telefone: parceiro.telefone,
        tipo_perfil: FESTA_TIPO_PERFIL.PARCEIRO_ADMIN,
        ativo: parceiro.ativo,
      });

    if (insErr) throw new AppError(insErr.message, 400);
  }
}

export async function gerarTokenImpersonateParceiroB2b(
  parceiroId: string
): Promise<{ tokenHash: string }> {
  const { data: parceiro, error: findErr } = await supabaseAdmin
    .from(FESTA_TABLES.PARCEIROS_B2B)
    .select("*")
    .eq("id", parceiroId)
    .maybeSingle();

  if (findErr || !parceiro) {
    throw new AppError("Parceiro B2B não encontrado.", 404);
  }

  const { data: usuarioExistente } = await supabaseAdmin
    .from(FESTA_TABLES.USUARIOS)
    .select("*")
    .eq("parceiro_id", parceiro.id)
    .eq("tipo_perfil", FESTA_TIPO_PERFIL.PARCEIRO_ADMIN)
    .maybeSingle();

  const emailAlvo = (
    usuarioExistente?.email ||
    parceiro.email ||
    ""
  )
    .trim()
    .toLowerCase();

  if (!emailAlvo) {
    throw new AppError(
      "Este parceiro não possui e-mail cadastrado. Informe o e-mail na edição do parceiro para gerar o link de acesso.",
      400
    );
  }

  if (!usuarioExistente?.auth_user_id) {
    const senhaTemporariaInicial = `Parceiro@${parceiro.id.slice(0, 8)}`;
    await sincronizarCredenciaisParceiroB2b(
      { ...parceiro, email: emailAlvo },
      senhaTemporariaInicial
    );
  }

  const { data, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email: emailAlvo,
  });

  if (linkErr || !data?.properties?.hashed_token) {
    throw new AppError(
      linkErr?.message ||
        "Não foi possível gerar o link de acesso para este parceiro.",
      500
    );
  }

  return {
    tokenHash: data.properties.hashed_token,
  };
}

