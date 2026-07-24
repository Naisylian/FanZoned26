import { createBrowserClient } from '@supabase/ssr'
import { sanitizeEnv } from './env'

export function createClient() {
  return createBrowserClient(
    sanitizeEnv(process.env.NEXT_PUBLIC_SUPABASE_URL),
    sanitizeEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  )
}
