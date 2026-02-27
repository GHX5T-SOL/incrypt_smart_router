import { describe, it, expect } from "vitest";
import { createCache } from "./index.js";

describe("cache", () => {
  it("returns undefined on miss", () => {
    const cache = createCache({ ttlSeconds: 60, maxSize: 10 });
    const req = { messages: [{ role: "user" as const, content: "Hi" }] };
    expect(cache.get(req)).toBeUndefined();
    expect(cache.has(req)).toBe(false);
  });

  it("returns cached response on hit", () => {
    const cache = createCache({ ttlSeconds: 60, maxSize: 10 });
    const req = { messages: [{ role: "user" as const, content: "Hi" }] };
    const res = {
      id: "test-1",
      choices: [{ message: { role: "assistant" as const, content: "Hello" }, finish_reason: "stop", index: 0 }],
    };
    cache.set(req, res as any);
    expect(cache.has(req)).toBe(true);
    expect(cache.get(req)).toEqual(res);
  });

  it("same request body hits same key", () => {
    const cache = createCache({ ttlSeconds: 60, maxSize: 10 });
    const req = { messages: [{ role: "user" as const, content: "Same" }] };
    const res = { id: "x", choices: [{ message: { role: "assistant" as const, content: "Y" }, index: 0 }] };
    cache.set(req, res as any);
    const req2 = { messages: [{ role: "user" as const, content: "Same" }] };
    expect(cache.get(req2)).toEqual(res);
  });

  it("getStats returns size and max", () => {
    const cache = createCache({ ttlSeconds: 60, maxSize: 5 });
    const req = { messages: [{ role: "user" as const, content: "A" }] };
    cache.set(req, { id: "1", choices: [] } as any);
    expect(cache.getStats()).toEqual({ size: 1, max: 5 });
  });
});
