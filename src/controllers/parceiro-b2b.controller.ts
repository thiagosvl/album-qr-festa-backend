import type { FastifyReply, FastifyRequest } from "fastify";
import {
  atualizarPlanoB2bSchema,
  criarEventoParceiroB2bSchema,
  registrarTransacaoCreditoB2bSchema,
  salvarParceiroB2bSchema,
} from "../schemas/parceiro-b2b.schema.js";
import { parceiroB2bService } from "../services/parceiro-b2b.service.js";

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
    const body = salvarParceiroB2bSchema.partial().parse(request.body);
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

  async obterPortalParceiro(request: FastifyRequest, reply: FastifyReply) {
    const { parceiro_id } = request.query as { parceiro_id?: string };
    const resultado = await parceiroB2bService.obterPortalParceiro(parceiro_id);
    return reply.status(200).send(resultado);
  }

  async atualizarPerfilPortalParceiro(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const { id } = request.params as { id: string };
    const body = salvarParceiroB2bSchema
      .pick({
        nome_empresa: true,
        documento: true,
        telefone: true,
        email: true,
        cor_marca: true,
        logo_url: true,
      })
      .partial()
      .parse(request.body);
    const resultado = await parceiroB2bService.atualizarParceiro(id, body);
    return reply.status(200).send(resultado);
  }

  async criarEventoPortalParceiro(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const { id } = request.params as { id: string };
    const body = criarEventoParceiroB2bSchema.parse(request.body);
    const resultado = await parceiroB2bService.criarEventoComCreditoParceiro(
      id,
      body
    );
    return reply.status(201).send(resultado);
  }
}

export const parceiroB2bController = new ParceiroB2bController();
