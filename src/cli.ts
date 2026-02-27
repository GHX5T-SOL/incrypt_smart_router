#!/usr/bin/env node
/**
 * Incrypt Smart Router CLI — start server or show help
 */

import { createServer } from "./server.js";

const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  console.log(`
Incrypt Smart Router — Smart AI routing for OpenClaw

Usage:
  incrypt-router              Start the router server (default port 3140)
  incrypt-router --help       Show this help

Environment:
  PORT                        Server port (default: 3140)
  CACHE_TTL_SECONDS           Cache TTL (default: 3600)
  CACHE_MAX_SIZE              Max cache entries (default: 1000)
  COMPRESSION_ENABLED         Enable context compression (default: true)
  OPENAI_API_KEY              Optional — enable GPT models
  ANTHROPIC_API_KEY           Optional — enable Claude models
  GOOGLE_AI_API_KEY           Optional — enable Gemini
  CEREBRAS_API_KEY            Optional — Cerebras
  GROQ_API_KEY                Optional — Groq
  HF_TOKEN                    Optional — HuggingFace

OpenClaw: Point your agent to http://localhost:3140/v1/chat/completions
Docs: https://github.com/incrypt-network/incrypt-smart-router
`);
  process.exit(0);
}

createServer()
  .then(({ app, config }) => app.listen({ port: config.port, host: "0.0.0.0" }))
  .then(() => {
    const port = process.env.PORT || 3140;
    console.log(`Incrypt Smart Router listening on http://0.0.0.0:${port}`);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
