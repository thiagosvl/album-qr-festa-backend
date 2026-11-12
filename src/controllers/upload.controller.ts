import type { FastifyReply, FastifyRequest } from "fastify";
import { solicitarUploadSchema } from "../schemas/upload.schema.js";
import { uploadService } from "../services/upload.service.js";

export class UploadController {
  async solicitarUploadEvento(request: FastifyRequest, reply: FastifyReply) {
    const body = solicitarUploadSchema.parse(request.body);
    const resultado = await uploadService.solicitarUploadEvento(body);
    return reply.status(200).send(resultado);
  }

  async solicitarUploadAutenticado(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const body = solicitarUploadSchema.parse(request.body);
    const resultado = await uploadService.solicitarUploadAutenticado(body);
    return reply.status(200).send(resultado);
  }
}

export const uploadController = new UploadController();
