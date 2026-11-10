import "dotenv/config";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { NOME_SERVICO_API } from "./constants/marca.js";

const start = async () => {
  try {
    const app = await createApp();
    await app.listen({ port: env.PORT, host: "0.0.0.0" });
    console.log(`Servidor ${NOME_SERVICO_API} rodando em http://localhost:${env.PORT}`);
  } catch (err) {
    console.error("Erro ao iniciar servidor:", err);
    process.exit(1);
  }
};

start();
