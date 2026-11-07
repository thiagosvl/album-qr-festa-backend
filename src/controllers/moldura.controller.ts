import type { FastifyReply, FastifyRequest } from "fastify";
import {
  atualizarMolduraEventoSchema,
  criarMolduraEventoSchema,
  reordenarMoldurasSchema,
} from "../schemas/moldura.schema.js";
import { gestaoEventoService } from "../services/gestao-evento.service.js";
import { molduraService } from "../services/moldura.service.js";

export class MolduraController {
  async listarPorEvento(request: FastifyRequest, reply: FastifyReply) {
    const { eventoId } = request.params as { eventoId: string };
    const resultado = await molduraService.listarPorEvento(eventoId, false);
    return reply.status(200).send(resultado);
  }

  async criar(request: FastifyRequest, reply: FastifyReply) {
    const { eventoId } = request.params as { eventoId: string };
    const body = criarMolduraEventoSchema.parse(request.body);
    const resultado = await molduraService.criarMoldura(eventoId, body);
    return reply.status(201).send(resultado);
  }

  async atualizar(request: FastifyRequest, reply: FastifyReply) {
    const { eventoId, molduraId } = request.params as {
      eventoId: string;
      molduraId: string;
    };
    const body = atualizarMolduraEventoSchema.parse(request.body);
    const resultado = await molduraService.atualizarMoldura(
      eventoId,
      molduraId,
      body
    );
    return reply.status(200).send(resultado);
  }

  async reordenar(request: FastifyRequest, reply: FastifyReply) {
    const { eventoId } = request.params as { eventoId: string };
    const body = reordenarMoldurasSchema.parse(request.body);
    const resultado = await molduraService.reordenarMolduras(eventoId, body);
    return reply.status(200).send(resultado);
  }

  async excluir(request: FastifyRequest, reply: FastifyReply) {
    const { eventoId, molduraId } = request.params as {
      eventoId: string;
      molduraId: string;
    };
    await molduraService.excluirMoldura(eventoId, molduraId);
    return reply.status(204).send();
  }

  async listarPorTokenGestao(request: FastifyRequest, reply: FastifyReply) {
    const { token } = request.params as { token: string };
    const evento = await gestaoEventoService.validarTokenGestao(token);
    const resultado = await molduraService.listarPorEvento(evento.id, false);
    return reply.status(200).send(resultado);
  }

  async criarPorTokenGestao(request: FastifyRequest, reply: FastifyReply) {
    const { token } = request.params as { token: string };
    const body = criarMolduraEventoSchema.parse(request.body);
    const evento = await gestaoEventoService.validarTokenGestao(token);
    const resultado = await molduraService.criarMoldura(evento.id, body);
    return reply.status(201).send(resultado);
  }

  async atualizarPorTokenGestao(request: FastifyRequest, reply: FastifyReply) {
    const { token, molduraId } = request.params as {
      token: string;
      molduraId: string;
    };
    const body = atualizarMolduraEventoSchema.parse(request.body);
    const evento = await gestaoEventoService.validarTokenGestao(token);
    const resultado = await molduraService.atualizarMoldura(
      evento.id,
      molduraId,
      body
    );
    return reply.status(200).send(resultado);
  }

  async reordenarPorTokenGestao(request: FastifyRequest, reply: FastifyReply) {
    const { token } = request.params as { token: string };
    const body = reordenarMoldurasSchema.parse(request.body);
    const evento = await gestaoEventoService.validarTokenGestao(token);
    const resultado = await molduraService.reordenarMolduras(evento.id, body);
    return reply.status(200).send(resultado);
  }

  async excluirPorTokenGestao(request: FastifyRequest, reply: FastifyReply) {
    const { token, molduraId } = request.params as {
      token: string;
      molduraId: string;
    };
    const evento = await gestaoEventoService.validarTokenGestao(token);
    await molduraService.excluirMoldura(evento.id, molduraId);
    return reply.status(204).send();
  }
}

export const molduraController = new MolduraController();
