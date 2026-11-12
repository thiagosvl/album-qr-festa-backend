import type { FastifyInstance } from "fastify";
import { adminRoutes } from "./admin.routes.js";
import { authRoutes } from "./auth.routes.js";
import { NOME_SERVICO_API } from "../constants/marca.js";
import { gestaoRoutes } from "./gestao.routes.js";
import { parceiroRoutes } from "./parceiro.routes.js";
import { publicRoutes } from "./public.routes.js";
import { uploadRoutes } from "./upload.routes.js";

export default async function routes(app: FastifyInstance) {
  const healthHandler = async () => ({
    status: "ok",
    service: NOME_SERVICO_API,
    timestamp: new Date().toISOString(),
  });

  app.get("/health", healthHandler);
  app.get("/api/health", healthHandler);

  await app.register(authRoutes, { prefix: "/api/auth" });
  await app.register(publicRoutes, { prefix: "/api/public" });
  await app.register(gestaoRoutes, { prefix: "/api/gestao" });
  await app.register(parceiroRoutes, { prefix: "/api/parceiro" });
  await app.register(adminRoutes, { prefix: "/api/admin" });
  await app.register(uploadRoutes, { prefix: "/api/uploads" });
}
