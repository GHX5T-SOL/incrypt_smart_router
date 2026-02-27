import { describe, it, expect } from "vitest";
import { compact, decompressWithCodebook } from "./index.js";

describe("compaction", () => {
  it("deduplicates consecutive same-role same content", () => {
    const messages = [
      { role: "user" as const, content: "Hello" },
      { role: "user" as const, content: "Hello" },
      { role: "assistant" as const, content: "Hi" },
    ];
    const out = compact(messages);
    expect(out.messages).toHaveLength(2);
    expect(out.messages[0].content).toBe("Hello");
    expect(out.messages[1].content).toBe("Hi");
  });

  it("reduces multiple newlines", () => {
    const messages = [{ role: "user" as const, content: "A\n\n\n\nB" }];
    const out = compact(messages);
    expect(out.messages[0].content).toBe("A\n\nB");
  });

  it("returns compressedFromChars and compressedToChars", () => {
    const messages = [{ role: "user" as const, content: "Hello world" }];
    const out = compact(messages);
    expect(out.compressedFromChars).toBe(11);
    expect(out.compressedToChars).toBeLessThanOrEqual(11);
  });

  it("decompressWithCodebook reverses dictionary encoding", () => {
    const codebook = { "$00": "repeated phrase" };
    expect(decompressWithCodebook("Say $00 here", codebook)).toBe("Say repeated phrase here");
  });
});
