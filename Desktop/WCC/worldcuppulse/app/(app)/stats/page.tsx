export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import StatsChart from '@/components/StatsChart'
import type { Team, TeamStats } from '@/lib/types'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { flagUrl } from '@/lib/flags'
import { hasAccess } from '@/lib/isAdmin'

export default async function StatsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!hasAccess(profile, user.email)) redirect('/payment')

  const { data: statsWithTeams } = await supabase
    .from('team_stats')
    .select('*, team:teams(*)')
    .order('points', { ascending: false })

  const allStats = (statsWithTeams ?? []) as (TeamStats & { team: Team })[]

  // Most improved: highest point gain across last 2 trend entries
  const mostImproved = allStats
    .filter(s => s.performance_trend?.length >= 2)
    .map(s => {
      const trend = s.performance_trend
      const last = trend[trend.length - 1]?.points ?? 0
      const prev = trend[trend.length - 2]?.points ?? 0
      return { ...s, improvement: last - prev }
    })
    .sort((a, b) => b.improvement - a.improvement)[0]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Stats Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Performance trends and insights for all 48 teams</p>
      </div>

      {/* Most improved spotlight */}
      {mostImproved && (
        <section>
          <h2 className="text-lg font-semibold mb-3">🚀 Most Improved Team</h2>
          <Link
            href={`/teams/${mostImproved.team?.id}`}
            className="card-glass rounded-xl p-5 flex items-center gap-4 hover:border-purple-500/40 transition-all block"
          >
            <img src={flagUrl(mostImproved.team?.code)} alt={mostImproved.team?.code} className="w-14 h-10 object-cover rounded" />
            <div className="flex-1">
              <h3 className="text-xl font-bold">{mostImproved.team?.name}</h3>
              <p className="text-sm text-gray-500">Group {mostImproved.team?.group_id}</p>
              {mostImproved.trend_insight && (
                <p className="text-sm text-purple-300 mt-1 italic">💡 {mostImproved.trend_insight}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-400">+{(mostImproved as any).improvement}</p>
              <p className="text-xs text-gray-500">pts gained</p>
            </div>
          </Link>
        </section>
      )}

      {/* All teams performance */}
      <section>
        <h2 className="text-lg font-semibold mb-4">All Teams Performance</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {allStats.filter(s => s.performance_trend?.length > 0).map(s => (
            <div key={s.id}>
              <Link href={`/teams/${s.team?.id}`} className="flex items-center gap-2 mb-2 hover:text-purple-300 transition-colors">
                <img src={flagUrl(s.team?.code)} alt={s.team?.code} className="w-6 h-4 object-cover rounded-sm" />
                <span className="font-semibold text-sm">{s.team?.name}</span>
                <span className="text-xs text-gray-500 ml-auto">{s.points} pts</span>
              </Link>
              <StatsChart stats={s} />
            </div>
          ))}
        </div>
        {allStats.filter(s => s.performance_trend?.length > 0).length === 0 && (
          <div className="card-glass rounded-xl p-8 text-center text-gray-500">
            <p className="text-4xl mb-3">📊</p>
            <p>Stats will appear here as the tournament progresses.</p>
          </div>
        )}
      </section>
    </div>
  )
}
