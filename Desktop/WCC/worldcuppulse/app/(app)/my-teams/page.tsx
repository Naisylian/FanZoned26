'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import TeamCard from '@/components/TeamCard'
import type { Team, TeamStats } from '@/lib/types'
import { cn } from '@/lib/utils'
import { flagUrl } from '@/lib/flags'
import { Check, Plus, X } from 'lucide-react'

export default function MyTeamsPage() {
  const [allTeams, setAllTeams] = useState<(Team & { team_stats: TeamStats[] })[]>([])
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set())
  const [primaryId, setPrimaryId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const [{ data: teams }, { data: profile }, { data: ut }] = await Promise.all([
        supabase.from('teams').select('*, team_stats(*)').order('group_id'),
        supabase.from('profiles').select('primary_team_id').eq('id', user.id).single(),
        supabase.from('user_teams').select('team_id').eq('user_id', user.id),
      ])

      setAllTeams(teams ?? [])
      setPrimaryId(profile?.primary_team_id ?? null)
      setFollowedIds(new Set(ut?.map((r: any) => r.team_id) ?? []))
    }
    load()
  }, [])

  const followedTeams = allTeams.filter(t => followedIds.has(t.id))
  const filteredAll = allTeams.filter(t =>
    !followedIds.has(t.id) &&
    (t.name.toLowerCase().includes(search.toLowerCase()) || t.code.toLowerCase().includes(search.toLowerCase()))
  )

  const toggleFollow = async (teamId: string) => {
    if (!userId) return
    if (followedIds.has(teamId)) {
      if (teamId === primaryId) return // can't unfollow primary
      await supabase.from('user_teams').delete().eq('user_id', userId).eq('team_id', teamId)
      setFollowedIds(prev => { const n = new Set(prev); n.delete(teamId); return n })
    } else {
      await supabase.from('user_teams').insert({ user_id: userId, team_id: teamId })
      setFollowedIds(prev => new Set([...prev, teamId]))
    }
  }

  const setPrimary = async (teamId: string) => {
    if (!userId) return
    setSaving(true)
    await supabase.from('profiles').update({ primary_team_id: teamId }).eq('id', userId)
    if (!followedIds.has(teamId)) {
      await supabase.from('user_teams').insert({ user_id: userId, team_id: teamId })
      setFollowedIds(prev => new Set([...prev, teamId]))
    }
    setPrimaryId(teamId)
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Teams</h1>
        <button
          onClick={() => setAdding(!adding)}
          className={cn('flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors',
            adding ? 'bg-white/10 text-gray-300' : 'bg-purple-600 hover:bg-purple-500 text-white'
          )}
        >
          {adding ? <><X size={14} /> Done</> : <><Plus size={14} /> Follow Team</>}
        </button>
      </div>

      {/* Add teams panel */}
      {adding && (
        <div className="card-glass rounded-xl p-4 space-y-3">
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teams to follow..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-purple-500 transition-colors"
          />
          <div className="grid sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto scrollbar-hide">
            {filteredAll.map(team => (
              <button
                key={team.id}
                onClick={() => toggleFollow(team.id)}
                className="card-glass rounded-lg p-2.5 flex items-center gap-2 text-left hover:border-purple-500/40 transition-all"
              >
                <img src={flagUrl(team.code)} alt={team.code} className="w-7 h-5 object-cover rounded-sm flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{team.name}</p>
                  <p className="text-xs text-gray-500">Group {team.group_id}</p>
                </div>
                <Plus size={14} className="text-purple-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Followed teams */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Following ({followedTeams.length})
        </h2>
        {followedTeams.length === 0 && (
          <p className="text-gray-600 text-sm">You&apos;re not following any teams yet.</p>
        )}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {followedTeams.map(team => (
            <div key={team.id} className="relative group">
              <TeamCard team={team} stats={team.team_stats?.[0]} showForm />
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {primaryId !== team.id && (
                  <button
                    onClick={() => setPrimary(team.id)}
                    disabled={saving}
                    className="text-xs bg-yellow-600/80 hover:bg-yellow-500 text-white px-2 py-0.5 rounded-full"
                    title="Set as primary"
                  >
                    ★ Primary
                  </button>
                )}
                {primaryId === team.id && (
                  <span className="text-xs bg-yellow-700/60 text-yellow-300 px-2 py-0.5 rounded-full">⭐ Primary</span>
                )}
                {primaryId !== team.id && (
                  <button
                    onClick={() => toggleFollow(team.id)}
                    className="w-6 h-6 bg-red-900/60 hover:bg-red-700 rounded-full flex items-center justify-center"
                    title="Unfollow"
                  >
                    <X size={10} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
