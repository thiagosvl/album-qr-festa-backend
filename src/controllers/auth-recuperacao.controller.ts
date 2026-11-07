import type { FastifyReply, FastifyRequest } from "fastify";
import {
  resetarSenhaRecuperacaoSchema,
  solicitarRecuperacaoSchema,
  validarCodigoRecuperacaoSchema,
} from "../schemas/auth-recuperacao.schema.js";
import { authRecuperacaoService } from "../services/auth-recuperacao.service.js";
import type { AuthenticatedFestaRequest } from "../types/request.type.js";

export class AuthRecuperacaoController {
  async obterSessaoAtual(request: FastifyRequest, reply: FastifyReply) {
    const { festaUsuario } = request as AuthenticatedFestaRequest;
    return reply.status(200).send({
      id: festaUsuario.id,
      nome: festaUsuario.nome,
      email: festaUsuario.email,
      tipo_perfil: festaUsuario.tipo_perfil,
      parceiro_id: festaUsuario.parceiro_id,
    });
  }

  async solicitarRecuperacao(request: FastifyRequest, reply: FastifyReply) {
    const body = solicitarRecuperacaoSchema.parse(request.body);
    const resultado = await authRecuperacaoService.solicitarRecuperacao(
      body.identificador
    );
    return reply.status(200).send(resultado);
  }

  async validarCodigo(request: FastifyRequest, reply: FastifyReply) {
    const body = validarCodigoRecuperacaoSchema.parse(request.body);
    const resultado = await authRecuperacaoService.validarCodigo(
      body.identificador,
      body.codigo
    );
    return reply.status(200).send(resultado);
  }

  async resetarSenhaComCodigo(request: FastifyRequest, reply: FastifyReply) {
    const body = resetarSenhaRecuperacaoSchema.parse(request.body);
    const resultado = await authRecuperacaoService.resetarSenhaComCodigo(
      body.recovery_id,
      body.nova_senha
    );
    return reply.status(200).send(resultado);
  }
}

export const authRecuperacaoController = new AuthRecuperacaoController();
