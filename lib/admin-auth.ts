import { createServerClient } from '@supabase/ssr'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * Validates the incoming request has a valid Supabase session
 * AND that the user's email exists in the `admins` table.
 *
 * Returns a 401 NextResponse if unauthorised, or null if authorised.
 * Usage: const unauth = await requireAdmin(req); if (unauth) return unauth;
 */
export async function requireAdmin(req: NextRequest): Promise<NextResponse | null> {
  try {
    // Build a Supabase SSR client using the request cookies
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              )
            } catch {
              // Called from a Route Handler — safe to ignore
            }
          },
        },
      },
    )

    // Verify the session
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user?.email) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    // Confirm the user is in the admins whitelist table (uses service role)
    const adminClient = createAdminClient()
    const { data: adminRow, error: adminError } = await adminClient
      .from('admins')
      .select('id')
      .eq('email', user.email)
      .single()

    if (adminError || !adminRow) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return null // authorised ✓
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
