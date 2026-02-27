import { describe, it, expect } from "vitest";
import { classify } from "./index.js";

describe("classifier", () => {
  it("returns simple for short generic query", () => {
    const messages = [{ role: "user" as const, content: "What is 2+2?" }];
    expect(classify(messages)).toBe("simple");
  });

  it("returns simple for format request", () => {
    const messages = [{ role: "user" as const, content: "Format this as bullet points" }];
    expect(classify(messages)).toBe("simple");
  });

  it("returns complex for analysis keyword", () => {
    const messages = [{ role: "user" as const, content: "Analyze the financial risk of this portfolio" }];
    expect(classify(messages)).toBe("complex");
  });

  it("returns complex for long context", () => {
    const long = "x".repeat(5000);
    const messages = [{ role: "user" as const, content: long }];
    expect(classify(messages)).toBe("complex");
  });

  it("returns standard for medium length", () => {
    const messages = [{ role: "user" as const, content: "Explain how React hooks work in a few paragraphs. " + "x".repeat(1000) }];
    const tier = classify(messages);
    expect(["standard", "complex"]).toContain(tier);
  });
});
