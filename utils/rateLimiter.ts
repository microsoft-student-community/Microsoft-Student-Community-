import { NextRequest } from "next/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

class RateLimiterMemory {
  private store = new Map<string, { count: number; resetAt: number }>();
  private windowMs: number;
  private max: number;

  constructor(windowMs: number, max: number) {
    this.windowMs = windowMs;
    this.max = max;
  }

  public check(key: string): RateLimitResult {
    const now = Date.now();
    let record = this.store.get(key);

    if (!record || now > record.resetAt) {
      record = { count: 0, resetAt: now + this.windowMs };
    }

    record.count++;
    this.store.set(key, record);

    // Simple naive pruning for memory safety
    if (this.store.size > 5000) {
      this.store.clear();
    }

    return {
      success: record.count <= this.max,
      limit: this.max,
      remaining: Math.max(0, this.max - record.count),
      reset: Math.ceil(record.resetAt / 1000),
    };
  }
}

// Global registry of memory limiters & Upstash instances to prevent re-instantiation across dev reloads
const globalForLimiter = globalThis as unknown as {
  limiters: Record<string, RateLimiterMemory>;
  upstashLimiters: Record<string, Ratelimit>;
};

if (!globalForLimiter.limiters) {
  globalForLimiter.limiters = {};
}
if (!globalForLimiter.upstashLimiters) {
  globalForLimiter.upstashLimiters = {};
}

// Initialize Upstash Redis if env vars are present
const upstashUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
const isUpstashConfigured =
  !!upstashUrl &&
  !!upstashToken &&
  /^https:\/\//i.test(upstashUrl) &&
  !upstashUrl.includes('YOUR_') &&
  !upstashToken.includes('YOUR_');

/** A process-memory limiter is useful locally, but is never a production control. */
export function hasDistributedRateLimiting(): boolean {
  return isUpstashConfigured;
}

let redisClient: Redis | null = null;
if (isUpstashConfigured) {
  try {
    redisClient = new Redis({
      url: upstashUrl!,
      token: upstashToken!,
    });
  } catch (err) {
    console.error("Failed to initialize Upstash Redis:", err);
  }
}

/**
 * Checks rate limit using Upstash if configured, otherwise falls back to memory.
 */
export async function checkRateLimit(
  name: string,
  key: string,
  windowMs: number,
  max: number
): Promise<RateLimitResult> {
  const fullKey = `${name}:${key}`;

  if (isUpstashConfigured && redisClient) {
    try {
      const cacheKey = `${name}:${windowMs}:${max}`;
      if (!globalForLimiter.upstashLimiters[cacheKey]) {
        globalForLimiter.upstashLimiters[cacheKey] = new Ratelimit({
          redis: redisClient,
          limiter: Ratelimit.slidingWindow(max, `${Math.max(1, Math.ceil(windowMs / 1000))} s`),
          analytics: true,
          prefix: `@upstash/ratelimit:${name}`,
        });
      }

      const ratelimit = globalForLimiter.upstashLimiters[cacheKey];
      const result = await ratelimit.limit(fullKey);

      return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: Math.ceil(result.reset / 1000), // convert to Unix timestamp in seconds
      };
    } catch (err) {
      console.warn("Upstash Rate Limiting failed, falling back to Memory:", err);
    }
  }

  // Memory Fallback
  const memoryLimiterKey = `${name}:${windowMs}:${max}`;
  if (!globalForLimiter.limiters[memoryLimiterKey]) {
    globalForLimiter.limiters[memoryLimiterKey] = new RateLimiterMemory(windowMs, max);
  }
  return globalForLimiter.limiters[memoryLimiterKey].check(key);
}

/**
 * Resolves the client IP address from request headers.
 */
export function getClientIp(req: NextRequest | Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}
