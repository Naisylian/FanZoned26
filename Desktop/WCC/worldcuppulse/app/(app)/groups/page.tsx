export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import GroupTable from '@/components/GroupTable'
import KnockoutBracket from '@/components/KnockoutBracket'
import type { Team, TeamStats, BracketSlot } from '@/lib/types'

const GROUP_IDS = ['A','B','C','D','E','F','G','H','I','J','K','L']

export default async function GroupsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: teams }, { data: stats }, { data: bracketSlots }] = await Promise.all([
    supabase.from('teams').select('*').order('group_id'),
    supabase.from('team_stats').select('*'),
    supabase.from('bracket_slots').select('*, team:teams(*), match:matches(*)'),
  ])

  const getGroupRows = (groupId: string) => {
    const groupTeams = (teams as Team[])?.filter(t => t.group_id === groupId) ?? []
    return groupTeams.map(team => ({
      team,
      stats: (stats as TeamStats[])?.find(s => s.team_id === team.id) ?? {
        id: '', team_id: team.id, played: 0, won: 0, drawn: 0, lost: 0,
        goals_for: 0, goals_against: 0, goal_difference: 0, points: 0,
        form: '', performance_trend: [], trend_insight: null, updated_at: ''
      }
    }))
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Groups & Bracket</h1>
        <p className="text-gray-500 text-sm mt-1">12 groups · 48 teams · 104 matches</p>
      </div>

      {/* Group Tables */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Group Stage Tables</h2>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {GROUP_IDS.map(g => (
            <GroupTable key={g} groupId={g} rows={getGroupRows(g)} />
          ))}
        </div>
      </section>

      {/* Knockout Bracket */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Knockout Bracket</h2>
        <div className="card-glass rounded-xl overflow-hidden">
          <KnockoutBracket slots={(bracketSlots as BracketSlot[]) ?? []} />
        </div>
      </section>
    </div>
  )
}
