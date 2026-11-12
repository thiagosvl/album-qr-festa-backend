import type { FastifyReply, FastifyRequest } from "fastify";
import {
  atualizarConfirmacaoRsvpSchema,
  salvarConfirmacaoRsvpSchema,
} from "../schemas/convite.schema.js";
import { conviteService } from "../services/convite.service.js";

export class ConviteController {
  async obterPublicoPorSlug(request: FastifyRequest, reply: FastifyReply) {
    const { slug } = request.params as { slug: string };
    const resultado = await conviteService.obterConvitePublicoPorSlug(slug);
    return reply.status(200).send(resultado);
  }

  async registrarConfirmacaoPublica(request: FastifyRequest, reply: FastifyReply) {
    const { slug } = request.params as { slug: string };
    const body = salvarConfirmacaoRsvpSchema.parse(request.body);
    const resultado = await conviteService.registrarConfirmacaoPublicaPorSlug(
      slug,
      body
    );
    return reply.status(201).send(resultado);
  }

  async listarPorEvento(request: FastifyRequest, reply: FastifyReply) {
    const { eventoId } = request.params as { eventoId: string };
    const resultado = await conviteService.listarConfirmacoesPorEventoId(eventoId);
    return reply.status(200).send(resultado);
  }

  async criarPorEvento(request: FastifyRequest, reply: FastifyReply) {
    const { eventoId } = request.params as { eventoId: string };
    const body = salvarConfirmacaoRsvpSchema.parse(request.body);
    const resultado = await conviteService.criarConfirmacaoPorEventoId(
      eventoId,
      body
    );
    return reply.status(201).send(resultado);
  }

  async atualizarPorEvento(request: FastifyRequest, reply: FastifyReply) {
    const { eventoId, confirmacaoId } = request.params as {
      eventoId: string;
      confirmacaoId: string;
    };
    const body = atualizarConfirmacaoRsvpSchema.parse(request.body);
    const resultado = await conviteService.atualizarConfirmacaoPorEventoId(
      eventoId,
      confirmacaoId,
      body
    );
    return reply.status(200).send(resultado);
  }

  async excluirPorEvento(request: FastifyRequest, reply: FastifyReply) {
    const { eventoId, confirmacaoId } = request.params as {
      eventoId: string;
      confirmacaoId: string;
    };
    await conviteService.excluirConfirmacaoPorEventoId(eventoId, confirmacaoId);
    return reply.status(204).send();
  }

  async listarPorTokenGestao(request: FastifyRequest, reply: FastifyReply) {
    const { token } = request.params as { token: string };
    const resultado = await conviteService.listarPorTokenGestao(token);
    return reply.status(200).send(resultado);
  }

  async criarPorTokenGestao(request: FastifyRequest, reply: FastifyReply) {
    const { token } = request.params as { token: string };
    const body = salvarConfirmacaoRsvpSchema.parse(request.body);
    const resultado = await conviteService.criarPorTokenGestao(token, body);
    return reply.status(201).send(resultado);
  }

  async atualizarPorTokenGestao(request: FastifyRequest, reply: FastifyReply) {
    const { token, confirmacaoId } = request.params as {
      token: string;
      confirmacaoId: string;
    };
    const body = atualizarConfirmacaoRsvpSchema.parse(request.body);
    const resultado = await conviteService.atualizarPorTokenGestao(
      token,
      confirmacaoId,
      body
    );
    return reply.status(200).send(resultado);
  }

  async excluirPorTokenGestao(request: FastifyRequest, reply: FastifyReply) {
    const { token, confirmacaoId } = request.params as {
      token: string;
      confirmacaoId: string;
    };
    await conviteService.excluirPorTokenGestao(token, confirmacaoId);
    return reply.status(204).send();
  }
}

export const conviteController = new ConviteController();
