import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { sanitizeEnv } from '@/lib/supabase/env'

export async function POST(request: Request) {
  const body = await request.json()

  // Strip non-printable/non-ASCII chars (BOM, zero-width spaces) from user inputs
  const sanitize = (s: string): string =>
    (s ?? '').replace(/[^\x20-\x7E]/g, '').trim()

  const email    = sanitize(String(body.email    ?? ''))
  const password = sanitize(String(body.password ?? ''))
  const username = sanitize(String(body.username ?? ''))

  if (!email || !password || !username) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabaseUrl     = sanitizeEnv(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const supabaseAnon    = sanitizeEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  const supabaseService = sanitizeEnv(process.env.SUPABASE_SERVICE_ROLE_KEY)

  const supabaseAdmin = createClient(supabaseUrl, supabaseService, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Step 1: Create auth user (auto-confirmed, no email sent)
  const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username },
  })

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 400 })
  }

  const userId = userData.user.id

  // Step 2: Explicitly upsert profile using service role — works even if the
  // on_auth_user_created trigger failed or the schema wasn't run yet
  await supabaseAdmin
    .from('profiles')
    .upsert({ id: userId, username }, { onConflict: 'id' })

  // Also ensure a leaderboard row exists
  await supabaseAdmin
    .from('leaderboard')
    .upsert({ user_id: userId }, { onConflict: 'user_id' })

  // Step 3: Sign in server-side — clean credentials never touch browser fetch/Web Crypto
  const supabaseAnonClient = createClient(supabaseUrl, supabaseAnon, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: signInData, error: signInError } = await supabaseAnonClient.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError || !signInData.session) {
    return NextResponse.json({ error: signInError?.message ?? 'Sign-in failed after signup' }, { status: 400 })
  }

  return NextResponse.json({
    session: {
      access_token:  signInData.session.access_token,
      refresh_token: signInData.session.refresh_token,
    },
  })
}
