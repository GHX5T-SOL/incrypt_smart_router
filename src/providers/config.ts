/**
 * Free-first provider and model matrix.
 * When env keys are present, paid models are added to the pool for that tier.
 */

import type { ProviderConfig } from "../types.js";

export const FREE_PROVIDERS: ProviderConfig[] = [
  {
    id: "cerebras",
    name: "Cerebras",
    tier: "simple",
    free: true,
    modelId: "llama-3.3-70b",
    baseUrl: "https://api.cerebras.ai/v1",
    envKey: "CEREBRAS_API_KEY", // optional for free tier
  },
  {
    id: "huggingface",
    name: "HuggingFace",
    tier: "simple",
    free: true,
    modelId: "HuggingFaceH4/zephyr-7b-beta",
    baseUrl: "https://api-inference.huggingface.co",
    envKey: "HF_TOKEN",
  },
  {
    id: "groq",
    name: "Groq",
    tier: "simple",
    free: true,
    modelId: "llama-3.1-8b-instant",
    baseUrl: "https://api.groq.com/openai/v1",
    envKey: "GROQ_API_KEY",
  },
  {
    id: "together",
    name: "Together",
    tier: "standard",
    free: true,
    modelId: "meta-llama/Llama-3.2-3B-Instruct-Turbo",
    baseUrl: "https://api.together.xyz/v1",
    envKey: "TOGETHER_API_KEY",
  },
];

/** Paid providers added when API keys are in env */
export const PAID_PROVIDERS: ProviderConfig[] = [
  {
    id: "openai",
    name: "OpenAI",
    tier: "standard",
    free: false,
    modelId: "gpt-4o-mini",
    baseUrl: "https://api.openai.com/v1",
    envKey: "OPENAI_API_KEY",
  },
  {
    id: "openai-premium",
    name: "OpenAI",
    tier: "complex",
    free: false,
    modelId: "gpt-4o",
    baseUrl: "https://api.openai.com/v1",
    envKey: "OPENAI_API_KEY",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    tier: "standard",
    free: false,
    modelId: "claude-3-5-haiku-20241022",
    baseUrl: "https://api.anthropic.com",
    envKey: "ANTHROPIC_API_KEY",
  },
  {
    id: "anthropic-premium",
    name: "Anthropic",
    tier: "complex",
    free: false,
    modelId: "claude-sonnet-4-20250514",
    baseUrl: "https://api.anthropic.com",
    envKey: "ANTHROPIC_API_KEY",
  },
  {
    id: "google",
    name: "Google",
    tier: "standard",
    free: false,
    modelId: "gemini-1.5-flash",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    envKey: "GOOGLE_AI_API_KEY",
  },
];

export function getProvidersForTier(tier: "simple" | "standard" | "complex", env: NodeJS.ProcessEnv): ProviderConfig[] {
  const all = [...FREE_PROVIDERS, ...PAID_PROVIDERS];
  const withKeys = all.filter((p) => p.free || (p.envKey && env[p.envKey]));
  return withKeys.filter((p) => p.tier === tier);
}
