import { supabaseAdmin } from "../config/supabase.js";
import { FESTA_TABLES, FESTA_TIPO_PERFIL } from "../constants/festa.enum.js";
import { messages } from "../constants/messages.js";
import { AppError } from "../errors/AppError.js";
import type {
  AtualizarOperadorParceiroInput,
  CriarOperadorParceiroInput,
} from "../schemas/parceiro-b2b.schema.js";
import type { FestaUsuario } from "../types/database.js";

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
      insErr?.message || "Não foi possível cadastrar o operador.",
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
    throw new AppError("Operador não encontrado neste parceiro B2B.", 404);
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
      updErr?.message || "Não foi possível atualizar o operador.",
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
    throw new AppError("Operador não encontrado neste parceiro B2B.", 404);
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
