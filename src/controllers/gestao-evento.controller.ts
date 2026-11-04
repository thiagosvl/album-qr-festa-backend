import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { atualizarBriefingPaiSchema } from "../schemas/gestao.schema.js";
import { gestaoEventoService } from "../services/gestao-evento.service.js";

const alternarExtraSchema = z.object({
  entregue: z.boolean(),
});

export class GestaoEventoController {
  async obterPorToken(request: FastifyRequest, reply: FastifyReply) {
    const { token } = request.params as { token: string };
    const resultado = await gestaoEventoService.obterPorTokenGestao(token);
    return reply.status(200).send(resultado);
  }

  async atualizarBriefing(request: FastifyRequest, reply: FastifyReply) {
    const { token } = request.params as { token: string };
    const body = atualizarBriefingPaiSchema.parse(request.body);
    const resultado = await gestaoEventoService.atualizarBriefingPorToken(token, body);
    return reply.status(200).send(resultado);
  }

  async alternarExtraEntregueAdmin(request: FastifyRequest, reply: FastifyReply) {
    const { eventoId, extraEventoId } = request.params as {
      eventoId: string;
      extraEventoId: string;
    };
    const { entregue } = alternarExtraSchema.parse(request.body);
    const resultado = await gestaoEventoService.alternarExtraEntregue(
      eventoId,
      extraEventoId,
      entregue
    );
    return reply.status(200).send(resultado);
  }
}

export const gestaoEventoController = new GestaoEventoController();
