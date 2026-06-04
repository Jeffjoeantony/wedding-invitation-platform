import { NextRequest, NextResponse } from 'next/server'

/**
 * Validates the incoming request has a valid admin token.
 * Returns a 401 NextResponse if unauthorised, or null if authorised.
 * Usage: const unauth = requireAdmin(req); if (unauth) return unauth;
 */
export function requireAdmin(req: NextRequest): NextResponse | null {
  const adminPassword =
    process.env.ADMIN_PASSWORD ||
    process.env.NEXT_PUBLIC_ADMIN_PASSWORD

  if (!adminPassword) {
    console.error('ADMIN_PASSWORD environment variable is not set.')
    return NextResponse.json(
      { error: 'Server misconfiguration' },
      { status: 500 }
    )
  }

  // Token sent as a custom header by the client
  const token = req.headers.get('x-admin-token')

  if (!token || token !== adminPassword) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  return null // authorised
}
