import "dotenv/config";
import type { IncomingMessage, ServerResponse } from "http";
import { createApp } from "../src/app.js";

let appPromise: ReturnType<typeof createApp> | null = null;

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (!appPromise) {
    appPromise = createApp();
  }
  const app = await appPromise;
  app.server.emit("request", req, res);
}
