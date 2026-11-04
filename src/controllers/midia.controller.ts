import type { FastifyReply, FastifyRequest } from "fastify";
import {
  excluirMidiaConvidadoQuerySchema,
  listagemMidiasGestaoQuerySchema,
  listagemMidiasPublicaQuerySchema,
  moderarMidiaSchema,
  moderarMidiasEmLoteSchema,
  registrarMidiaConvidadoSchema,
} from "../schemas/midia.schema.js";
import { eventoService } from "../services/evento.service.js";
import { gestaoEventoService } from "../services/gestao-evento.service.js";
import { midiaService } from "../services/midia.service.js";

export class MidiaController {
  async listarPublicasPorSlug(request: FastifyRequest, reply: FastifyReply) {
    const { slug } = request.params as { slug: string };
    const query = listagemMidiasPublicaQuerySchema.parse(request.query);
    const resultado = await midiaService.listarMidiasPublicasPorSlug(slug, query);
    return reply.status(200).send(resultado);
  }

  async registrarMidiaConvidado(request: FastifyRequest, reply: FastifyReply) {
    const { slug } = request.params as { slug: string };
    const body = registrarMidiaConvidadoSchema.parse(request.body);
    const resultado = await midiaService.registrarMidiaConvidado(slug, body);
    return reply.status(201).send(resultado);
  }

  async curtirMidiaPublica(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const resultado = await midiaService.curtirMidiaPublica(id);
    return reply.status(200).send(resultado);
  }

  async excluirPropriaMidiaConvidado(request: FastifyRequest, reply: FastifyReply) {
    const { slug, midiaId } = request.params as { slug: string; midiaId: string };
    const { sessao_id } = excluirMidiaConvidadoQuerySchema.parse(request.query);
    await midiaService.excluirMidiaPropriaConvidado(slug, midiaId, sessao_id);
    return reply.status(204).send();
  }

  async listarPorTokenGestao(request: FastifyRequest, reply: FastifyReply) {
    const { token } = request.params as { token: string };
    const query = listagemMidiasGestaoQuerySchema.parse(request.query);
    const evento = await gestaoEventoService.validarTokenGestao(token);
    const resultado = await midiaService.listarMidiasGestao(evento.id, query);
    return reply.status(200).send(resultado);
  }

  async moderarPorTokenGestao(request: FastifyRequest, reply: FastifyReply) {
    const { token, midiaId } = request.params as { token: string; midiaId: string };
    const body = moderarMidiaSchema.parse(request.body);
    const evento = await gestaoEventoService.validarTokenGestao(token);
    const resultado = await midiaService.moderarMidia(evento.id, midiaId, body);
    return reply.status(200).send(resultado);
  }

  async moderarEmLotePorTokenGestao(request: FastifyRequest, reply: FastifyReply) {
    const { token } = request.params as { token: string };
    const body = moderarMidiasEmLoteSchema.parse(request.body);
    const evento = await gestaoEventoService.validarTokenGestao(token);
    const atualizadas = await midiaService.moderarMidiasEmLote(evento.id, body);
    return reply.status(200).send({ atualizadas });
  }

  async excluirPorTokenGestao(request: FastifyRequest, reply: FastifyReply) {
    const { token, midiaId } = request.params as { token: string; midiaId: string };
    const evento = await gestaoEventoService.validarTokenGestao(token);
    await midiaService.excluirMidiaGestao(evento.id, midiaId);
    return reply.status(204).send();
  }

  async limparMidiasTestePorTokenGestao(request: FastifyRequest, reply: FastifyReply) {
    const { token } = request.params as { token: string };
    const evento = await gestaoEventoService.validarTokenGestao(token);
    const removidas = await midiaService.limparMidiasNaoFixadas(evento.id);
    return reply.status(200).send({ removidas });
  }

  async obterManifestoPorTokenGestao(request: FastifyRequest, reply: FastifyReply) {
    const { token } = request.params as { token: string };
    const evento = await gestaoEventoService.validarTokenGestao(token);
    const itens = await midiaService.obterManifestoDownload(evento.id);
    return reply.status(200).send({
      slug: evento.slug,
      titulo: evento.titulo,
      total: itens.length,
      itens,
    });
  }

  async baixarZipPorTokenGestao(request: FastifyRequest, reply: FastifyReply) {
    const { token } = request.params as { token: string };
    const evento = await gestaoEventoService.validarTokenGestao(token);
    await midiaService.gerarStreamZipMidias(evento.id, evento.slug, reply);
  }

  async listarPorEventoAdmin(request: FastifyRequest, reply: FastifyReply) {
    const { eventoId } = request.params as { eventoId: string };
    const query = listagemMidiasGestaoQuerySchema.parse(request.query);
    const resultado = await midiaService.listarMidiasGestao(eventoId, query);
    return reply.status(200).send(resultado);
  }

  async moderarPorEventoAdmin(request: FastifyRequest, reply: FastifyReply) {
    const { eventoId, midiaId } = request.params as { eventoId: string; midiaId: string };
    const body = moderarMidiaSchema.parse(request.body);
    const resultado = await midiaService.moderarMidia(eventoId, midiaId, body);
    return reply.status(200).send(resultado);
  }

  async excluirPorEventoAdmin(request: FastifyRequest, reply: FastifyReply) {
    const { eventoId, midiaId } = request.params as { eventoId: string; midiaId: string };
    await midiaService.excluirMidiaGestao(eventoId, midiaId);
    return reply.status(204).send();
  }

  async limparMidiasPorEventoAdmin(request: FastifyRequest, reply: FastifyReply) {
    const { eventoId } = request.params as { eventoId: string };
    const removidas = await midiaService.limparMidiasNaoFixadas(eventoId);
    return reply.status(200).send({ removidas });
  }

  async baixarZipPorEventoAdmin(request: FastifyRequest, reply: FastifyReply) {
    const { eventoId } = request.params as { eventoId: string };
    const evento = await eventoService.obterEventoAdminPorId(eventoId);
    await midiaService.gerarStreamZipMidias(evento.id, evento.slug, reply);
  }
}

export const midiaController = new MidiaController();
