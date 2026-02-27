/**
 * Complexity classifier — simple / standard / complex
 * Heuristic-based for zero external calls; can be replaced with a small local model later.
 */

import type { ChatMessage, ComplexityTier } from "../types.js";

const SIMPLE_MAX_CHARS = 800;
const STANDARD_MAX_CHARS = 4000;

/** Keywords that suggest complex/reasoning tasks */
const COMPLEX_KEYWORDS = [
  "analyze", "analysis", "report", "financial", "risk", "compare", "evaluate",
  "reasoning", "step by step", "explain why", "critically", "comprehensive",
  "detailed report", "audit", "strategy", "recommendation", "assessment",
  "code review", "security review", "architecture", "design document",
];

/** Keywords that suggest simple lookups/formatting */
const SIMPLE_KEYWORDS = [
  "format", "capitalize", "translate", "summarize in one", "list", "what is",
  "define", "convert", "rewrite in", "bullet points", "short answer",
];

export function classify(messages: ChatMessage[]): ComplexityTier {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const content = lastUser?.content ?? "";
  const totalChars = messages.reduce((s, m) => s + m.content.length, 0);
  const lower = content.toLowerCase();

  const hasComplex = COMPLEX_KEYWORDS.some((k) => lower.includes(k));
  const hasSimple = SIMPLE_KEYWORDS.some((k) => lower.includes(k));

  if (hasComplex || totalChars > STANDARD_MAX_CHARS) return "complex";
  if (hasSimple && totalChars < SIMPLE_MAX_CHARS) return "simple";
  if (totalChars <= SIMPLE_MAX_CHARS) return "simple";
  if (totalChars <= STANDARD_MAX_CHARS) return "standard";
  return "complex";
}
