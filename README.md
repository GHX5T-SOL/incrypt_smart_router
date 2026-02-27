# Incrypt Smart Router

[![Build](https://img.shields.io/badge/build-passing-brightgreen)](#)
[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](#)
[![License](https://img.shields.io/badge/license-MIT-blue)](#)
[![OpenClaw](https://img.shields.io/badge/OpenClaw-compatible-orange)](https://openclaw.ai)

**Smart AI routing for [OpenClaw](https://openclaw.ai) — compress context, route by complexity, cache responses, free-first.**

Built by **[Incrypt Network](https://incrypt.network)** · [X @incrypt_defi](https://x.com/incrypt_defi) · [incryptinvestments@protonmail.com](mailto:incryptinvestments@protonmail.com)

---

## Support the project

We offer this router free so you can run OpenClaw agents without paying for API keys. If you’d like to support us:

| Network | Address |
|--------|--------|
| **Solana** | `iNc3VKxxXmARmp1g4edzRuRNAA31DkGfyMxzkZosguh` |
| **EVM** | `0xB78B84EEe2F6CD8b33622fBbD4cCcB1c7009369e` |

---

## What it does

| Feature | Description |
|--------|-------------|
| **Context compression** | Compacts conversation context before sending to models (rule-based + dictionary + RLE-style), reducing token usage. |
| **Smart routing** | Routes each request by complexity: **simple** → free models, **standard** → low-cost, **complex** → premium (when keys are in `.env`). |
| **Caching** | Caches responses to avoid redundant API calls. |
| **Fallback** | If one provider is slow or errors, automatically tries the next in the same tier. |
| **Free-first** | Works out of the box with **no API keys** using free tiers (Cerebras, Groq, HuggingFace, etc.). Add keys to scale up. |

---

## Quick start

```bash
git clone https://github.com/incrypt-network/incrypt-smart-router.git
cd incrypt-smart-router
npm install && npm run build
cp .env.example .env   # optional: add API keys for paid tiers
npm start
```

Router runs at **http://localhost:3140**. Point your OpenClaw agent at:

**`http://localhost:3140/v1/chat/completions`**

See **[OpenClaw integration](docs/OPENCLAW_INTEGRATION.md)** for step-by-step setup.

---

## Routing tiers

| Tier | Typical tasks | Default models (free) | With API keys |
|------|----------------|----------------------|----------------|
| **Simple** | Formatting, lookups, short Q&A | Cerebras, Groq, HuggingFace | Same + optional override |
| **Standard** | Email drafting, summaries | Together, etc. | GPT-4o-mini, Claude Haiku, Gemini Flash |
| **Complex** | Analysis, reports, reasoning | — | Claude Sonnet, GPT-4o, etc. |

Start with **no keys** for free-only routing; add `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_AI_API_KEY` (and optional `CEREBRAS_API_KEY`, `GROQ_API_KEY`, `HF_TOKEN`) to `.env` to enable paid tiers.

---

## API

- **POST /v1/chat/completions** — OpenAI-compatible chat. Body: `messages`, optional `model`, `max_tokens`, `temperature`, `forceTier`.
- **GET /health** — Liveness.
- **GET /stats** — Cache size and recent request metadata.

---

## Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3140` |
| `COMPRESSION_ENABLED` | Enable context compression | `true` |
| `CACHE_TTL_SECONDS` | Response cache TTL | `3600` |
| `CACHE_MAX_SIZE` | Max cached requests | `1000` |
| `OPENAI_API_KEY` | Enable OpenAI models | — |
| `ANTHROPIC_API_KEY` | Enable Claude | — |
| `GOOGLE_AI_API_KEY` | Enable Gemini | — |
| `CEREBRAS_API_KEY` | Cerebras (optional) | — |
| `GROQ_API_KEY` | Groq (optional) | — |
| `HF_TOKEN` | HuggingFace (optional) | — |

---

## Development

```bash
npm run build      # Build
npm run test       # Run tests
npm run dev        # Watch build
npm run typecheck  # TypeScript check
```

---

## References

- [OpenClaw](https://openclaw.ai) — AI agent framework
- [ClawRouter](https://github.com/BlockRunAI/ClawRouter) — Routing ideas and OpenClaw positioning
- [claw-compactor](https://github.com/aeromomo/claw-compactor) — Multi-layer compression inspiration

---

## License

MIT · [Incrypt Network](https://incrypt.network)
