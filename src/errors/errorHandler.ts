import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { logger } from "../config/logger.js";
import { messages } from "../constants/messages.js";
import { AppError } from "./AppError.js";

interface SqlLikeError {
  code?: string;
  statusCode?: number;
  isOperational?: boolean;
}

export function globalErrorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { method, url } = request;
  const sqlError = error as FastifyError & SqlLikeError;

  if (error instanceof AppError || error.name === "AppError" || sqlError.isOperational) {
    const statusCode = sqlError.statusCode || 400;
    const message = error.message || messages.sistema.erroInterno;

    logger.warn({
      msg: "Erro Operacional",
      error: message,
      statusCode,
      method,
      url,
    });

    return reply.status(statusCode).send({
      status: "error",
      message,
      error: message,
    });
  }

  if (error instanceof ZodError) {
    logger.warn({
      msg: "Erro de Validação (Zod)",
      details: error.issues,
      method,
      url,
    });

    return reply.status(400).send({
      status: "error",
      message: messages.sistema.erroValidacao,
      error: messages.sistema.erroValidacao,
      details: error.issues,
    });
  }

  if (sqlError.code === "23505") {
    logger.warn({
      msg: "Violação de Registro Único (SQL)",
      error: error.message,
      method,
      url,
    });

    return reply.status(409).send({
      status: "error",
      message: messages.evento.slugJaExiste,
      error: messages.evento.slugJaExiste,
      code: "23505",
    });
  }

  logger.error({
    msg: "Erro Interno (500)",
    error: error.message,
    stack: error.stack,
    method,
    url,
  });

  return reply.status(500).send({
    status: "error",
    message: messages.sistema.erroInterno,
    error: messages.sistema.erroInterno,
  });
}
