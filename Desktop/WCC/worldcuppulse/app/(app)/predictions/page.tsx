export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MatchCard from '@/components/MatchCard'
import type { Match } from '@/lib/types'
import { hasAccess } from '@/lib/isAdmin'

export default async function PredictionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!hasAccess(profile, user.email)) redirect('/payment')

  const [{ data: upcoming }, { data: live }, { data: finished }, { data: userPredictions }] = await Promise.all([
    supabase
      .from('matches')
      .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)')
      .eq('status', 'scheduled')
      .order('match_date', { ascending: true })
      .limit(20),
    supabase
      .from('matches')
      .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)')
      .eq('status', 'live'),
    supabase
      .from('matches')
      .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)')
      .eq('status', 'finished')
      .order('match_date', { ascending: false })
      .limit(10),
    supabase.from('predictions').select('*').eq('user_id', user.id),
  ])

  const predictedMatchIds = new Set(userPredictions?.map((p: any) => p.match_id) ?? [])

  const renderSection = (title: string, matches: Match[] | null) => {
    if (!matches || matches.length === 0) return null
    return (
      <section>
        <h2 className="text-lg font-semibold mb-3">{title}</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {matches.map(m => (
            <div key={m.id} className="relative">
              <MatchCard match={m} />
              {predictedMatchIds.has(m.id) && (
                <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                  ✓ Predicted
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Match Predictions</h1>
        <p className="text-gray-500 text-sm mt-1">Pick match winners before kickoff to earn points</p>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Predicted', value: userPredictions?.length ?? 0 },
          { label: 'Correct', value: userPredictions?.filter((p: any) => p.is_correct === true).length ?? 0, color: 'text-green-400' },
          { label: 'Points', value: userPredictions?.reduce((sum: number, p: any) => sum + (p.points_earned ?? 0), 0) ?? 0, color: 'text-purple-300' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card-glass rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${color ?? 'text-white'}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {live && live.length > 0 && renderSection('🔴 Live Now', live as Match[])}
      {renderSection('⏰ Upcoming — Make Your Prediction', upcoming as Match[])}
      {renderSection('✅ Finished', finished as Match[])}
    </div>
  )
}
