import type { FastifyReply, FastifyRequest } from "fastify";
import { supabaseAdmin } from "../config/supabase.js";
import { FESTA_TABLES, FESTA_TIPO_PERFIL } from "../constants/festa.enum.js";
import { messages } from "../constants/messages.js";
import type { AuthenticatedFestaRequest } from "../types/request.type.js";

async function autenticarFestaUsuario(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<AuthenticatedFestaRequest | null> {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    await reply.status(401).send({
      status: "error",
      error: messages.auth.tokenAusente,
      message: messages.auth.tokenAusente,
    });
    return null;
  }

  const token = authHeader.slice(7).trim();
  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.getUser(token);

  if (authError || !user) {
    await reply.status(401).send({
      status: "error",
      error: messages.auth.tokenInvalido,
      message: messages.auth.tokenInvalido,
    });
    return null;
  }

  const { data: festaUsuario, error: dbError } = await supabaseAdmin
    .from(FESTA_TABLES.USUARIOS)
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (dbError || !festaUsuario) {
    await reply.status(403).send({
      status: "error",
      error: messages.auth.usuarioNaoEncontrado,
      message: messages.auth.usuarioNaoEncontrado,
    });
    return null;
  }

  if (!festaUsuario.ativo) {
    await reply.status(403).send({
      status: "error",
      error: messages.auth.usuarioInativo,
      message: messages.auth.usuarioInativo,
    });
    return null;
  }

  const typedReq = request as AuthenticatedFestaRequest;
  typedReq.authUser = user;
  typedReq.festaUsuario = festaUsuario;
  return typedReq;
}

export async function verifyFestaUsuarioAutenticado(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const typedReq = await autenticarFestaUsuario(request, reply);
  if (!typedReq) return;

  const { tipo_perfil, parceiro_id } = typedReq.festaUsuario;
  const ehPerfilParceiro =
    tipo_perfil === FESTA_TIPO_PERFIL.PARCEIRO_ADMIN ||
    tipo_perfil === FESTA_TIPO_PERFIL.PARCEIRO_OPERADOR;

  if (ehPerfilParceiro) {
    if (!parceiro_id) {
      return reply.status(403).send({
        status: "error",
        error: messages.auth.acessoRestritoParceiro,
        message: messages.auth.acessoRestritoParceiro,
      });
    }

    const { data: parceiro } = await supabaseAdmin
      .from(FESTA_TABLES.PARCEIROS_B2B)
      .select("id, ativo")
      .eq("id", parceiro_id)
      .maybeSingle();

    if (!parceiro || !parceiro.ativo) {
      return reply.status(403).send({
        status: "error",
        error: messages.auth.parceiroInativo,
        message: messages.auth.parceiroInativo,
      });
    }
  }
}

export async function verifyFestaAdmin(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const typedReq = await autenticarFestaUsuario(request, reply);
  if (!typedReq) return;

  if (typedReq.festaUsuario.tipo_perfil !== FESTA_TIPO_PERFIL.ADMIN) {
    return reply.status(403).send({
      status: "error",
      error: messages.auth.acessoRestritoAdmin,
      message: messages.auth.acessoRestritoAdmin,
    });
  }
}

export async function verifyFestaParceiro(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const typedReq = await autenticarFestaUsuario(request, reply);
  if (!typedReq) return;

  const { tipo_perfil, parceiro_id } = typedReq.festaUsuario;
  const ehPerfilParceiro =
    tipo_perfil === FESTA_TIPO_PERFIL.PARCEIRO_ADMIN ||
    tipo_perfil === FESTA_TIPO_PERFIL.PARCEIRO_OPERADOR;

  if (!ehPerfilParceiro || !parceiro_id) {
    return reply.status(403).send({
      status: "error",
      error: messages.auth.acessoRestritoParceiro,
      message: messages.auth.acessoRestritoParceiro,
    });
  }

  const { data: parceiro } = await supabaseAdmin
    .from(FESTA_TABLES.PARCEIROS_B2B)
    .select("id, ativo")
    .eq("id", parceiro_id)
    .maybeSingle();

  if (!parceiro || !parceiro.ativo) {
    return reply.status(403).send({
      status: "error",
      error: messages.auth.parceiroInativo,
      message: messages.auth.parceiroInativo,
    });
  }
}

export async function verifyFestaParceiroAdmin(
  request: FastifyRequest,
  reply: FastifyReply
) {
  await verifyFestaParceiro(request, reply);
  if (reply.sent) return;

  const typedReq = request as AuthenticatedFestaRequest;
  if (typedReq.festaUsuario.tipo_perfil !== FESTA_TIPO_PERFIL.PARCEIRO_ADMIN) {
    return reply.status(403).send({
      status: "error",
      error: messages.auth.acessoRestritoParceiro,
      message: messages.auth.acessoRestritoParceiro,
    });
  }
}

export async function verifyFestaAdminOrParceiroEvento(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const typedReq = await autenticarFestaUsuario(request, reply);
  if (!typedReq) return;

  const { tipo_perfil, parceiro_id } = typedReq.festaUsuario;

  if (tipo_perfil === FESTA_TIPO_PERFIL.ADMIN) {
    return;
  }

  const ehPerfilParceiro =
    tipo_perfil === FESTA_TIPO_PERFIL.PARCEIRO_ADMIN ||
    tipo_perfil === FESTA_TIPO_PERFIL.PARCEIRO_OPERADOR;

  if (!ehPerfilParceiro || !parceiro_id) {
    return reply.status(403).send({
      status: "error",
      error: messages.auth.acessoRestritoAdmin,
      message: messages.auth.acessoRestritoAdmin,
    });
  }

  const { data: parceiro } = await supabaseAdmin
    .from(FESTA_TABLES.PARCEIROS_B2B)
    .select("id, ativo")
    .eq("id", parceiro_id)
    .maybeSingle();

  if (!parceiro || !parceiro.ativo) {
    return reply.status(403).send({
      status: "error",
      error: messages.auth.parceiroInativo,
      message: messages.auth.parceiroInativo,
    });
  }

  const { eventoId } = request.params as { eventoId?: string };
  if (!eventoId) {
    return reply.status(403).send({
      status: "error",
      error: messages.auth.eventoNaoPertenceAoParceiro,
      message: messages.auth.eventoNaoPertenceAoParceiro,
    });
  }

  const { data: evento } = await supabaseAdmin
    .from(FESTA_TABLES.EVENTOS)
    .select("id, parceiro_id")
    .eq("id", eventoId)
    .maybeSingle();

  if (!evento || evento.parceiro_id !== parceiro_id) {
    return reply.status(403).send({
      status: "error",
      error: messages.auth.eventoNaoPertenceAoParceiro,
      message: messages.auth.eventoNaoPertenceAoParceiro,
    });
  }
}
