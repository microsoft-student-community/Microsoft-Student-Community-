import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { checkRateLimit, getClientIp } from '@/utils/rateLimiter'

const MAX_JSON_BYTES = 64 * 1024

export function noStoreJson(body: Record<string, unknown>, status = 200, headers: HeadersInit = {}) {
  return NextResponse.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'X-Content-Type-Options': 'nosniff',
      ...headers,
    },
  })
}

export async function readJsonObject(request: NextRequest): Promise<Record<string, unknown> | null> {
  const contentLength = Number(request.headers.get('content-length') || 0)
  if (contentLength > MAX_JSON_BYTES) return null

  try {
    const parsed: unknown = await request.json()
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null
    return parsed as Record<string, unknown>
  } catch {
    return null
  }
}

export async function requireUser() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) return { error: noStoreJson({ error: 'Authentication required' }, 401) }
  return { supabase, user: data.user }
}

/**
 * Enforces a distributed limit on financially-sensitive writes. Production traffic
 * must never silently fall back to a per-instance in-memory limiter.
 */
export async function enforceSensitiveRateLimit(request: NextRequest, name: string, max: number, windowMs: number) {
  const result = await checkRateLimit(name, getClientIp(request), windowMs, max)
  const headers = {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(result.reset),
  }

  if (!result.success) {
    const retryAfter = Math.max(1, result.reset - Math.floor(Date.now() / 1000))
    return noStoreJson({ error: 'Too many requests. Please try again shortly.' }, 429, {
      ...headers,
      'Retry-After': String(retryAfter),
    })
  }
  return { headers }
}

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}
