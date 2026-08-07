import { NextRequest } from "next/server";

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

class RateLimiterMemory {
  private store = new Map<string, number[]>();
  private windowMs: number;
  private max: number;

  constructor(windowMs: number, max: number) {
    this.windowMs = windowMs;
    this.max = max;
  }

  public check(key: string): RateLimitResult {
    const now = Date.now();
    
    // Memory Optimization: Prune older entries if size gets large
    if (this.store.size > 5000) {
      for (const [k, timestamps] of this.store.entries()) {
        const filtered = timestamps.filter(t => now - t < this.windowMs);
        if (filtered.length === 0) {
          this.store.delete(k);
        } else {
          this.store.set(k, filtered);
        }
      }
    }

    const timestamps = this.store.get(key) || [];
    const valid = timestamps.filter(t => now - t < this.windowMs);

    if (valid.length >= this.max) {
      const oldest = valid[0];
      const reset = Math.ceil((oldest + this.windowMs) / 1000); // Reset time as Unix timestamp (seconds)
      return {
        success: false,
        limit: this.max,
        remaining: 0,
        reset
      };
    }

    valid.push(now);
    this.store.set(key, valid);

    return {
      success: true,
      limit: this.max,
      remaining: this.max - valid.length,
      reset: Math.ceil((now + this.windowMs) / 1000)
    };
  }
}

// Global registry of memory limiters to prevent re-instantiation across dev reloads
const globalForLimiter = globalThis as unknown as {
  limiters: Record<string, RateLimiterMemory>;
};

if (!globalForLimiter.limiters) {
  globalForLimiter.limiters = {};
}

/**
 * Checks rate limit using in-memory sliding window rate limiter.
 */
export async function checkRateLimit(
  name: string,
  key: string,
  windowMs: number,
  max: number
): Promise<RateLimitResult> {
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
