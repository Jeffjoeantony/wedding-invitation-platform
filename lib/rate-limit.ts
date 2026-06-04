import { NextRequest, NextResponse } from 'next/server'

const windowMs = 60_000 // 1 minute
const limits: Record<string, { count: number; reset: number }> = {}

/**
 * Simple in-process rate limiter.
 * Returns a 429 NextResponse if the IP has exceeded the limit, else null.
 */
export function rateLimit(
  req: NextRequest,
  maxRequests = 20
): NextResponse | null {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'

  const now = Date.now()
  const entry = limits[ip]

  if (!entry || now > entry.reset) {
    limits[ip] = { count: 1, reset: now + windowMs }
    return null
  }

  entry.count++

  if (entry.count > maxRequests) {
    return NextResponse.json(
      { error: 'Too many requests. Please slow down.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((entry.reset - now) / 1000)),
        },
      }
    )
  }

  return null
}
