import { randomInt } from "crypto";
import { env } from "../config/env.js";
import { supabaseAdmin } from "../config/supabase.js";
import { FESTA_TABLES, FESTA_TIPO_PERFIL } from "../constants/festa.enum.js";
import { messages } from "../constants/messages.js";
import { AppError } from "../errors/AppError.js";
import type { FestaUsuario } from "../types/database.js";
import type {
  ResetarSenhaRecuperacaoResponseDto,
  SessaoUsuarioAutenticadoDto,
  SolicitarRecuperacaoResponseDto,
  ValidarCodigoRecuperacaoResponseDto,
} from "../types/dtos/auth.dto.js";
import { dispararEmailRecuperacaoSenha } from "../utils/email-recuperacao.helper.js";
import { sincronizarCredenciaisParceiroB2b } from "../utils/parceiro-auth.helper.js";

function mascararEmail(email: string): string {
  const [userPart, domain] = email.split("@");
  if (!userPart || !domain) return email;
  if (userPart.length <= 3) {
    return `${userPart.slice(0, 1)}***@${domain}`;
  }
  return `${userPart.slice(0, 2)}***${userPart.slice(-1)}@${domain}`;
}

async function obterOuProvisionarAdminParceiro(
  parceiro: Awaited<ReturnType<typeof buscarParceiroAtivoPorEmail>>
): Promise<FestaUsuario> {
  if (!parceiro) {
    throw new AppError(messages.auth.contaRecuperacaoNaoEncontrada, 404);
  }
  if (!parceiro.email?.trim()) {
    throw new AppError(messages.auth.emailAusenteParaRecuperacao, 400);
  }

  const { data: existente } = await supabaseAdmin
    .from(FESTA_TABLES.USUARIOS)
    .select("*")
    .eq("parceiro_id", parceiro.id)
    .eq("tipo_perfil", FESTA_TIPO_PERFIL.PARCEIRO_ADMIN)
    .eq("ativo", true)
    .maybeSingle();

  if (existente) return garantirAuthUserVinculado(existente);

  const senhaInicial = `Parceiro@${parceiro.id.slice(0, 8)}`;
  await sincronizarCredenciaisParceiroB2b(parceiro, senhaInicial);

  const { data: criado } = await supabaseAdmin
    .from(FESTA_TABLES.USUARIOS)
    .select("*")
    .eq("parceiro_id", parceiro.id)
    .eq("tipo_perfil", FESTA_TIPO_PERFIL.PARCEIRO_ADMIN)
    .maybeSingle();

  if (!criado) throw new AppError(messages.auth.contaRecuperacaoNaoEncontrada, 404);
  return criado;
}

async function buscarParceiroAtivoPorEmail(emailLimpo: string) {
  const { data } = await supabaseAdmin
    .from(FESTA_TABLES.PARCEIROS_B2B)
    .select("*")
    .ilike("email", emailLimpo)
    .eq("ativo", true)
    .maybeSingle();
  return data;
}

