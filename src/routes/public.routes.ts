import type { FastifyInstance } from "fastify";
import { catalogoController } from "../controllers/catalogo.controller.js";
import { eventoController } from "../controllers/evento.controller.js";
import { midiaController } from "../controllers/midia.controller.js";

export async function publicRoutes(app: FastifyInstance) {
  app.get("/catalogo", catalogoController.obterPublico.bind(catalogoController));

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
}
