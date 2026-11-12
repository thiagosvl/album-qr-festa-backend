import type { FastifyInstance } from "fastify";
import { uploadController } from "../controllers/upload.controller.js";
import { verifyFestaUsuarioAutenticado } from "../middlewares/auth.middleware.js";

export async function uploadRoutes(app: FastifyInstance) {
  app.addHook("preHandler", verifyFestaUsuarioAutenticado);

  app.post(
    "/presign",
    uploadController.solicitarUploadAutenticado.bind(uploadController)
  );
}
