export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MatchCard from '@/components/MatchCard'
import TeamCard from '@/components/TeamCard'
import Link from 'next/link'
import type { Match, Team, TeamStats } from '@/lib/types'
import { flagUrl } from '@/lib/flags'
import { hasAccess } from '@/lib/isAdmin'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, primary_team:teams(*)')
    .eq('id', user.id)
    .single()

  if (!hasAccess(profile, user.email)) redirect('/payment')

  // Live/upcoming matches
  const { data: matches } = await supabase
    .from('matches')
    .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)')
    .in('status', ['live', 'scheduled'])
    .order('match_date', { ascending: true })
    .limit(6)

  // Top 3 teams by points
  const { data: topStats } = await supabase
    .from('team_stats')
    .select('*, team:teams(*)')
    .order('points', { ascending: false })
    .order('goal_difference', { ascending: false })
    .limit(3)

  // User's followed teams
  const { data: userTeams } = await supabase
    .from('user_teams')
    .select('team:teams(*, team_stats(*))')
    .eq('user_id', user.id)
    .limit(6)

  const followedTeams = userTeams?.map((ut: any) => ut.team) ?? []

  const podiumColors = ['text-yellow-400', 'text-gray-300', 'text-amber-600']
  const podiumEmojis = ['🥇', '🥈', '🥉']

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {profile?.username ?? 'fan'} 👋</h1>
          <p className="text-gray-500 text-sm mt-0.5">FIFA World Cup 2026</p>
        </div>
        {profile?.primary_team && (
          <Link
            href={`/teams/${(profile.primary_team as Team).id}`}
            className="card-glass rounded-xl px-4 py-2.5 flex items-center gap-2 hover:border-purple-500/40 transition-all"
          >
            <img src={flagUrl((profile.primary_team as Team).code)} alt={(profile.primary_team as Team).code} className="w-8 h-6 object-cover rounded-sm" />
            <div>
              <p className="text-xs text-gray-500">Your team</p>
              <p className="text-sm font-semibold">{(profile.primary_team as Team).name}</p>
            </div>
          </Link>
        )}
      </div>

      {/* Top 3 Podium */}
      {topStats && topStats.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">🏆 Top Performing Teams</h2>
          <div className="grid grid-cols-3 gap-3">
            {topStats.map((s: any, i: number) => (
              <Link
                key={s.id}
                href={`/teams/${s.team?.id}`}
                className="card-glass rounded-xl p-4 text-center hover:border-purple-500/40 transition-all"
              >
                <div className="text-2xl mb-1">{podiumEmojis[i]}</div>
                <img src={flagUrl(s.team?.code)} alt={s.team?.code} className="w-10 h-7 object-cover rounded mx-auto mb-1" />
                <p className="font-semibold text-sm">{s.team?.name}</p>
                <p className={`text-lg font-bold mt-1 ${podiumColors[i]}`}>{s.points} pts</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Live & Upcoming Matches */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">⚽ Live & Upcoming Matches</h2>
          <Link href="/predictions" className="text-sm text-purple-400 hover:text-purple-300">View all →</Link>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {(matches as Match[])?.map(m => <MatchCard key={m.id} match={m} />)}
          {(!matches || matches.length === 0) && (
            <p className="text-gray-500 text-sm">No matches scheduled right now.</p>
          )}
        </div>
      </section>

      {/* My Teams */}
      {followedTeams.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">⭐ My Teams</h2>
            <Link href="/my-teams" className="text-sm text-purple-400 hover:text-purple-300">Manage →</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {followedTeams.map((team: any) => (
              <TeamCard
                key={team.id}
                team={team}
                stats={team.team_stats?.[0]}
                showForm
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
