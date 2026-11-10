import fastifyCors from "@fastify/cors";
import Fastify, {
  type FastifyBaseLogger,
  type FastifyInstance,
} from "fastify";
import type { IncomingMessage, ServerResponse } from "http";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { globalErrorHandler } from "./errors/errorHandler.js";
import routes from "./routes/index.js";

export async function createApp(): Promise<FastifyInstance> {
  const app = Fastify({
    loggerInstance: logger as unknown as FastifyBaseLogger,
    disableRequestLogging: true,
  });

  app.addHook("onResponse", (request, reply, done) => {
    if (request.method === "OPTIONS") return done();
    request.log.info(`${request.method} ${request.url} - ${reply.statusCode}`);
    done();
  });

  app.addHook("onRequest", (request, _reply, done) => {
    if (request.headers["content-length"] === "0") {
      delete request.headers["content-length"];
      delete request.headers["content-type"];
    }

    const methodsWithoutBody = ["GET", "DELETE", "HEAD", "OPTIONS"];
    if (methodsWithoutBody.includes(request.method.toUpperCase())) {
      delete request.headers["content-length"];
      delete request.headers["transfer-encoding"];
      delete request.headers["content-type"];
    }

    done();
  });

  app.addHook("preValidation", (request, _reply, done) => {
    if (typeof request.body === "string") {
      const trimmed = request.body.trim();
      if (
        (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
        (trimmed.startsWith("[") && trimmed.endsWith("]"))
      ) {
        try {
          request.body = JSON.parse(trimmed);
        } catch {
          return done();
        }
      }
    }
    done();
  });

  app.setErrorHandler(globalErrorHandler);

  const envOrigins = env.ALLOWED_ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  const defaultOrigins = [
    "http://localhost:5173",
    "http://localhost:4321",
    "http://localhost:8080",
    "http://localhost:3000",
  ];

  const allowedOrigins = Array.from(new Set([...envOrigins, ...defaultOrigins]));

  await app.register(fastifyCors, {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        return callback(null, true);
      }
      if (env.NODE_ENV === "production") {
        return callback(new Error("Not allowed by CORS"), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  await app.register(routes);
  await app.ready();

  return app;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const app = await createApp();
  app.server.emit("request", req, res);
}
