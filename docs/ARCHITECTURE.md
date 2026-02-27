# Architecture

Incrypt Smart Router sits between OpenClaw agents (or any OpenAI-compatible client) and LLM providers.

## Flow

```
OpenClaw/Client → POST /v1/chat/completions → Smart Router
  → Cache lookup (exact key)
  → On miss: Compaction → Classifier → Routing policy → Provider mesh → Failover
  → Response normalized + telemetry
  → Client
```

## Components

- **Cache** — Exact-match request cache with TTL and max size. Reduces redundant API calls.
- **Compaction** — Deterministic, multi-layer compression (rule-based, dictionary, RLE-style) to cut token usage before sending to models.
- **Classifier** — Heuristic complexity: simple / standard / complex. No external API.
- **Routing policy** — Free-first: simple → free providers (Cerebras, Groq, HuggingFace, etc.); standard/complex → low-cost or premium when API keys are in `.env`.
- **Provider mesh** — One gateway per provider; OpenAI-compatible and Anthropic adapters.
- **Failover** — On timeout or error, try next provider in the same tier.
- **Telemetry** — Per-request metadata (tier, model, latency, cache hit, tokens) exposed via `/stats`.

## Config

Loaded from environment; see `.env.example` and `docs/OPENCLAW_INTEGRATION.md`.
