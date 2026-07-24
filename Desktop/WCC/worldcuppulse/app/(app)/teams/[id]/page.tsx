export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import StatsChart from '@/components/StatsChart'
import ChatRoom from '@/components/ChatRoom'
import MatchCard from '@/components/MatchCard'
import { cn } from '@/lib/utils'
import { flagUrl } from '@/lib/flags'
import type { Match } from '@/lib/types'

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: team }, { data: stats }, { data: matches }, { data: profile }] = await Promise.all([
    supabase.from('teams').select('*').eq('id', id).single(),
    supabase.from('team_stats').select('*').eq('team_id', id).single(),
    supabase
      .from('matches')
      .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)')
      .or(`home_team_id.eq.${id},away_team_id.eq.${id}`)
      .order('match_date', { ascending: false })
      .limit(10),
    supabase.from('profiles').select('*').eq('id', user.id).single(),
  ])

  if (!team) notFound()

  const isEliminated = team.status === 'eliminated'
  const form = stats?.form?.split('') ?? []

  return (
    <div className="space-y-6">
      {/* Team header */}
      <div className={cn('card-glass rounded-2xl p-6', isEliminated && 'opacity-70')}>
        <div className="flex items-center gap-4">
          <img src={flagUrl(team.code)} alt={team.code} className="w-16 h-12 object-cover rounded" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-extrabold">{team.name}</h1>
              {isEliminated && (
                <span className="bg-red-900/40 text-red-400 text-xs px-2 py-1 rounded-full">Eliminated</span>
              )}
            </div>
            <p className="text-gray-500">Group {team.group_id} · {team.code}</p>
          </div>
        </div>

        {/* Stats row */}
        {stats && (
          <div className="grid grid-cols-4 gap-3 mt-6">
            {[
              { label: 'Points', value: stats.points, color: 'text-purple-300' },
              { label: 'Played', value: stats.played },
              { label: 'Won', value: stats.won, color: 'text-green-400' },
              { label: 'GD', value: stats.goal_difference > 0 ? `+${stats.goal_difference}` : stats.goal_difference },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white/5 rounded-xl p-3 text-center">
                <p className={cn('text-2xl font-bold', color ?? 'text-white')}>{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Form */}
        {form.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-2">Last 5 results</p>
            <div className="flex gap-2">
              {form.map((r: string, i: number) => (
                <div
                  key={i}
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white',
                    r === 'W' ? 'bg-green-500' : r === 'D' ? 'bg-yellow-500' : 'bg-red-500'
                  )}
                >
                  {r}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stats Chart */}
      {stats && <StatsChart stats={stats} />}

      {/* Recent Matches */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Recent Matches</h2>
        <div className="space-y-2">
          {(matches as Match[])?.map(m => <MatchCard key={m.id} match={m} />)}
          {(!matches || matches.length === 0) && (
            <p className="text-gray-600 text-sm">No matches yet.</p>
          )}
        </div>
      </section>

      {/* Community Chat */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Community Chat</h2>
        <ChatRoom
          teamId={team.id}
          isEliminated={isEliminated}
          currentUser={profile}
        />
      </section>
    </div>
  )
}
