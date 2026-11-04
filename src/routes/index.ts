import type { FastifyInstance } from "fastify";
import { adminRoutes } from "./admin.routes.js";
import { gestaoRoutes } from "./gestao.routes.js";
import { publicRoutes } from "./public.routes.js";

export default async function routes(app: FastifyInstance) {
  app.get("/health", async () => ({
    status: "ok",
    service: "album-qr-festa-backend",
    timestamp: new Date().toISOString(),
  }));

  await app.register(publicRoutes, { prefix: "/api/public" });
  await app.register(gestaoRoutes, { prefix: "/api/gestao" });
  await app.register(adminRoutes, { prefix: "/api/admin" });
}
