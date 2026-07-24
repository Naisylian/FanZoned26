'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { flagUrl } from '@/lib/flags'
import type { Team, Prediction } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface Props {
  matchId: string
  homeTeam: Team | null
  awayTeam: Team | null
  existingPrediction: Prediction | null
  userId: string
}

export default function PredictionWidget({ matchId, homeTeam, awayTeam, existingPrediction, userId }: Props) {
  const [selected, setSelected] = useState<string | null>(existingPrediction?.predicted_winner_id ?? null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(!!existingPrediction)
  const supabase = createClient()

  const predict = async (teamId: string) => {
    if (saved) return
    setSelected(teamId)
    setSaving(true)
    await supabase.from('predictions').upsert({
      user_id: userId,
      match_id: matchId,
      predicted_winner_id: teamId,
    })
    setSaving(false)
    setSaved(true)
  }

  return (
    <div className="card-glass rounded-xl p-4">
      <p className="text-sm text-gray-400 text-center mb-3">
        {saved ? '✅ Prediction locked in!' : 'Who will win?'}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {[homeTeam, awayTeam].map((team) => {
          if (!team) return null
          const isSelected = selected === team.id
          return (
            <button
              key={team.id}
              onClick={() => predict(team.id)}
              disabled={saving || saved}
              className={cn(
                'rounded-xl p-4 text-center flex flex-col items-center gap-2 transition-all border',
                isSelected
                  ? 'border-purple-500 bg-purple-900/20'
                  : 'border-white/10 hover:border-white/20 bg-white/5',
                (saving || saved) && 'cursor-default'
              )}
            >
              <img src={flagUrl(team.code)} alt={team.code} className="w-12 h-8 object-cover rounded" />
              <span className="font-semibold text-sm">{team.name}</span>
              {isSelected && <Check size={16} className="text-purple-400" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
