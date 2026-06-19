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

/**
 * Recalculates team_stats for a given team from all finished matches.
 * Computes from scratch so it stays accurate regardless of edit order.
 */
async function recalcTeamStats(
  admin: ReturnType<typeof createAdminClient>,
  teamId: string
) {
  const { data: matches } = await admin
    .from('matches')
    .select('home_team_id, away_team_id, home_score, away_score, match_date')
    .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
    .eq('status', 'finished')
    .order('match_date', { ascending: true })

  let played = 0, won = 0, drawn = 0, lost = 0, goals_for = 0, goals_against = 0
  const formChars: string[] = []
  const trend: { round: string; points: number }[] = []

  for (const m of matches ?? []) {
    if (m.home_score === null || m.away_score === null) continue
    const isHome = m.home_team_id === teamId
    const gf = isHome ? m.home_score : m.away_score
    const ga = isHome ? m.away_score : m.home_score
    goals_for += gf
    goals_against += ga
    played++

    if (gf > ga) {
      won++; formChars.push('W')
      trend.push({ round: `M${played}`, points: 3 })
    } else if (gf === ga) {
      drawn++; formChars.push('D')
      trend.push({ round: `M${played}`, points: 1 })
    } else {
      lost++; formChars.push('L')
      trend.push({ round: `M${played}`, points: 0 })
    }
  }

  const form = formChars.slice(-5).join('')

  await admin
    .from('team_stats')
    .update({ played, won, drawn, lost, goals_for, goals_against, form, performance_trend: trend })
    .eq('team_id', teamId)
}

/**
 * Resolves predictions for a finished match and updates leaderboard.
 */
async function resolveMatchPredictions(
  admin: ReturnType<typeof createAdminClient>,
  matchId: string,
  homeTeamId: string,
  awayTeamId: string,
  homeScore: number,
  awayScore: number,
) {
  const winnerId = homeScore > awayScore ? homeTeamId
                 : awayScore > homeScore ? awayTeamId
                 : null // draw

  const { data: predictions } = await admin
    .from('predictions')
    .select('id, user_id, predicted_winner_id')
    .eq('match_id', matchId)

  for (const pred of predictions ?? []) {
    const isCorrect = winnerId === null
      ? pred.predicted_winner_id === null
      : pred.predicted_winner_id === winnerId

    await admin
      .from('predictions')
      .update({ is_correct: isCorrect, points_earned: isCorrect ? 10 : 0 })
      .eq('id', pred.id)

    // Recalculate leaderboard for this user
    const { data: allPreds } = await admin
      .from('predictions')
      .select('is_correct, points_earned')
      .eq('user_id', pred.user_id)

    const total_points = (allPreds ?? []).reduce((s, p) => s + (p.points_earned ?? 0), 0)
    const correct_predictions = (allPreds ?? []).filter(p => p.is_correct === true).length
    const total_predictions = (allPreds ?? []).length

    await admin
      .from('leaderboard')
      .update({ total_points, correct_predictions, total_predictions })
      .eq('user_id', pred.user_id)
  }
}

// ── PATCH /api/admin/match ─────────────────────────────────────────────────
// Body: { matchId, status?, homeScore?, awayScore?, homeTeamId?, awayTeamId?, note? }
export async function PATCH(request: Request) {
  try {
    // Auth check
    const userSupabase = await createClient()
    const { data: { user } } = await userSupabase.auth.getUser()
    if (!user || !isAdmin(user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { matchId, status, homeScore, awayScore, homeTeamId, awayTeamId, note, matchDate } = body
    if (!matchId) return NextResponse.json({ error: 'matchId required' }, { status: 400 })

    const admin = createAdminClient()

    // Fetch current match
    const { data: current } = await admin
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single()

    if (!current) return NextResponse.json({ error: 'Match not found' }, { status: 404 })

    // Build update payload
    const updates: Record<string, unknown> = {}
    if (status !== undefined)      updates.status        = status
    if (homeScore !== undefined)   updates.home_score     = homeScore === '' ? null : Number(homeScore)
    if (awayScore !== undefined)   updates.away_score     = awayScore === '' ? null : Number(awayScore)
    if (homeTeamId !== undefined)  updates.home_team_id   = homeTeamId || null
    if (awayTeamId !== undefined)  updates.away_team_id   = awayTeamId || null
    if (note !== undefined)        updates.note           = note
    if (matchDate !== undefined)   updates.match_date     = matchDate

    const { error: updateError } = await admin
      .from('matches')
      .update(updates)
      .eq('id', matchId)

    if (updateError) throw updateError

    // Resolve final state
    const finalStatus     = (status   ?? current.status)     as string
    const finalHomeScore  = homeScore !== undefined ? Number(homeScore) : current.home_score
    const finalAwayScore  = awayScore !== undefined ? Number(awayScore) : current.away_score
    const hid             = homeTeamId !== undefined ? (homeTeamId || null) : current.home_team_id
    const aid             = awayTeamId !== undefined ? (awayTeamId || null) : current.away_team_id

    // Auto-update team stats + resolve predictions when match is finished
    if (finalStatus === 'finished' && hid && aid &&
        finalHomeScore !== null && finalAwayScore !== null) {
      await Promise.all([
        recalcTeamStats(admin, hid),
        recalcTeamStats(admin, aid),
        resolveMatchPredictions(admin, matchId, hid, aid, finalHomeScore, finalAwayScore),
      ])
    }

    // If reverting away from finished, recalculate stats to remove the old result
    if (finalStatus !== 'finished' && current.status === 'finished') {
      const promises = []
      if (hid) promises.push(recalcTeamStats(admin, hid))
      if (aid) promises.push(recalcTeamStats(admin, aid))
      await Promise.all(promises)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[admin/match PATCH]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
