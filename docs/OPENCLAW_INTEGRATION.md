# OpenClaw integration

Use Incrypt Smart Router as the LLM backend for your [OpenClaw](https://openclaw.ai) agents so that traffic is compressed, cached, and routed to free (or paid) models automatically.

## Option A: Run router as a separate service (recommended)

1. **Install and start the router**
   ```bash
   cd /path/to/incrypt-smart-router
   npm install && npm run build
   cp .env.example .env   # edit if you want to add API keys
   npm start
   ```
   The router listens on `http://localhost:3140` by default.

2. **Point OpenClaw at the router**
   In your OpenClaw config (e.g. `openclaw.json` or agent config), set the chat endpoint to the router:
   ```json
   {
     "models": {
       "default": {
         "endpoint": "http://localhost:3140/v1/chat/completions",
         "apiKey": "not-needed"
       }
     }
   }
   ```
   Or set the base URL so that `/v1/chat/completions` is used. Exact key depends on your OpenClaw version; see [OpenClaw docs](https://openclaw.ai).

3. **Optional: use the plugin**
   If your OpenClaw supports plugins, copy or link this repo into the extensions folder and reference `openclaw.plugin.json`:
   ```json
   {
     "name": "incrypt-smart-router",
     "openclaw": {
       "router": true,
       "endpoint": "http://localhost:3140/v1/chat/completions"
     }
   }
   ```

## Option B: OpenAI-compatible proxy

The router exposes an **OpenAI-compatible** `POST /v1/chat/completions` endpoint. Any client that talks to the OpenAI API can target this URL instead:

- **Base URL:** `http://localhost:3140` (or your host)
- **Path:** `/v1/chat/completions`
- **Body:** Same as OpenAI (e.g. `messages`, `model`, `max_tokens`, `temperature`). The `model` field is optional; the router will choose a model based on task complexity.

No API key is required for free-tier routing. If you add keys to `.env`, the router will use paid models for standard/complex tasks.

## Environment

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Router server port | `3140` |
| `COMPRESSION_ENABLED` | Compress context before sending to models | `true` |
| `CACHE_TTL_SECONDS` | How long to cache responses | `3600` |
| `CACHE_MAX_SIZE` | Max cached requests | `1000` |
| `OPENAI_API_KEY` | Optional — enable GPT models | — |
| `ANTHROPIC_API_KEY` | Optional — enable Claude | — |
| `GOOGLE_AI_API_KEY` | Optional — enable Gemini | — |
| `CEREBRAS_API_KEY` | Optional — Cerebras | — |
| `GROQ_API_KEY` | Optional — Groq | — |
| `HF_TOKEN` | Optional — HuggingFace | — |

## Quick test

```bash
curl -X POST http://localhost:3140/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Say hello in one word"}]}'
```

You should get a JSON response with `choices[0].message.content` and `meta` (tier, model, provider, cacheHit, etc.).

## Health and stats

- **GET /health** — Liveness.
- **GET /stats** — Cache size and last 50 requests (for debugging and simple dashboards).
