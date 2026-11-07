import type { FastifyInstance } from "fastify";
import { authRecuperacaoController } from "../controllers/auth-recuperacao.controller.js";
import { verifyFestaUsuarioAutenticado } from "../middlewares/auth.middleware.js";

export async function authRoutes(app: FastifyInstance) {
  app.get(
    "/me",
    { preHandler: verifyFestaUsuarioAutenticado },
    authRecuperacaoController.obterSessaoAtual.bind(authRecuperacaoController)
  );

  app.post(
    "/recuperacao/solicitar",
    authRecuperacaoController.solicitarRecuperacao.bind(
      authRecuperacaoController
    )
  );

  app.post(
    "/recuperacao/validar",
    authRecuperacaoController.validarCodigo.bind(authRecuperacaoController)
  );

  app.post(
    "/recuperacao/resetar",
    authRecuperacaoController.resetarSenhaComCodigo.bind(
      authRecuperacaoController
    )
  );
}
