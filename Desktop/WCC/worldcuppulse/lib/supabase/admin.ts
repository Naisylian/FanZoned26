import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { sanitizeEnv } from './env'

/**
 * Creates a Supabase client using the service role key.
 * Bypasses Row Level Security — only use in server-side admin routes.
 * Never expose this client to the browser.
 */
export function createAdminClient() {
  const url = sanitizeEnv(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const key = sanitizeEnv(process.env.SUPABASE_SERVICE_ROLE_KEY)
  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
