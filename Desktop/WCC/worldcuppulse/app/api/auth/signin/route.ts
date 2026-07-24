import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { sanitizeEnv } from '@/lib/supabase/env'

export async function POST(request: Request) {
  const body = await request.json()

  // Strip non-printable/non-ASCII chars (BOM, zero-width spaces) from credentials
  const sanitize = (s: string): string =>
    (s ?? '').replace(/[^\x20-\x7E]/g, '').trim()

  const email    = sanitize(String(body.email    ?? ''))
  const password = sanitize(String(body.password ?? ''))

  if (!email || !password) {
    return NextResponse.json({ error: 'Missing email or password' }, { status: 400 })
  }

  // Sign in server-side — clean credentials never touch browser fetch/Web Crypto
  const supabase = createClient(
    sanitizeEnv(process.env.NEXT_PUBLIC_SUPABASE_URL),
    sanitizeEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.session) {
    return NextResponse.json({ error: error?.message ?? 'Sign-in failed' }, { status: 400 })
  }

  return NextResponse.json({
    session: {
      access_token:  data.session.access_token,
      refresh_token: data.session.refresh_token,
    },
  })
}
