export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Trophy, Medal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { hasAccess } from '@/lib/isAdmin'

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!hasAccess(profile, user.email)) redirect('/payment')

  const { data: entries } = await supabase
    .from('leaderboard')
    .select('*, profiles(username, avatar_url)')
    .order('total_points', { ascending: false })
    .limit(50)

  const userEntry = entries?.find((e: any) => e.user_id === user.id)
  const userRank = (entries?.findIndex((e: any) => e.user_id === user.id) ?? -1) + 1

  const rankIcon = (i: number) => {
    if (i === 0) return '🥇'
    if (i === 1) return '🥈'
    if (i === 2) return '🥉'
    return i + 1
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Trophy className="text-yellow-400" size={28} />
        <div>
          <h1 className="text-2xl font-bold">Leaderboard</h1>
          <p className="text-gray-500 text-sm">Top prediction scorers</p>
        </div>
      </div>

      {/* User's rank */}
      {userEntry && (
        <div className="card-glass rounded-xl p-4 border-purple-500/40">
          <p className="text-xs text-gray-500 mb-1">Your rank</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-purple-300">#{userRank}</span>
              <div>
                <p className="font-semibold">{(userEntry as any).profiles?.username ?? 'You'}</p>
                <p className="text-xs text-gray-500">{(userEntry as any).correct_predictions}/{(userEntry as any).total_predictions} correct</p>
              </div>
            </div>
            <p className="text-xl font-bold text-purple-300">{(userEntry as any).total_points} pts</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card-glass rounded-xl overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_auto_auto] text-xs text-gray-500 px-4 py-2 border-b border-white/5 gap-3">
          <span>Rank</span><span>Player</span><span className="text-right">Correct</span><span className="text-right">Points</span>
        </div>
        {entries?.map((entry: any, i: number) => (
          <div
            key={entry.id}
            className={cn(
              'grid grid-cols-[auto_1fr_auto_auto] items-center px-4 py-3 border-b border-white/5 last:border-0 gap-3',
              entry.user_id === user.id && 'bg-purple-900/20'
            )}
          >
            <span className={cn('font-bold text-sm w-8', i < 3 ? 'text-xl' : 'text-gray-400')}>
              {rankIcon(i)}
            </span>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-purple-800 flex items-center justify-center text-xs font-bold shrink-0">
                {(entry.profiles?.username?.[0] ?? '?').toUpperCase()}
              </div>
              <span className="text-sm font-medium truncate">
                {entry.profiles?.username ?? 'Anonymous'}
                {entry.user_id === user.id && <span className="text-purple-400 ml-1">(you)</span>}
              </span>
            </div>
            <span className="text-sm text-gray-400 text-right">{entry.correct_predictions}/{entry.total_predictions}</span>
            <span className="text-sm font-bold text-purple-300 text-right">{entry.total_points}</span>
          </div>
        ))}
        {(!entries || entries.length === 0) && (
          <p className="text-gray-600 text-sm text-center py-8">No entries yet. Be the first to predict!</p>
        )}
      </div>
    </div>
  )
}
