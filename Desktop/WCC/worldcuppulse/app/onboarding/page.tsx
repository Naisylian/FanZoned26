'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Team } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import { flagUrl } from '@/lib/flags'

export default function OnboardingPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [primaryTeam, setPrimaryTeam] = useState<string | null>(null)
  const [followedTeams, setFollowedTeams] = useState<Set<string>>(new Set())
  const [step, setStep] = useState<'primary' | 'follow'>('primary')
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.from('teams').select('*').order('group_id').then(({ data }) => {
      setTeams(data ?? [])
    })
  }, [])

  const filtered = teams.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.code.toLowerCase().includes(search.toLowerCase()) ||
    t.group_id.toLowerCase().includes(search.toLowerCase())
  )

  const handleContinue = async () => {
    if (!primaryTeam) return
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('profiles').update({ primary_team_id: primaryTeam }).eq('id', user.id)

    const teamIds = [primaryTeam, ...Array.from(followedTeams).filter(id => id !== primaryTeam)]
    if (teamIds.length > 0) {
      await supabase.from('user_teams').upsert(
        teamIds.map(team_id => ({ user_id: user.id, team_id }))
      )
    }

    router.push('/payment')
  }

  const toggleFollow = (id: string) => {
    setFollowedTeams(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="min-h-screen max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <span className="text-4xl">🌍</span>
        <h1 className="text-2xl font-bold mt-2">
          {step === 'primary' ? 'Pick your primary team' : 'Follow more teams'}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {step === 'primary'
            ? 'Choose the team you support most'
            : 'Follow any teams you want to track (optional)'}
        </p>
      </div>

      {/* Progress */}
      <div className="flex gap-2 mb-6">
        {['primary', 'follow'].map((s, i) => (
          <div key={s} className={cn('flex-1 h-1 rounded-full', step === s || (i === 0 && step === 'follow') ? 'bg-purple-500' : 'bg-white/10')} />
        ))}
      </div>

      <input
        value={search} onChange={(e) => setSearch(e.target.value)}
        placeholder="Search teams..."
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500 transition-colors mb-4"
      />

      <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto scrollbar-hide">
        {filtered.map((team) => {
          const isPrimary = primaryTeam === team.id
          const isFollowed = followedTeams.has(team.id)
          const isSelected = step === 'primary' ? isPrimary : isFollowed

          return (
            <button
              key={team.id}
              onClick={() => step === 'primary' ? setPrimaryTeam(team.id) : toggleFollow(team.id)}
              className={cn(
                'card-glass rounded-xl p-3 flex items-center gap-3 text-left transition-all relative',
                isSelected ? 'border-purple-500 bg-purple-900/20' : 'hover:border-white/20'
              )}
            >
              <img src={flagUrl(team.code)} alt={team.code} className="w-8 h-6 object-cover rounded-sm flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">{team.name}</p>
                <p className="text-xs text-gray-500">Group {team.group_id}</p>
              </div>
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                  <Check size={10} />
                </div>
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-6 flex gap-3">
        {step === 'follow' && (
          <button onClick={() => setStep('primary')} className="flex-1 card-glass py-3 rounded-xl font-semibold">
            Back
          </button>
        )}
        <button
          onClick={() => step === 'primary' ? setStep('follow') : handleContinue()}
          disabled={step === 'primary' ? !primaryTeam : loading}
          className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-colors"
        >
          {loading ? 'Saving...' : step === 'primary' ? 'Continue' : 'Continue to Payment →'}
        </button>
      </div>
    </div>
  )
}
