import type { FastifyInstance } from "fastify";
import { parceiroB2bController } from "../controllers/parceiro-b2b.controller.js";
import {
  verifyFestaParceiro,
  verifyFestaParceiroAdmin,
} from "../middlewares/auth.middleware.js";

export async function parceiroRoutes(app: FastifyInstance) {
  app.addHook("preHandler", verifyFestaParceiro);

  app.get(
    "/portal",
    parceiroB2bController.obterPortalParceiro.bind(parceiroB2bController)
  );
  app.patch(
    "/portal",
    { preHandler: verifyFestaParceiroAdmin },
    parceiroB2bController.atualizarPerfilPortalParceiro.bind(
      parceiroB2bController
    )
  );
  app.post(
    "/eventos",
    parceiroB2bController.criarEventoPortalParceiro.bind(parceiroB2bController)
  );
  app.post(
    "/operadores",
    { preHandler: verifyFestaParceiroAdmin },
    parceiroB2bController.criarOperadorPortalParceiro.bind(
      parceiroB2bController
    )
  );
  app.patch(
    "/operadores/:operadorId",
    { preHandler: verifyFestaParceiroAdmin },
    parceiroB2bController.atualizarOperadorPortalParceiro.bind(
      parceiroB2bController
    )
  );
  app.delete(
    "/operadores/:operadorId",
    { preHandler: verifyFestaParceiroAdmin },
    parceiroB2bController.excluirOperadorPortalParceiro.bind(
      parceiroB2bController
    )
  );
}
