/**
 * Compaction pipeline — deterministic multi-layer context compression
 * Inspired by claw-compactor: rule-based, dictionary, RLE-style. No LLM required.
 */

import type { ChatMessage } from "../types.js";

export interface CompactionResult {
  messages: ChatMessage[];
  compressedFromChars: number;
  compressedToChars: number;
  codebook?: Record<string, string>;
}

/** Layer 1: Rule-based — dedup lines, strip markdown filler, merge consecutive same-role */
function ruleBased(messages: ChatMessage[]): ChatMessage[] {
  const out: ChatMessage[] = [];
  let lastRole: string | null = null;
  let lastContent = "";

  for (const m of messages) {
    let content = m.content
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    // Strip common markdown filler that doesn't change meaning
    content = content
      .replace(/^#+\s*$/gm, "")
      .replace(/^\*\*\s*\*\*$/gm, "")
      .replace(/[ \t]{2,}/g, " ");
    if (!content) continue;
    if (m.role === lastRole && content === lastContent) continue;
    lastRole = m.role;
    lastContent = content;
    out.push({ ...m, content });
  }
  return out;
}

/** Layer 2: Dictionary encoding — frequent phrases → $XX codes */
function dictionaryEncode(messages: ChatMessage[], codebook: Record<string, string>): { messages: ChatMessage[]; codebook: Record<string, string> } {
  const phraseCount = new Map<string, number>();
  const allText = messages.map((m) => m.content).join("\n");
  const words = allText.split(/\s+/).filter((w) => w.length > 10);
  for (let i = 0; i < words.length - 1; i++) {
    const bigram = words[i] + " " + words[i + 1];
    phraseCount.set(bigram, (phraseCount.get(bigram) ?? 0) + 1);
  }
  const sorted = [...phraseCount.entries()]
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 64);
  const book: Record<string, string> = { ...codebook };
  sorted.forEach(([phrase], i) => {
    const code = "$" + String(i).padStart(2, "0");
    if (!Object.values(book).includes(phrase)) book[code] = phrase;
  });

  const encode = (text: string): string => {
    let out = text;
    for (const [code, phrase] of Object.entries(book)) {
      out = out.split(phrase).join(code);
    }
    return out;
  };

  const encoded: ChatMessage[] = messages.map((m) => ({
    ...m,
    content: encode(m.content),
  }));
  return { messages: encoded, codebook: book };
}

/** Layer 3: RLE-style — path shorthand, repeated tokens */
function rleStyle(text: string): string {
  return text
    .replace(/(\w)\s+\1(\s+\1)+/g, (m) => m.replace(/\s/g, "").replace(/(.)/g, "$1 "))
    .replace(/\/[\w.-]+\/[\w.-]+/g, (m) => {
      const parts = m.split("/").filter(Boolean);
      if (parts.length < 3) return m;
      return "/" + parts[parts.length - 2] + "/" + parts[parts.length - 1];
    });
}

/**
 * Run full compaction pipeline on messages.
 * Returns compressed messages and optional codebook for decompression.
 */
export function compact(messages: ChatMessage[], options?: { useDictionary?: boolean }): CompactionResult {
  const useDict = options?.useDictionary !== false && messages.length > 0;
  let current = ruleBased(messages);
  let codebook: Record<string, string> = {};
  if (useDict) {
    const result = dictionaryEncode(current, {});
    current = result.messages;
    codebook = result.codebook;
  }
  current = current.map((m) => ({
    ...m,
    content: rleStyle(m.content),
  }));

  const compressedFromChars = messages.reduce((s, m) => s + m.content.length, 0);
  const compressedToChars = current.reduce((s, m) => s + m.content.length, 0);

  return {
    messages: current,
    compressedFromChars,
    compressedToChars,
    codebook: Object.keys(codebook).length ? codebook : undefined,
  };
}

/**
 * Decompress content using codebook (reverse $XX → phrase).
 */
export function decompressWithCodebook(text: string, codebook: Record<string, string>): string {
  let out = text;
  const entries = Object.entries(codebook).sort((a, b) => b[1].length - a[1].length);
  for (const [code, phrase] of entries) {
    out = out.split(code).join(phrase);
  }
  return out;
}
