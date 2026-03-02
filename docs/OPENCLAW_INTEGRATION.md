# OpenClaw integration

Use Incrypt Smart Router as the LLM backend for your [OpenClaw](https://openclaw.ai) agents: traffic is compressed, cached, and routed to free or paid models automatically.

---

## Install and use (for you or your agent)

### One-command install

```bash
curl -fsSL https://raw.githubusercontent.com/GHX5T-SOL/incrypt_smart_router/main/scripts/install.sh | bash
```

Then add at least one API key to `.env` (e.g. `GROQ_API_KEY` from [console.groq.com](https://console.groq.com)), and start the router with `npm start`.

### Telling your OpenClaw agent to use the router

You can instruct your **OpenClaw agent** in natural language to install and use Incrypt Smart Router, for example:

- *“Install and use https://github.com/GHX5T-SOL/incrypt_smart_router”*
- *“Set up Incrypt Smart Router and use it as my LLM backend”*

The agent can clone the repo, run the install script (or `npm install && npm run build`), create `.env` with your chosen keys, start the router, and then you (or the agent) configure OpenClaw to use the router endpoint as below.

---

## Option A: Run router as a separate service (recommended)

1. **Install and start the router**
   ```bash
   cd /path/to/incrypt_smart_router
   npm install && npm run build
   cp .env.example .env   # add at least one key, e.g. GROQ_API_KEY
   npm start
   ```
   The router listens on **http://localhost:3140** by default.

2. **Point OpenClaw at the router**  
   In your OpenClaw config (e.g. `~/.openclaw/openclaw.json`), add a custom provider and set it as the agent’s primary model. Example:

```json5
{
  models: {
    mode: "merge",
    providers: {
      "incrypt-router": {
        baseUrl: "http://localhost:3140/v1",
        api: "openai-responses",
        authHeader: false,
        models: [
          {
            id: "incrypt/auto",
            name: "Incrypt Smart Router (auto)",
            api: "openai-responses",
            reasoning: false,
            input: ["text"],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 128000,
            maxTokens: 8192,
          },
        ],
      },
    },
  },
  agent: {
    workspace: "~/.openclaw/workspace",
    model: { primary: "incrypt-router/incrypt/auto" },
  },
}
```

3. **Restart OpenClaw**
   ```bash
   openclaw gateway restart
   ```

After this, OpenClaw will send chat requests to Incrypt Smart Router, which will compress, classify, route, and cache as described in the main [README](../README.md).

---

## Option B: OpenAI-compatible proxy (any client)

The router exposes an **OpenAI-compatible** `POST /v1/chat/completions` endpoint. Any client that talks to the OpenAI API can use this URL:

- **Base URL:** `http://localhost:3140` (or your host)
- **Path:** `/v1/chat/completions`
- **Body:** Same as OpenAI (`messages`, optional `model`, `max_tokens`, `temperature`). The router may override `model` by task complexity.

No API key is required in the request; the router uses keys from `.env`. Add keys to enable paid tiers for standard/complex tasks.

---

## Environment

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Router server port | `3140` |
| `COMPRESSION_ENABLED` | Compress context before sending to models | `true` |
| `CACHE_TTL_SECONDS` | How long to cache responses | `3600` |
| `CACHE_MAX_SIZE` | Max cached requests | `1000` |
| `OPENAI_API_KEY` | Optional — enable GPT models | — |
| `ANTHROPIC_API_KEY` | Optional — enable Claude | — |
| `CEREBRAS_API_KEY` | Optional — Cerebras | — |
| `GROQ_API_KEY` | Optional — Groq (free tier) | — |
| `HF_TOKEN` | Optional — HuggingFace | — |

---

## Quick test

```bash
curl -X POST http://localhost:3140/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Say hello in one word"}]}'
```

You should get a JSON response with `choices[0].message.content` and `meta` (tier, model, provider, cacheHit, etc.).

---

## Health and stats

- **GET /health** — Liveness; returns `{ status: "ok", service: "incrypt-smart-router" }`.
- **GET /stats** — Cache size and last 50 requests (for debugging or simple dashboards).

For full API details, see the main [README](../README.md#-api-reference).
