import { LRUCache } from "lru-cache";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const cache = new LRUCache<string, RateLimitEntry>({
  max: 10000,
  ttl: 60_000,
});

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number = 60_000,
): { success: boolean; remaining: number } {
  const now = Date.now();
  const entry = cache.get(key);

  if (!entry || now > entry.resetAt) {
    cache.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0 };
  }

  entry.count++;
  cache.set(key, entry);
  return { success: true, remaining: limit - entry.count };
}
