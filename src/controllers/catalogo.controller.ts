import type { FastifyReply, FastifyRequest } from "fastify";
import {
  atualizarExtraB2cSchema,
  atualizarPacoteB2cSchema,
  atualizarProdutoB2cSchema,
  atualizarTemaCatalogoSchema,
  salvarExtraB2cSchema,
  salvarTemaCatalogoSchema,
} from "../schemas/catalogo.schema.js";
import { catalogoService } from "../services/catalogo.service.js";

export class CatalogoController {
  async obterPublico(_request: FastifyRequest, reply: FastifyReply) {
    const resultado = await catalogoService.obterCatalogoPublico();
    return reply.status(200).send(resultado);
  }

  async listarAdmin(_request: FastifyRequest, reply: FastifyReply) {
    const resultado = await catalogoService.listarCatalogoAdmin();
    return reply.status(200).send(resultado);
  }

  async atualizarProdutoB2c(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = atualizarProdutoB2cSchema.parse(request.body);
    const resultado = await catalogoService.atualizarProdutoB2c(id, body);
    return reply.status(200).send(resultado);
  }

  async atualizarPacoteB2c(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = atualizarPacoteB2cSchema.parse(request.body);
    const resultado = await catalogoService.atualizarPacoteB2c(id, body);
    return reply.status(200).send(resultado);
  }

  async criarExtraB2c(request: FastifyRequest, reply: FastifyReply) {
    const body = salvarExtraB2cSchema.parse(request.body);
    const resultado = await catalogoService.criarExtraB2c(body);
    return reply.status(201).send(resultado);
  }

  async atualizarExtraB2c(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = atualizarExtraB2cSchema.parse(request.body);
    const resultado = await catalogoService.atualizarExtraB2c(id, body);
    return reply.status(200).send(resultado);
  }

  async criarTema(request: FastifyRequest, reply: FastifyReply) {
    const body = salvarTemaCatalogoSchema.parse(request.body);
    const resultado = await catalogoService.criarTemaCatalogo(body);
    return reply.status(201).send(resultado);
  }

  async atualizarTema(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = atualizarTemaCatalogoSchema.parse(request.body);
    const resultado = await catalogoService.atualizarTemaCatalogo(id, body);
    return reply.status(200).send(resultado);
  }
}

export const catalogoController = new CatalogoController();