async function resolverUsuarioPorIdentificador(
  identificadorBruto: string
): Promise<FestaUsuario> {
  const identificador = identificadorBruto.trim();
  if (identificador.includes("@")) {
    const emailLimpo = identificador.toLowerCase();
    const { data: usuarioExistente } = await supabaseAdmin
      .from(FESTA_TABLES.USUARIOS)
      .select("*")
      .ilike("email", emailLimpo)
      .eq("ativo", true)
      .maybeSingle();

    if (usuarioExistente) return garantirAuthUserVinculado(usuarioExistente);
    const parceiroPorEmail = await buscarParceiroAtivoPorEmail(emailLimpo);
    return obterOuProvisionarAdminParceiro(parceiroPorEmail);
  }

  const digitos = identificador.replace(/\D/g, "");
  if (digitos.length < 11) {
    throw new AppError(messages.auth.contaRecuperacaoNaoEncontrada, 404);
  }

  const { data: parceirosAtivos } = await supabaseAdmin
    .from(FESTA_TABLES.PARCEIROS_B2B)
    .select("*")
    .eq("ativo", true);

  const parceiroMatch = (parceirosAtivos ?? []).find(
    (p) => (p.documento ?? "").replace(/\D/g, "") === digitos
  );

  if (parceiroMatch) {
    return obterOuProvisionarAdminParceiro(parceiroMatch);
  }

  const { data: usuariosComCpf } = await supabaseAdmin
    .from(FESTA_TABLES.USUARIOS)
    .select("*")
    .eq("ativo", true)
    .not("cpf", "is", null);

  const usuarioPorCpf = (usuariosComCpf ?? []).find(
    (u) => (u.cpf ?? "").replace(/\D/g, "") === digitos
  );

  if (usuarioPorCpf) return garantirAuthUserVinculado(usuarioPorCpf);
  throw new AppError(messages.auth.contaRecuperacaoNaoEncontrada, 404);
}

async function garantirAuthUserVinculado(usuario: FestaUsuario): Promise<FestaUsuario> {
  if (usuario.auth_user_id) return usuario;

  const emailLimpo = usuario.email?.trim().toLowerCase();
  if (!emailLimpo) throw new AppError(messages.auth.emailAusenteParaRecuperacao, 400);

  const senhaInicial = `Festa@${usuario.id.slice(0, 8)}`;
  const { data: criadoAuth, error: authErr } =
    await supabaseAdmin.auth.admin.createUser({
      email: emailLimpo,
      password: senhaInicial,
      email_confirm: true,
    });

  if (authErr || !criadoAuth.user) {
    throw new AppError(authErr?.message || messages.auth.emailAcessoEmUso, 400);
  }

  const { data: atualizado, error: updErr } = await supabaseAdmin
    .from(FESTA_TABLES.USUARIOS)
    .update({ auth_user_id: criadoAuth.user.id })
    .eq("id", usuario.id)
    .select("*")
    .single();

  if (updErr || !atualizado) throw new AppError(messages.sistema.erroInterno, 500);
  return atualizado;
}

class AuthRecuperacaoService {
  formatarSessaoUsuario(festaUsuario: FestaUsuario): SessaoUsuarioAutenticadoDto {
    return {
      id: festaUsuario.id,
      nome: festaUsuario.nome,
      email: festaUsuario.email,
      tipo_perfil: festaUsuario.tipo_perfil,
      parceiro_id: festaUsuario.parceiro_id,
    };
  }

