import type { FastifyReply, FastifyRequest } from "fastify";
import {
  atualizarOperadorParceiroSchema,
  atualizarParceiroB2bSchema,
  atualizarPerfilPortalParceiroSchema,
  atualizarPlanoB2bSchema,
  criarEventoParceiroB2bSchema,
  criarOperadorParceiroSchema,
  registrarTransacaoCreditoB2bSchema,
  salvarParceiroB2bSchema,
} from "../schemas/parceiro-b2b.schema.js";
import { parceiroB2bService } from "../services/parceiro-b2b.service.js";
import type { AuthenticatedFestaRequest } from "../types/request.type.js";

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
    const { festaUsuario } = request as AuthenticatedFestaRequest;
    const resultado = await parceiroB2bService.obterPortalParceiro(
      festaUsuario.parceiro_id,
      festaUsuario.tipo_perfil
    );
    return reply.status(200).send(resultado);
  }

  async atualizarPerfilPortalParceiro(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const { festaUsuario } = request as AuthenticatedFestaRequest;
    const body = atualizarPerfilPortalParceiroSchema.parse(request.body);
    const resultado = await parceiroB2bService.atualizarPerfilPortal(
      festaUsuario.parceiro_id,
      body
    );
    return reply.status(200).send(resultado);
  }

  async criarEventoPortalParceiro(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const { festaUsuario } = request as AuthenticatedFestaRequest;
    const body = criarEventoParceiroB2bSchema.parse(request.body);
    const resultado = await parceiroB2bService.criarEventoComCreditoParceiro(
      festaUsuario.parceiro_id,
      body
    );
    return reply.status(201).send(resultado);
  }

  async criarOperadorPortalParceiro(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const { festaUsuario } = request as AuthenticatedFestaRequest;
    const body = criarOperadorParceiroSchema.parse(request.body);
    const resultado = await parceiroB2bService.criarOperadorParceiro(
      festaUsuario.parceiro_id,
      body
    );
    return reply.status(201).send(resultado);
  }

  async atualizarOperadorPortalParceiro(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const { festaUsuario } = request as AuthenticatedFestaRequest;
    const { operadorId } = request.params as { operadorId: string };
    const body = atualizarOperadorParceiroSchema.parse(request.body);
    const resultado = await parceiroB2bService.atualizarOperadorParceiro(
      festaUsuario.parceiro_id,
      operadorId,
      body
    );
    return reply.status(200).send(resultado);
  }

  async excluirOperadorPortalParceiro(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const { festaUsuario } = request as AuthenticatedFestaRequest;
    const { operadorId } = request.params as { operadorId: string };
    await parceiroB2bService.excluirOperadorParceiro(
      festaUsuario.parceiro_id,
      operadorId
    );
    return reply.status(204).send();
  }
}

export const parceiroB2bController = new ParceiroB2bController();
