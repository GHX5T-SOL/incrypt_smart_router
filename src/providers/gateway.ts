/**
 * Provider gateway — call external chat APIs with a unified interface.
 * Supports OpenAI-compatible and Anthropic-style APIs.
 */

import type { ChatMessage, ProviderConfig } from "../types.js";

export interface CompletionOptions {
  messages: ChatMessage[];
  model: string;
  max_tokens?: number;
  temperature?: number;
}

export interface CompletionResult {
  content: string;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
  finishReason?: string;
}

export async function complete(
  provider: ProviderConfig,
  options: CompletionOptions,
  env: NodeJS.ProcessEnv
): Promise<CompletionResult> {
  const apiKey = provider.envKey ? env[provider.envKey] : undefined;
  const baseUrl = (provider.baseUrl || "").replace(/\/$/, "");

  if (!provider.free && !apiKey) {
    throw new Error(`Provider ${provider.id} requires API key: ${provider.envKey}`);
  }

  // OpenAI-compatible (Cerebras, Groq, Together, OpenAI, some others)
  if (provider.id !== "anthropic" && provider.id !== "anthropic-premium") {
    const url = `${baseUrl}/chat/completions`;
    const body = {
      model: options.model || provider.modelId,
      messages: options.messages,
      max_tokens: options.max_tokens ?? provider.maxTokens ?? 2048,
      temperature: options.temperature ?? 0.7,
    };
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
    };
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Provider ${provider.id}: ${res.status} ${err}`);
    }
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string }; finish_reason?: string }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
    };
    const choice = data.choices?.[0];
    return {
      content: choice?.message?.content ?? "",
      usage: data.usage
        ? {
            prompt_tokens: data.usage.prompt_tokens ?? 0,
            completion_tokens: data.usage.completion_tokens ?? 0,
            total_tokens: data.usage.total_tokens ?? 0,
          }
        : undefined,
      finishReason: choice?.finish_reason,
    };
  }

  // Anthropic (messages API)
  const url = "https://api.anthropic.com/v1/messages";
  const system = options.messages.find((m) => m.role === "system")?.content;
  const restMessages = options.messages.filter((m) => m.role !== "system");
  const body = {
    model: options.model || provider.modelId,
    max_tokens: options.max_tokens ?? 2048,
    system: system || undefined,
    messages: restMessages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
  };
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Provider ${provider.id}: ${res.status} ${err}`);
  }
  const data = (await res.json()) as {
    content?: Array<{ text?: string }>;
    usage?: { input_tokens?: number; output_tokens?: number };
    stop_reason?: string;
  };
  const text = data.content?.map((c) => c.text).join("") ?? "";
  return {
    content: text,
    usage: data.usage
      ? {
          prompt_tokens: data.usage.input_tokens ?? 0,
          completion_tokens: data.usage.output_tokens ?? 0,
          total_tokens: (data.usage.input_tokens ?? 0) + (data.usage.output_tokens ?? 0),
        }
      : undefined,
    finishReason: data.stop_reason,
  };
}
