import type { FastifyInstance } from "fastify";
import { catalogoController } from "../controllers/catalogo.controller.js";
import { eventoController } from "../controllers/evento.controller.js";
import { gestaoEventoController } from "../controllers/gestao-evento.controller.js";
import { midiaController } from "../controllers/midia.controller.js";
import { molduraController } from "../controllers/moldura.controller.js";
import { parceiroB2bController } from "../controllers/parceiro-b2b.controller.js";
import {
  verifyFestaAdmin,
  verifyFestaAdminOrParceiroEvento,
} from "../middlewares/auth.middleware.js";

export async function adminRoutes(app: FastifyInstance) {
  app.register(async (exclusivoAdmin) => {
    exclusivoAdmin.addHook("preHandler", verifyFestaAdmin);

    exclusivoAdmin.get(
      "/catalogo",
      catalogoController.listarAdmin.bind(catalogoController)
    );
    exclusivoAdmin.patch(
      "/catalogo/pacotes/:id",
      catalogoController.atualizarPacoteB2c.bind(catalogoController)
    );
    exclusivoAdmin.post(
      "/catalogo/extras",
      catalogoController.criarExtraB2c.bind(catalogoController)
    );
    exclusivoAdmin.patch(
      "/catalogo/extras/:id",
      catalogoController.atualizarExtraB2c.bind(catalogoController)
    );
    exclusivoAdmin.post(
      "/catalogo/temas",
      catalogoController.criarTema.bind(catalogoController)
    );
    exclusivoAdmin.patch(
      "/catalogo/temas/:id",
      catalogoController.atualizarTema.bind(catalogoController)
    );
    exclusivoAdmin.patch(
      "/catalogo/planos-b2b/:id",
      parceiroB2bController.atualizarPlanoB2bAdmin.bind(parceiroB2bController)
    );

    exclusivoAdmin.get(
      "/parceiros-b2b",
      parceiroB2bController.listarAdmin.bind(parceiroB2bController)
    );
    exclusivoAdmin.post(
      "/parceiros-b2b",
      parceiroB2bController.criarAdmin.bind(parceiroB2bController)
    );
    exclusivoAdmin.patch(
      "/parceiros-b2b/:id",
      parceiroB2bController.atualizarAdmin.bind(parceiroB2bController)
    );
    exclusivoAdmin.post(
      "/parceiros-b2b/:id/creditos",
      parceiroB2bController.registrarTransacaoCreditoAdmin.bind(
        parceiroB2bController
      )
    );
    exclusivoAdmin.post(
      "/parceiros-b2b/:id/impersonate",
      parceiroB2bController.impersonateParceiroAdmin.bind(parceiroB2bController)
    );

    exclusivoAdmin.get(
      "/eventos",
      eventoController.listarAdmin.bind(eventoController)
    );
    exclusivoAdmin.get(
      "/eventos/:id",
      eventoController.obterAdminPorId.bind(eventoController)
    );
    exclusivoAdmin.post(
      "/eventos",
      eventoController.criarAdmin.bind(eventoController)
    );
    exclusivoAdmin.put(
      "/eventos/:id",
      eventoController.atualizarAdmin.bind(eventoController)
    );
    exclusivoAdmin.patch(
      "/eventos/:id/pagamento",
      eventoController.registrarPagamentoManual.bind(eventoController)
    );
    exclusivoAdmin.delete(
      "/eventos/:id",
      eventoController.excluirAdmin.bind(eventoController)
    );

    exclusivoAdmin.patch(
      "/eventos/:eventoId/extras/:extraEventoId/entregue",
      gestaoEventoController.alternarExtraEntregueAdmin.bind(
        gestaoEventoController
      )
    );
  });

  app.register(async (eventoGerenciavel) => {
    eventoGerenciavel.addHook("preHandler", verifyFestaAdminOrParceiroEvento);

    eventoGerenciavel.get(
      "/eventos/:eventoId/molduras",
      molduraController.listarPorEvento.bind(molduraController)
    );
    eventoGerenciavel.post(
      "/eventos/:eventoId/molduras",
      molduraController.criar.bind(molduraController)
    );
    eventoGerenciavel.patch(
      "/eventos/:eventoId/molduras/:molduraId",
      molduraController.atualizar.bind(molduraController)
    );
    eventoGerenciavel.put(
      "/eventos/:eventoId/molduras/reordenar",
      molduraController.reordenar.bind(molduraController)
    );
    eventoGerenciavel.delete(
      "/eventos/:eventoId/molduras/:molduraId",
      molduraController.excluir.bind(molduraController)
    );

    eventoGerenciavel.get(
      "/eventos/:eventoId/midias",
      midiaController.listarPorEventoAdmin.bind(midiaController)
    );
    eventoGerenciavel.patch(
      "/eventos/:eventoId/midias/:midiaId/moderacao",
      midiaController.moderarPorEventoAdmin.bind(midiaController)
    );
    eventoGerenciavel.patch(
      "/eventos/:eventoId/midias/moderacao-lote",
      midiaController.moderarEmLotePorEventoAdmin.bind(midiaController)
    );
    eventoGerenciavel.delete(
      "/eventos/:eventoId/midias/:midiaId",
      midiaController.excluirPorEventoAdmin.bind(midiaController)
    );
    eventoGerenciavel.delete(
      "/eventos/:eventoId/midias-nao-fixadas",
      midiaController.limparMidiasPorEventoAdmin.bind(midiaController)
    );
    eventoGerenciavel.get(
      "/eventos/:eventoId/midias/zip",
      midiaController.baixarZipPorEventoAdmin.bind(midiaController)
    );
  });
}
