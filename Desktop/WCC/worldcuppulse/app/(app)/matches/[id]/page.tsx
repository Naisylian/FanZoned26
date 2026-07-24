export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import ChatRoom from '@/components/ChatRoom'
import { isChatLocked, stageLabel, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { flagUrl } from '@/lib/flags'
import { isAdmin } from '@/lib/isAdmin'

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = isAdmin(user.email)

  const [{ data: match }, { data: profile }, { data: predictions }] = await Promise.all([
    supabase
      .from('matches')
      .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)')
      .eq('id', id)
      .single(),
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('predictions')
      .select('*, predicted_winner:teams(*)')
      .eq('match_id', id),
  ])

  if (!match) notFound()

  const chatLocked = isChatLocked(match)
  const userPrediction = predictions?.find((p: any) => p.user_id === user.id)

  const totalPredictions = predictions?.length ?? 0
  const homePredictions = predictions?.filter((p: any) => p.predicted_winner_id === match.home_team_id).length ?? 0
  const awayPredictions = predictions?.filter((p: any) => p.predicted_winner_id === match.away_team_id).length ?? 0
  const homePct = totalPredictions > 0 ? Math.round((homePredictions / totalPredictions) * 100) : 50
  const awayPct = totalPredictions > 0 ? Math.round((awayPredictions / totalPredictions) * 100) : 50

  type MatchStatus = 'live' | 'finished' | 'scheduled'
  const statusColorMap: Record<MatchStatus, string> = { live: 'bg-red-500 animate-pulse', finished: 'bg-gray-600', scheduled: 'bg-blue-600' }
  const statusLabelMap: Record<MatchStatus, string> = { live: '● LIVE', finished: 'Full Time', scheduled: formatDate(match.match_date) }
  const statusColor = statusColorMap[match.status as MatchStatus] ?? 'bg-gray-600'
  const statusLabel = statusLabelMap[match.status as MatchStatus] ?? match.status

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Match header */}
      <div className="card-glass rounded-2xl p-6 text-center">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">{stageLabel(match.stage)}{match.group_id ? ` · Group ${match.group_id}` : ''}</span>
          <span className={cn('text-xs px-3 py-1 rounded-full text-white', statusColor)}>{statusLabel}</span>
        </div>

        <div className="flex items-center justify-between gap-4 mt-4">
          <div className="flex-1 text-center">
            <img src={flagUrl(match.home_team?.code)} alt={match.home_team?.code} className="w-16 h-12 object-cover rounded mx-auto mb-2" />
            <p className="font-bold">{match.home_team?.name}</p>
          </div>

          <div className="text-center">
            {match.status !== 'scheduled' ? (
              <p className="text-5xl font-extrabold">{match.home_score} — {match.away_score}</p>
            ) : (
              <p className="text-2xl font-bold text-gray-600">vs</p>
            )}
          </div>

          <div className="flex-1 text-center">
            <img src={flagUrl(match.away_team?.code)} alt={match.away_team?.code} className="w-16 h-12 object-cover rounded mx-auto mb-2" />
            <p className="font-bold">{match.away_team?.name}</p>
          </div>
        </div>

        {match.venue && <p className="text-sm text-gray-500 mt-3">📍 {match.venue}</p>}
      </div>

      {/* Fan vote breakdown */}
      {totalPredictions > 0 && (
        <div className="card-glass rounded-xl p-4">
          <p className="text-sm text-gray-500 mb-3 text-center">Fan predictions ({totalPredictions} votes)</p>
          <div className="flex rounded-full overflow-hidden h-4 mb-2">
            <div className="bg-blue-600 transition-all" style={{ width: `${homePct}%` }} />
            <div className="bg-red-600 transition-all" style={{ width: `${awayPct}%` }} />
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1"><img src={flagUrl(match.home_team?.code)} alt={match.home_team?.code} className="w-5 h-3.5 object-cover rounded-sm" /> {homePct}%</span>
            <span className="flex items-center gap-1">{awayPct}% <img src={flagUrl(match.away_team?.code)} alt={match.away_team?.code} className="w-5 h-3.5 object-cover rounded-sm" /></span>
          </div>
        </div>
      )}

      {/* Prediction widget */}
      {profile?.has_paid && match.status === 'scheduled' && (
        <PredictionWidget
          matchId={match.id}
          homeTeam={match.home_team}
          awayTeam={match.away_team}
          existingPrediction={userPrediction}
          userId={user.id}
        />
      )}

      {/* Live Chat */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Match Chat</h2>
        <ChatRoom
          matchId={match.id}
          isLocked={chatLocked}
          currentUser={admin ? { ...profile, has_paid: true } as any : profile}
        />
      </section>
    </div>
  )
}

// Client component for prediction
import PredictionWidget from './PredictionWidget'
