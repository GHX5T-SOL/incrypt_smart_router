/**
 * Smart Router HTTP API — OpenAI-compatible chat endpoint for OpenClaw/proxies.
 */

import Fastify from "fastify";
import cors from "@fastify/cors";
import { z } from "zod";
import { loadConfig } from "./config.js";
import { createRouter } from "./router/index.js";

const ChatMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string(),
  name: z.string().optional(),
});

const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema).min(1),
  model: z.string().optional(),
  max_tokens: z.number().optional(),
  temperature: z.number().optional(),
  stream: z.boolean().optional(),
  forceTier: z.enum(["simple", "standard", "complex"]).optional(),
});

export async function createServer() {
  const config = loadConfig();
  const router = createRouter(config);

  const app = Fastify({ logger: config.logLevel === "debug" });

  await app.register(cors, { origin: true });

  app.post("/v1/chat/completions", async (req, reply) => {
    const parsed = ChatRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }
    try {
      const response = await router.handle(parsed.data);
      return reply.send(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return reply.status(502).send({ error: { message } });
    }
  });

  app.get("/health", async (_req, reply) => {
    return reply.send({ status: "ok", service: "incrypt-smart-router" });
  });

  app.get("/stats", async (_req, reply) => {
    const cache = router.getCacheStats();
    const telemetry = router.getTelemetry();
    const recent = telemetry.slice(-50);
    return reply.send({
      cache,
      requestsLast50: recent.length,
      sample: recent,
    });
  });

  return { app, config };
}

async function main() {
  const { app, config } = await createServer();
  await app.listen({ port: config.port, host: "0.0.0.0" });
  console.log(`Incrypt Smart Router listening on http://0.0.0.0:${config.port}`);
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
