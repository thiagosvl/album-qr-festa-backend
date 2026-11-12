import type { FastifyInstance } from "fastify";
import { conviteController } from "../controllers/convite.controller.js";
import { gestaoEventoController } from "../controllers/gestao-evento.controller.js";
import { midiaController } from "../controllers/midia.controller.js";
import { molduraController } from "../controllers/moldura.controller.js";

export async function gestaoRoutes(app: FastifyInstance) {
  app.get("/:token", gestaoEventoController.obterPorToken.bind(gestaoEventoController));
  app.patch(
    "/:token/briefing",
    gestaoEventoController.atualizarBriefing.bind(gestaoEventoController)
  );

  app.get(
    "/:token/confirmacoes",
    conviteController.listarPorTokenGestao.bind(conviteController)
  );
  app.post(
    "/:token/confirmacoes",
    conviteController.criarPorTokenGestao.bind(conviteController)
  );
  app.patch(
    "/:token/confirmacoes/:confirmacaoId",
    conviteController.atualizarPorTokenGestao.bind(conviteController)
  );
  app.delete(
    "/:token/confirmacoes/:confirmacaoId",
    conviteController.excluirPorTokenGestao.bind(conviteController)
  );

  app.get("/:token/midias", midiaController.listarPorTokenGestao.bind(midiaController));
  app.patch(
    "/:token/midias/:midiaId/moderacao",
    midiaController.moderarPorTokenGestao.bind(midiaController)
  );
  app.patch(
    "/:token/midias/moderacao-lote",
    midiaController.moderarEmLotePorTokenGestao.bind(midiaController)
  );
  app.delete(
    "/:token/midias/:midiaId",
    midiaController.excluirPorTokenGestao.bind(midiaController)
  );
  app.delete(
    "/:token/midias-teste",
    midiaController.limparMidiasTestePorTokenGestao.bind(midiaController)
  );

  app.get(
    "/:token/midias/manifesto-download",
    midiaController.obterManifestoPorTokenGestao.bind(midiaController)
  );
  app.get(
    "/:token/midias/zip",
    midiaController.baixarZipPorTokenGestao.bind(midiaController)
  );

  app.get(
    "/:token/molduras",
    molduraController.listarPorTokenGestao.bind(molduraController)
  );
  app.post(
    "/:token/molduras",
    molduraController.criarPorTokenGestao.bind(molduraController)
  );
  app.patch(
    "/:token/molduras/:molduraId",
    molduraController.atualizarPorTokenGestao.bind(molduraController)
  );
  app.put(
    "/:token/molduras/reordenar",
    molduraController.reordenarPorTokenGestao.bind(molduraController)
  );
  app.delete(
    "/:token/molduras/:molduraId",
    molduraController.excluirPorTokenGestao.bind(molduraController)
  );
}
