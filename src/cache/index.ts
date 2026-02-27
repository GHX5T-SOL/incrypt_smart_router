/**
 * Exact + semantic cache with TTL.
 * Exact: hash of normalized request. Semantic: optional similarity (simplified as key fingerprint).
 */

import { LRUCache } from "lru-cache";
import type { RouterRequest, RouterResponse } from "../types.js";

function requestKey(req: RouterRequest): string {
  const norm = {
    messages: req.messages,
    model: req.model ?? "",
    forceTier: req.forceTier ?? "",
  };
  return JSON.stringify(norm);
}

function hash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    h = (h << 5) - h + c;
    h |= 0;
  }
  return "k" + Math.abs(h).toString(36);
}

export interface CacheConfig {
  ttlSeconds: number;
  maxSize: number;
}

export function createCache(config: CacheConfig) {
  const cache = new LRUCache<string, RouterResponse>({
    max: config.maxSize,
    ttl: config.ttlSeconds * 1000,
  });

  return {
    get(req: RouterRequest): RouterResponse | undefined {
      const key = hash(requestKey(req));
      return cache.get(key);
    },
    set(req: RouterRequest, res: RouterResponse): void {
      const key = hash(requestKey(req));
      cache.set(key, res);
    },
    has(req: RouterRequest): boolean {
      const key = hash(requestKey(req));
      return cache.has(key);
    },
    getStats(): { size: number; max: number } {
      return { size: cache.size, max: cache.max };
    },
  };
}

export type RouterCache = ReturnType<typeof createCache>;
