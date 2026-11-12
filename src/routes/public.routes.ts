import type { FastifyInstance } from "fastify";
import { catalogoController } from "../controllers/catalogo.controller.js";
import { conviteController } from "../controllers/convite.controller.js";
import { eventoController } from "../controllers/evento.controller.js";
import { midiaController } from "../controllers/midia.controller.js";
import { uploadController } from "../controllers/upload.controller.js";

export async function publicRoutes(app: FastifyInstance) {
  app.get("/catalogo", catalogoController.obterPublico.bind(catalogoController));

  app.get(
    "/eventos/:slug",
    eventoController.obterPublicoPorSlug.bind(eventoController)
  );
  app.get(
    "/eventos/:slug/convite",
    conviteController.obterPublicoPorSlug.bind(conviteController)
  );
  app.post(
    "/eventos/:slug/confirmacoes",
    conviteController.registrarConfirmacaoPublica.bind(conviteController)
  );
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
    "/uploads/presign",
    uploadController.solicitarUploadEvento.bind(uploadController)
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
