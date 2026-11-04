import type { FastifyReply, FastifyRequest } from "fastify";
import { supabaseAdmin } from "../config/supabase.js";
import { FESTA_TABLES, FESTA_TIPO_PERFIL } from "../constants/festa.enum.js";
import { messages } from "../constants/messages.js";
import type { AuthenticatedFestaRequest } from "../types/request.type.js";

export async function verifyFestaAdmin(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return reply.status(401).send({
      status: "error",
      error: messages.auth.tokenAusente,
      message: messages.auth.tokenAusente,
    });
  }

  const token = authHeader.slice(7).trim();
  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.getUser(token);

  if (authError || !user) {
    return reply.status(401).send({
      status: "error",
      error: messages.auth.tokenInvalido,
      message: messages.auth.tokenInvalido,
    });
  }

  const { data: festaUsuario, error: dbError } = await supabaseAdmin
    .from(FESTA_TABLES.USUARIOS)
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (dbError || !festaUsuario) {
    return reply.status(403).send({
      status: "error",
      error: messages.auth.usuarioNaoEncontrado,
      message: messages.auth.usuarioNaoEncontrado,
    });
  }

  if (!festaUsuario.ativo) {
    return reply.status(403).send({
      status: "error",
      error: messages.auth.usuarioInativo,
      message: messages.auth.usuarioInativo,
    });
  }

  if (festaUsuario.tipo_perfil !== FESTA_TIPO_PERFIL.ADMIN) {
    return reply.status(403).send({
      status: "error",
      error: messages.auth.acessoRestritoAdmin,
      message: messages.auth.acessoRestritoAdmin,
    });
  }

  const typedReq = request as AuthenticatedFestaRequest;
  typedReq.authUser = user;
  typedReq.festaUsuario = festaUsuario;
}
