import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: Request) {
  const { team_id } = await request.json()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: stats } = await supabase
    .from('team_stats')
    .select('*, team:teams(*)')
    .eq('team_id', team_id)
    .single()

  if (!stats) return NextResponse.json({ error: 'Team not found' }, { status: 404 })

  const prompt = `You are a football analyst. Based on these stats for ${stats.team.name}, write exactly ONE concise sentence (max 20 words) as a trend insight.

Stats: Played ${stats.played}, Won ${stats.won}, Drawn ${stats.drawn}, Lost ${stats.lost}, Goals For ${stats.goals_for}, Goals Against ${stats.goals_against}, Form: ${stats.form || 'no matches yet'}.

Reply with only the one-sentence insight, no quotes.`

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 64,
    messages: [{ role: 'user', content: prompt }],
  })

  const insight = (message.content[0] as { type: string; text: string }).text.trim()

  await supabase
    .from('team_stats')
    .update({ trend_insight: insight })
    .eq('team_id', team_id)

  return NextResponse.json({ insight })
}