  async solicitarRecuperacao(identificador: string): Promise<SolicitarRecuperacaoResponseDto> {
    const usuario = await resolverUsuarioPorIdentificador(identificador);
    const emailDestino = usuario.email?.trim().toLowerCase();
    if (!emailDestino) throw new AppError(messages.auth.emailAusenteParaRecuperacao, 400);

    const { data: ultimoCodigo } = await supabaseAdmin
      .from(FESTA_TABLES.RECUPERACOES_SENHA)
      .select("created_at")
      .eq("usuario_id", usuario.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (ultimoCodigo?.created_at) {
      const segundosDesdeUltimo =
        (Date.now() - new Date(ultimoCodigo.created_at).getTime()) / 1000;
      if (segundosDesdeUltimo < 60) {
        throw new AppError(messages.auth.cooldownRecuperacao, 429);
      }
    }

    await supabaseAdmin
      .from(FESTA_TABLES.RECUPERACOES_SENHA)
      .update({ usado: true })
      .eq("usuario_id", usuario.id)
      .eq("usado", false);

    const codigo = randomInt(100000, 999999).toString();
    const expiraEm = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const { error: insErr } = await supabaseAdmin
      .from(FESTA_TABLES.RECUPERACOES_SENHA)
      .insert({
        usuario_id: usuario.id,
        codigo,
        expira_em: expiraEm,
        usado: false,
      });

    if (insErr) {
      throw new AppError(insErr.message, 500);
    }

    const { enviadoPorEmail } = await dispararEmailRecuperacaoSenha({
      emailDestino,
      nome: usuario.nome,
      codigo,
    });

    return {
      email_mascarado: mascararEmail(emailDestino),
      enviado_por_email: enviadoPorEmail,
      ...(env.NODE_ENV !== "production" && !enviadoPorEmail
        ? { codigo_dev: codigo }
        : {}),
    };
  }

  async validarCodigo(
    identificador: string,
    codigo: string
  ): Promise<ValidarCodigoRecuperacaoResponseDto> {
    const usuario = await resolverUsuarioPorIdentificador(identificador);
    const agoraIso = new Date().toISOString();

    const { data: recuperacao } = await supabaseAdmin
      .from(FESTA_TABLES.RECUPERACOES_SENHA)
      .select("*")
      .eq("usuario_id", usuario.id)
      .eq("codigo", codigo.trim())
      .eq("usado", false)
      .gt("expira_em", agoraIso)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!recuperacao) {
      throw new AppError(messages.auth.codigoRecuperacaoInvalido, 400);
    }

    const { error: updErr } = await supabaseAdmin
      .from(FESTA_TABLES.RECUPERACOES_SENHA)
      .update({ usado: true })
      .eq("id", recuperacao.id);

    if (updErr) {
      throw new AppError(updErr.message, 500);
    }

    return { recovery_id: recuperacao.id };
  }

  async resetarSenhaComCodigo(
    recoveryId: string,
    novaSenha: string
  ): Promise<ResetarSenhaRecuperacaoResponseDto> {
    const { data: recuperacao } = await supabaseAdmin
      .from(FESTA_TABLES.RECUPERACOES_SENHA)
      .select("*")
      .eq("id", recoveryId)
      .eq("usado", true)
      .maybeSingle();

    if (!recuperacao) {
      throw new AppError(messages.auth.sessaoRecuperacaoExpirada, 400);
    }

    const minutosPassados =
      (Date.now() - new Date(recuperacao.created_at).getTime()) / (1000 * 60);
    if (minutosPassados > 60) {
      throw new AppError(messages.auth.sessaoRecuperacaoExpirada, 400);
    }

    const { data: usuario } = await supabaseAdmin
      .from(FESTA_TABLES.USUARIOS)
      .select("*")
      .eq("id", recuperacao.usuario_id)
      .eq("ativo", true)
      .maybeSingle();

    if (!usuario) {
      throw new AppError(messages.auth.usuarioNaoEncontrado, 404);
    }

    const usuarioComAuth = await garantirAuthUserVinculado(usuario);
    const emailLogin = usuarioComAuth.email?.trim().toLowerCase();

    if (!usuarioComAuth.auth_user_id || !emailLogin) {
      throw new AppError(messages.auth.emailAusenteParaRecuperacao, 400);
    }

    const { error: updateAuthErr } =
      await supabaseAdmin.auth.admin.updateUserById(
        usuarioComAuth.auth_user_id,
        {
          password: novaSenha,
          email_confirm: true,
        }
      );

    if (updateAuthErr) {
      throw new AppError(updateAuthErr.message, 400);
    }

    const { data: loginData, error: loginErr } =
      await supabaseAdmin.auth.signInWithPassword({
        email: emailLogin,
        password: novaSenha,
      });

    if (loginErr || !loginData.session) {
      throw new AppError(
        loginErr?.message || messages.auth.falhaSessaoAutomatica,
        500
      );
    }

    return {
      session: {
        access_token: loginData.session.access_token,
        refresh_token: loginData.session.refresh_token,
      },
      tipo_perfil: usuarioComAuth.tipo_perfil,
    };
  }
}

export const authRecuperacaoService = new AuthRecuperacaoService();
