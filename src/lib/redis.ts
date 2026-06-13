import "server-only";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { env } from "@/lib/env";

/**
 * Minimal KV surface we rely on across auth (OTP, 2FA challenges, refresh-token
 * rotation families). Backed by Upstash when configured, otherwise an in-memory
 * shim so the app remains fully functional in local development.
 */
export interface KV {
  get<T = string>(key: string): Promise<T | null>;
  set(key: string, value: unknown, opts?: { ex?: number }): Promise<void>;
  del(key: string): Promise<void>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<void>;
}

class MemoryKV implements KV {
  private store = new Map<string, { value: unknown; expiresAt?: number }>();

  private alive(key: string) {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return entry;
  }

  async get<T = string>(key: string): Promise<T | null> {
    const entry = this.alive(key);
    return entry ? (entry.value as T) : null;
  }

  async set(key: string, value: unknown, opts?: { ex?: number }) {
    this.store.set(key, {
      value,
      expiresAt: opts?.ex ? Date.now() + opts.ex * 1000 : undefined,
    });
  }

  async del(key: string) {
    this.store.delete(key);
  }

  async incr(key: string) {
    const entry = this.alive(key);
    const next = (typeof entry?.value === "number" ? entry.value : 0) + 1;
    this.store.set(key, { value: next, expiresAt: entry?.expiresAt });
    return next;
  }

  async expire(key: string, seconds: number) {
    const entry = this.alive(key);
    if (entry) entry.expiresAt = Date.now() + seconds * 1000;
  }
}

class UpstashKV implements KV {
  constructor(private redis: Redis) {}
  async get<T = string>(key: string) {
    return (await this.redis.get<T>(key)) ?? null;
  }
  async set(key: string, value: unknown, opts?: { ex?: number }) {
    if (opts?.ex) await this.redis.set(key, value, { ex: opts.ex });
    else await this.redis.set(key, value);
  }
  async del(key: string) {
    await this.redis.del(key);
  }
  async incr(key: string) {
    return this.redis.incr(key);
  }
  async expire(key: string, seconds: number) {
    await this.redis.expire(key, seconds);
  }
}

let _kv: KV | null = null;
let _upstash: Redis | null = null;

export function getUpstash(): Redis | null {
  if (!env.hasRedis()) return null;
  if (!_upstash) {
    _upstash = new Redis({
      url: env.redisUrl()!,
      token: env.redisToken()!,
    });
  }
  return _upstash;
}

export function kv(): KV {
  if (_kv) return _kv;
  const upstash = getUpstash();
  _kv = upstash ? new UpstashKV(upstash) : new MemoryKV();
  return _kv;
}

// ---------------------------------------------------------------------------
// Rate limiting — sliding window. Falls back to "always allow" without Upstash.
// ---------------------------------------------------------------------------
type Limiter = { limit: (id: string) => Promise<{ success: boolean; remaining: number }> };

function makeLimiter(tokens: number, window: Parameters<typeof Ratelimit.slidingWindow>[1]): Limiter {
  const redis = getUpstash();
  if (!redis) {
    return { limit: async () => ({ success: true, remaining: tokens }) };
  }
  const rl = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(tokens, window),
    analytics: false,
    prefix: "rl",
  });
  return { limit: async (id) => rl.limit(id) };
}

export const limiters = {
  login: makeLimiter(8, "5 m"),
  register: makeLimiter(5, "10 m"),
  otp: makeLimiter(6, "10 m"),
  reset: makeLimiter(4, "15 m"),
  refresh: makeLimiter(60, "1 m"),
};
