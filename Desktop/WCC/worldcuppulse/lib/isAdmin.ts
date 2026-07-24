import { sanitizeEnv } from './supabase/env'

/**
 * Returns true if the given email is in the ADMIN_EMAILS env var
 * (comma-separated list). Case-insensitive.
 * Only call server-side — reads process.env.ADMIN_EMAILS.
 */
export function isAdmin(email: string | undefined): boolean {
  const adminEmails = sanitizeEnv(process.env.ADMIN_EMAILS)
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)
  return adminEmails.includes((email ?? '').toLowerCase())
}

/**
 * Returns true if the user should have full app access —
 * either they've paid, or they're an admin (bypasses paywall entirely).
 */
export function hasAccess(
  profile: { has_paid: boolean } | null | undefined,
  email: string | undefined,
): boolean {
  return !!profile?.has_paid || isAdmin(email)
}
