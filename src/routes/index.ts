import type { FastifyInstance } from "fastify";
import { adminRoutes } from "./admin.routes.js";
import { authRoutes } from "./auth.routes.js";
import { NOME_SERVICO_API } from "../constants/marca.js";
import { gestaoRoutes } from "./gestao.routes.js";
import { parceiroRoutes } from "./parceiro.routes.js";
import { publicRoutes } from "./public.routes.js";

export default async function routes(app: FastifyInstance) {
  app.get("/health", async () => ({
    status: "ok",
    service: NOME_SERVICO_API,
    timestamp: new Date().toISOString(),
  }));

  await app.register(authRoutes, { prefix: "/api/auth" });
  await app.register(publicRoutes, { prefix: "/api/public" });
  await app.register(gestaoRoutes, { prefix: "/api/gestao" });
  await app.register(parceiroRoutes, { prefix: "/api/parceiro" });
  await app.register(adminRoutes, { prefix: "/api/admin" });
}
