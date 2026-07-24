export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase/admin'
import AdminPanel from './AdminPanel'
import type { Match, Team } from '@/lib/types'

export default async function AdminPage() {
  const admin = createAdminClient()

  const [{ data: matches }, { data: teams }] = await Promise.all([
    admin
      .from('matches')
      .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)')
      .order('match_date', { ascending: true }),
    admin
      .from('teams')
      .select('*')
      .order('group_id')
      .order('name'),
  ])

  return (
    <AdminPanel
      initialMatches={(matches as (Match & { note?: string })[]) ?? []}
      teams={(teams as Team[]) ?? []}
    />
  )
}
