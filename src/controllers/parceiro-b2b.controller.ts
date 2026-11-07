import type { FastifyReply, FastifyRequest } from "fastify";
import { messages } from "../constants/messages.js";
import { AppError } from "../errors/AppError.js";
import {
  atualizarOperadorParceiroSchema,
  atualizarParceiroB2bSchema,
  atualizarPlanoB2bSchema,
  criarEventoParceiroB2bSchema,
  criarOperadorParceiroSchema,
  registrarTransacaoCreditoB2bSchema,
  salvarParceiroB2bSchema,
} from "../schemas/parceiro-b2b.schema.js";
import { parceiroB2bService } from "../services/parceiro-b2b.service.js";
import type { AuthenticatedFestaRequest } from "../types/request.type.js";

function extrairParceiroIdAutenticado(request: FastifyRequest): string {
  const typedReq = request as AuthenticatedFestaRequest;
  const parceiroId = typedReq.festaUsuario?.parceiro_id;
  if (!parceiroId) {
    throw new AppError(messages.auth.acessoRestritoParceiro, 403);
  }
  return parceiroId;
}

export class ParceiroB2bController {
  async listarAdmin(_request: FastifyRequest, reply: FastifyReply) {
    const resultado = await parceiroB2bService.listarParceirosAdmin();
    return reply.status(200).send(resultado);
  }

  async criarAdmin(request: FastifyRequest, reply: FastifyReply) {
    const body = salvarParceiroB2bSchema.parse(request.body);
    const resultado = await parceiroB2bService.criarParceiro(body);
    return reply.status(201).send(resultado);
  }

  async atualizarAdmin(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = atualizarParceiroB2bSchema.parse(request.body);
    const resultado = await parceiroB2bService.atualizarParceiro(id, body);
    return reply.status(200).send(resultado);
  }

  async registrarTransacaoCreditoAdmin(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const { id } = request.params as { id: string };
    const body = registrarTransacaoCreditoB2bSchema.parse(request.body);
    const resultado = await parceiroB2bService.registrarTransacaoCredito(
      id,
      body
    );
    return reply.status(200).send(resultado);
  }

  async atualizarPlanoB2bAdmin(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = atualizarPlanoB2bSchema.parse(request.body);
    const resultado = await parceiroB2bService.atualizarPlanoB2b(id, body);
    return reply.status(200).send(resultado);
  }

  async impersonateParceiroAdmin(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const { id } = request.params as { id: string };
    const resultado = await parceiroB2bService.gerarLinkImpersonateAdmin(id);
    return reply.status(200).send(resultado);
  }

  async obterPortalParceiro(request: FastifyRequest, reply: FastifyReply) {
    const parceiroId = extrairParceiroIdAutenticado(request);
    const typedReq = request as AuthenticatedFestaRequest;
    const resultado = await parceiroB2bService.obterPortalParceiro(
      parceiroId,
      typedReq.festaUsuario.tipo_perfil
    );
    return reply.status(200).send(resultado);
  }

  async atualizarPerfilPortalParceiro(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const parceiroId = extrairParceiroIdAutenticado(request);
    const body = atualizarParceiroB2bSchema
      .pick({
        nome_empresa: true,
        documento: true,
        telefone: true,
        email: true,
        cor_marca: true,
        logo_url: true,
      })
      .parse(request.body);
    const resultado = await parceiroB2bService.atualizarParceiro(
      parceiroId,
      body
    );
    return reply.status(200).send(resultado);
  }

  async criarEventoPortalParceiro(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const parceiroId = extrairParceiroIdAutenticado(request);
    const body = criarEventoParceiroB2bSchema.parse(request.body);
    const resultado = await parceiroB2bService.criarEventoComCreditoParceiro(
      parceiroId,
      body
    );
    return reply.status(201).send(resultado);
  }

  async criarOperadorPortalParceiro(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const parceiroId = extrairParceiroIdAutenticado(request);
    const body = criarOperadorParceiroSchema.parse(request.body);
    const resultado = await parceiroB2bService.criarOperadorParceiro(
      parceiroId,
      body
    );
    return reply.status(201).send(resultado);
  }

  async atualizarOperadorPortalParceiro(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const parceiroId = extrairParceiroIdAutenticado(request);
    const { operadorId } = request.params as { operadorId: string };
    const body = atualizarOperadorParceiroSchema.parse(request.body);
    const resultado = await parceiroB2bService.atualizarOperadorParceiro(
      parceiroId,
      operadorId,
      body
    );
    return reply.status(200).send(resultado);
  }

  async excluirOperadorPortalParceiro(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const parceiroId = extrairParceiroIdAutenticado(request);
    const { operadorId } = request.params as { operadorId: string };
    await parceiroB2bService.excluirOperadorParceiro(parceiroId, operadorId);
    return reply.status(204).send();
  }
}

export const parceiroB2bController = new ParceiroB2bController();
