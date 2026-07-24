import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sanitizeEnv } from '@/lib/supabase/env'

export const dynamic = 'force-dynamic'

function isAdmin(email: string | undefined): boolean {
  const adminEmails = sanitizeEnv(process.env.ADMIN_EMAILS)
    .split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
  return adminEmails.includes((email ?? '').toLowerCase())
}

// PATCH /api/admin/team
// Body: { teamId, status?, stage_reached? }
export async function PATCH(request: Request) {
  try {
    const userSupabase = await createClient()
    const { data: { user } } = await userSupabase.auth.getUser()
    if (!user || !isAdmin(user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { teamId, status, stage_reached } = body
    if (!teamId) return NextResponse.json({ error: 'teamId required' }, { status: 400 })

    const updates: Record<string, unknown> = {}
    if (status !== undefined)        updates.status        = status
    if (stage_reached !== undefined) updates.stage_reached = stage_reached

    const admin = createAdminClient()
    const { error } = await admin.from('teams').update(updates).eq('id', teamId)
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
