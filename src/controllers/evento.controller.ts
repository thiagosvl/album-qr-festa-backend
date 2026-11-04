import type { FastifyReply, FastifyRequest } from "fastify";
import {
  atualizarEventoAdminSchema,
  criarEventoAdminSchema,
  filtroListagemEventosSchema,
  registrarPagamentoManualSchema,
} from "../schemas/evento.schema.js";
import { eventoService } from "../services/evento.service.js";

export class EventoController {
  async obterPublicoPorSlug(request: FastifyRequest, reply: FastifyReply) {
    const { slug } = request.params as { slug: string };
    const resultado = await eventoService.obterEventoPublicoPorSlug(slug);
    return reply.status(200).send(resultado);
  }

  async listarAdmin(request: FastifyRequest, reply: FastifyReply) {
    const filtros = filtroListagemEventosSchema.parse(request.query);
    const resultado = await eventoService.listarEventosAdmin(filtros);
    return reply.status(200).send(resultado);
  }

  async obterAdminPorId(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const resultado = await eventoService.obterEventoAdminPorId(id);
    return reply.status(200).send(resultado);
  }

  async criarAdmin(request: FastifyRequest, reply: FastifyReply) {
    const body = criarEventoAdminSchema.parse(request.body);
    const resultado = await eventoService.criarEventoAdmin(body);
    return reply.status(201).send(resultado);
  }

  async atualizarAdmin(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = atualizarEventoAdminSchema.parse(request.body);
    const resultado = await eventoService.atualizarEventoAdmin(id, body);
    return reply.status(200).send(resultado);
  }

  async registrarPagamentoManual(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = registrarPagamentoManualSchema.parse(request.body);
    const resultado = await eventoService.registrarPagamentoManual(id, body);
    return reply.status(200).send(resultado);
  }

  async excluirAdmin(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    await eventoService.excluirEventoAdmin(id);
    return reply.status(204).send();
  }
}

export const eventoController = new EventoController();
