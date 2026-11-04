import type { FastifyRequest } from "fastify";
import type { User } from "@supabase/supabase-js";
import type { FestaUsuario } from "./database.js";

export interface AuthenticatedFestaRequest extends FastifyRequest {
  authUser: User;
  festaUsuario: FestaUsuario;
}
