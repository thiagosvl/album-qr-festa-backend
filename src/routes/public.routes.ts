import type { FastifyInstance } from "fastify";
import { catalogoController } from "../controllers/catalogo.controller.js";
import { eventoController } from "../controllers/evento.controller.js";
import { midiaController } from "../controllers/midia.controller.js";
import { parceiroB2bController } from "../controllers/parceiro-b2b.controller.js";

export async function publicRoutes(app: FastifyInstance) {
  app.get("/catalogo", catalogoController.obterPublico.bind(catalogoController));

  app.get(
    "/parceiro-portal",
    parceiroB2bController.obterPortalParceiro.bind(parceiroB2bController)
  );
  app.patch(
    "/parceiro-portal/:id",
    parceiroB2bController.atualizarPerfilPortalParceiro.bind(parceiroB2bController)
  );
  app.post(
    "/parceiro-portal/:id/eventos",
    parceiroB2bController.criarEventoPortalParceiro.bind(parceiroB2bController)
  );

  app.get("/eventos/:slug", eventoController.obterPublicoPorSlug.bind(eventoController));
  app.get(
    "/eventos/:slug/midias",
    midiaController.listarPublicasPorSlug.bind(midiaController)
  );
  app.post(
    "/eventos/:slug/midias",
    midiaController.registrarMidiaConvidado.bind(midiaController)
  );
  app.delete(
    "/eventos/:slug/midias/:midiaId",
    midiaController.excluirPropriaMidiaConvidado.bind(midiaController)
  );

  app.post(
    "/midias/:id/curtir",
    midiaController.curtirMidiaPublica.bind(midiaController)
  );
  app.delete(
    "/midias/:id/curtir",
    midiaController.descurtirMidiaPublica.bind(midiaController)
  );
}
