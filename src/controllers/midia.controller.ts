import type { FastifyReply, FastifyRequest } from "fastify";
import {
  excluirMidiaConvidadoQuerySchema,
  listagemMidiasGestaoQuerySchema,
  listagemMidiasPublicaQuerySchema,
  moderarMidiaSchema,
  moderarMidiasEmLoteSchema,
  registrarMidiaConvidadoSchema,
} from "../schemas/midia.schema.js";
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

  async descurtirMidiaPublica(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const resultado = await midiaService.descurtirMidiaPublica(id);
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
    const resultado = await midiaService.listarMidiasPorTokenGestao(token, query);
    return reply.status(200).send(resultado);
  }

  async moderarPorTokenGestao(request: FastifyRequest, reply: FastifyReply) {
    const { token, midiaId } = request.params as { token: string; midiaId: string };
    const body = moderarMidiaSchema.parse(request.body);
    const resultado = await midiaService.moderarMidiaPorTokenGestao(token, midiaId, body);
    return reply.status(200).send(resultado);
  }

  async moderarEmLotePorTokenGestao(request: FastifyRequest, reply: FastifyReply) {
    const { token } = request.params as { token: string };
    const body = moderarMidiasEmLoteSchema.parse(request.body);
    const atualizadas = await midiaService.moderarMidiasEmLotePorTokenGestao(token, body);
    return reply.status(200).send({ atualizadas });
  }

  async excluirPorTokenGestao(request: FastifyRequest, reply: FastifyReply) {
    const { token, midiaId } = request.params as { token: string; midiaId: string };
    await midiaService.excluirMidiaPorTokenGestao(token, midiaId);
    return reply.status(204).send();
  }

  async limparMidiasTestePorTokenGestao(request: FastifyRequest, reply: FastifyReply) {
    const { token } = request.params as { token: string };
    const removidas = await midiaService.limparMidiasTestePorTokenGestao(token);
    return reply.status(200).send({ removidas });
  }

  async obterManifestoPorTokenGestao(request: FastifyRequest, reply: FastifyReply) {
    const { token } = request.params as { token: string };
    const resultado = await midiaService.obterManifestoPorTokenGestao(token);
    return reply.status(200).send(resultado);
  }

  async baixarZipPorTokenGestao(request: FastifyRequest, reply: FastifyReply) {
    const { token } = request.params as { token: string };
    await midiaService.baixarZipPorTokenGestao(token, reply);
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

  async moderarEmLotePorEventoAdmin(request: FastifyRequest, reply: FastifyReply) {
    const { eventoId } = request.params as { eventoId: string };
    const body = moderarMidiasEmLoteSchema.parse(request.body);
    const atualizadas = await midiaService.moderarMidiasEmLote(eventoId, body);
    return reply.status(200).send({ atualizadas });
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
    await midiaService.baixarZipPorEventoAdmin(eventoId, reply);
  }
}

export const midiaController = new MidiaController();
