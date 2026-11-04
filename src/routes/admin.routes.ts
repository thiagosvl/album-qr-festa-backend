import type { FastifyInstance } from "fastify";
import { catalogoController } from "../controllers/catalogo.controller.js";
import { eventoController } from "../controllers/evento.controller.js";
import { gestaoEventoController } from "../controllers/gestao-evento.controller.js";
import { midiaController } from "../controllers/midia.controller.js";
import { molduraController } from "../controllers/moldura.controller.js";
import { verifyFestaAdmin } from "../middlewares/auth.middleware.js";

export async function adminRoutes(app: FastifyInstance) {
  app.addHook("preHandler", verifyFestaAdmin);

  app.get("/catalogo", catalogoController.listarAdmin.bind(catalogoController));
  app.patch(
    "/catalogo/pacotes/:id",
    catalogoController.atualizarPacoteB2c.bind(catalogoController)
  );
  app.post(
    "/catalogo/extras",
    catalogoController.criarExtraB2c.bind(catalogoController)
  );
  app.patch(
    "/catalogo/extras/:id",
    catalogoController.atualizarExtraB2c.bind(catalogoController)
  );
  app.post("/catalogo/temas", catalogoController.criarTema.bind(catalogoController));
  app.patch(
    "/catalogo/temas/:id",
    catalogoController.atualizarTema.bind(catalogoController)
  );

  app.get("/eventos", eventoController.listarAdmin.bind(eventoController));
  app.get("/eventos/:id", eventoController.obterAdminPorId.bind(eventoController));
  app.post("/eventos", eventoController.criarAdmin.bind(eventoController));
  app.put("/eventos/:id", eventoController.atualizarAdmin.bind(eventoController));
  app.patch(
    "/eventos/:id/pagamento",
    eventoController.registrarPagamentoManual.bind(eventoController)
  );
  app.delete("/eventos/:id", eventoController.excluirAdmin.bind(eventoController));

  app.patch(
    "/eventos/:eventoId/extras/:extraEventoId/entregue",
    gestaoEventoController.alternarExtraEntregueAdmin.bind(gestaoEventoController)
  );

  app.get(
    "/eventos/:eventoId/molduras",
    molduraController.listarPorEvento.bind(molduraController)
  );
  app.post(
    "/eventos/:eventoId/molduras",
    molduraController.criar.bind(molduraController)
  );
  app.patch(
    "/eventos/:eventoId/molduras/:molduraId",
    molduraController.atualizar.bind(molduraController)
  );
  app.put(
    "/eventos/:eventoId/molduras/reordenar",
    molduraController.reordenar.bind(molduraController)
  );
  app.delete(
    "/eventos/:eventoId/molduras/:molduraId",
    molduraController.excluir.bind(molduraController)
  );

  app.get(
    "/eventos/:eventoId/midias",
    midiaController.listarPorEventoAdmin.bind(midiaController)
  );
  app.patch(
    "/eventos/:eventoId/midias/:midiaId/moderacao",
    midiaController.moderarPorEventoAdmin.bind(midiaController)
  );
  app.delete(
    "/eventos/:eventoId/midias/:midiaId",
    midiaController.excluirPorEventoAdmin.bind(midiaController)
  );
  app.delete(
    "/eventos/:eventoId/midias-nao-fixadas",
    midiaController.limparMidiasPorEventoAdmin.bind(midiaController)
  );
  app.get(
    "/eventos/:eventoId/midias/zip",
    midiaController.baixarZipPorEventoAdmin.bind(midiaController)
  );
}
