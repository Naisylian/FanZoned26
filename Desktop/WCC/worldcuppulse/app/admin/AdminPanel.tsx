'use client'

import { useState, useMemo, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { flagUrl } from '@/lib/flags'
import { cn } from '@/lib/utils'
import type { Match, Team } from '@/lib/types'
import {
  CheckCircle2, Clock, Zap, Edit3, X, Save, ChevronDown,
  Users, Calendar, Search, RefreshCw,
} from 'lucide-react'

type AdminMatch = Match & { note?: string }

type Stage = 'all' | 'group' | 'r32' | 'r16' | 'qf' | 'sf' | 'final'

const STAGE_LABELS: Record<string, string> = {
  group: 'Group', r32: 'R32', r16: 'R16', qf: 'QF', sf: 'SF', final: 'Final',
}

const STAGE_OPTIONS: { key: Stage; label: string }[] = [
  { key: 'all',   label: 'All' },
  { key: 'group', label: 'Group Stage' },
  { key: 'r32',   label: 'Round of 32' },
  { key: 'r16',   label: 'Round of 16' },
  { key: 'qf',    label: 'Quarterfinals' },
  { key: 'sf',    label: 'Semifinals' },
  { key: 'final', label: 'Final' },
]

const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Scheduled', icon: Clock,        color: 'text-blue-400' },
  { value: 'live',      label: 'Live',      icon: Zap,          color: 'text-red-400' },
  { value: 'finished',  label: 'Full Time', icon: CheckCircle2, color: 'text-gray-400' },
]

/** Format a UTC date to multiple timezones. CT is the primary display zone. */
function matchTimes(utc: string) {
  const d = new Date(utc)
  const fmt = (tz: string) => d.toLocaleString('en-US', {
    timeZone: tz, month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  })
  return {
    et:   fmt('America/New_York'),
    ct:   fmt('America/Chicago'),   // PRIMARY
    mt:   fmt('America/Denver'),
    pt:   fmt('America/Los_Angeles'),
    // date and time columns use CT as default
    date: d.toLocaleDateString('en-US', { timeZone: 'America/Chicago', month: 'short', day: 'numeric' }),
    time: d.toLocaleTimeString('en-US', { timeZone: 'America/Chicago', hour: 'numeric', minute: '2-digit', hour12: true }),
  }
}

function StatusBadge({ status }: { status: string }) {
  const map = {
    scheduled: 'bg-blue-900/40 text-blue-300 border-blue-700/40',
    live:      'bg-red-900/40 text-red-300 border-red-700/40 animate-pulse',
    finished:  'bg-gray-800 text-gray-400 border-gray-700',
  }[status] ?? 'bg-gray-800 text-gray-400'
  return (
    <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium', map)}>
      {status === 'live' ? '🔴 LIVE' : status === 'finished' ? 'FT' : 'Scheduled'}
    </span>
  )
}

// ── Edit Row (inline form per match) ──────────────────────────────────────────
/** Convert UTC ISO string → "YYYY-MM-DDTHH:mm" in Central Time (for datetime-local input) */
function utcToCtInput(utcStr: string): string {
  return new Date(utcStr)
    .toLocaleString('sv-SE', { timeZone: 'America/Chicago' })
    .slice(0, 16)
    .replace(' ', 'T')
}

/** Convert CT "YYYY-MM-DDTHH:mm" → UTC ISO string (WC2026 runs in CDT = UTC−5) */
function ctInputToUtc(ctStr: string): string {
  return new Date(ctStr + ':00-05:00').toISOString()
}

function EditRow({
  match, teams, onSave, onCancel,
}: {
  match: AdminMatch
  teams: Team[]
  onSave: (updates: Partial<AdminMatch & { match_date: string }>) => Promise<void>
  onCancel: () => void
}) {
  const [homeScore, setHomeScore] = useState<string>(
    match.home_score !== null ? String(match.home_score) : ''
  )
  const [awayScore, setAwayScore] = useState<string>(
    match.away_score !== null ? String(match.away_score) : ''
  )
  const [status, setStatus]       = useState(match.status)
  const [homeTeamId, setHomeTeamId] = useState(match.home_team_id ?? '')
  const [awayTeamId, setAwayTeamId] = useState(match.away_team_id ?? '')
  const [matchDate, setMatchDate]   = useState(utcToCtInput(match.match_date))
  const [saving, setSaving]         = useState(false)

  const isKnockout = !match.home_team_id || !match.away_team_id

  async function handleSave() {
    setSaving(true)
    await onSave({
      status,
      home_score:   homeScore === '' ? null : Number(homeScore),
      away_score:   awayScore === '' ? null : Number(awayScore),
      home_team_id: homeTeamId || null,
      away_team_id: awayTeamId || null,
      match_date:   ctInputToUtc(matchDate),
    } as Partial<AdminMatch & { match_date: string }>)
    setSaving(false)
  }

  return (
    <div className="border border-yellow-500/30 rounded-xl bg-gray-900/80 p-4 space-y-4">
      {/* Status selector */}
      <div className="flex gap-2 flex-wrap">
        <span className="text-xs text-gray-500 self-center w-16">Status</span>
        {STATUS_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setStatus(opt.value as Match['status'])}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
              status === opt.value
                ? 'bg-yellow-500/20 border-yellow-500/60 text-yellow-300'
                : 'border-gray-700 text-gray-400 hover:border-gray-500'
            )}
          >
            <opt.icon size={12} /> {opt.label}
          </button>
        ))}
      </div>

      {/* Kick-off time (CT) */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500 w-16">Kick-off</span>
        <div className="flex items-center gap-2">
          <input
            type="datetime-local"
            value={matchDate}
            onChange={e => setMatchDate(e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:border-yellow-500 outline-none"
          />
          <span className="text-xs text-purple-400 font-semibold">CT</span>
          <span className="text-xs text-gray-600">(Central Time)</span>
        </div>
      </div>

      {/* Team assignment (for knockout/TBD matches) */}
      {isKnockout && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Home Team</label>
            <select
              value={homeTeamId}
              onChange={e => setHomeTeamId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value="">— TBD —</option>
              {teams.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Away Team</label>
            <select
              value={awayTeamId}
              onChange={e => setAwayTeamId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value="">— TBD —</option>
              {teams.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Score input */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500 w-16">Score</span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            {(match.home_team ?? teams.find(t => t.id === homeTeamId)) && (
              <img
                src={flagUrl((match.home_team ?? teams.find(t => t.id === homeTeamId))?.code)}
                alt=""
                className="w-6 h-4 object-cover rounded-sm"
              />
            )}
            <span className="text-sm text-gray-300 truncate max-w-[100px]">
              {match.home_team?.name ?? teams.find(t => t.id === homeTeamId)?.name ?? 'Home'}
            </span>
          </div>
          <input
            type="number"
            min="0"
            max="20"
            value={homeScore}
            onChange={e => setHomeScore(e.target.value)}
            placeholder="–"
            className="w-14 text-center bg-gray-800 border border-gray-600 rounded-lg py-2 text-lg font-bold text-white focus:border-yellow-500 outline-none"
          />
          <span className="text-gray-600 font-bold">:</span>
          <input
            type="number"
            min="0"
            max="20"
            value={awayScore}
            onChange={e => setAwayScore(e.target.value)}
            placeholder="–"
            className="w-14 text-center bg-gray-800 border border-gray-600 rounded-lg py-2 text-lg font-bold text-white focus:border-yellow-500 outline-none"
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-300 truncate max-w-[100px]">
              {match.away_team?.name ?? teams.find(t => t.id === awayTeamId)?.name ?? 'Away'}
            </span>
            {(match.away_team ?? teams.find(t => t.id === awayTeamId)) && (
              <img
                src={flagUrl((match.away_team ?? teams.find(t => t.id === awayTeamId))?.code)}
                alt=""
                className="w-6 h-4 object-cover rounded-sm"
              />
            )}
          </div>
        </div>
      </div>

      {/* Quick-fill buttons */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span>Quick:</span>
        {[['0','0'],['1','0'],['2','0'],['2','1'],['1','1'],['3','0'],['3','1'],['3','2']].map(([h,a]) => (
          <button
            key={`${h}-${a}`}
            onClick={() => { setHomeScore(h); setAwayScore(a) }}
            className="px-2 py-0.5 rounded bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300"
          >
            {h}–{a}
          </button>
        ))}
      </div>

      {/* Save / Cancel */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? 'Saving…' : 'Save & Update Stats'}
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors border border-gray-700"
        >
          <X size={14} /> Cancel
        </button>
      </div>
    </div>
  )
}

// ── Match Row ────────────────────────────────────────────────────────────────
function MatchRow({
  match, teams, onUpdate,
}: {
  match: AdminMatch
  teams: Team[]
  onUpdate: (id: string, updates: Partial<AdminMatch>) => void
}) {
  const [editing, setEditing] = useState(false)
  const [pending, startTransition] = useTransition()
  const t = matchTimes(match.match_date)

  async function save(updates: Partial<AdminMatch & { match_date: string }>) {
    const res = await fetch('/api/admin/match', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        matchId:     match.id,
        status:      updates.status,
        homeScore:   updates.home_score,
        awayScore:   updates.away_score,
        homeTeamId:  updates.home_team_id,
        awayTeamId:  updates.away_team_id,
        matchDate:   updates.match_date,
      }),
    })
    if (!res.ok) {
      const err = await res.json()
      alert(`Error: ${err.error}`)
      return
    }
    onUpdate(match.id, updates)
    setEditing(false)
    startTransition(() => {})
  }

  const homeTeam = match.home_team as Team | undefined
  const awayTeam = match.away_team as Team | undefined
  const isTBD = !homeTeam && !awayTeam

  return (
    <div className="space-y-1">
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-xl border transition-all cursor-pointer group',
          editing
            ? 'border-yellow-500/40 bg-gray-900/60'
            : 'border-white/5 bg-gray-900/30 hover:border-white/10 hover:bg-gray-900/50'
        )}
        onClick={() => !editing && setEditing(true)}
      >
        {/* Time */}
        <div className="w-28 flex-shrink-0">
          <div className="text-xs font-medium text-gray-300">{t.date}</div>
          <div className="text-xs text-gray-500">{t.time} <span className="text-purple-400 font-semibold">CT</span></div>
        </div>

        {/* Stage badge */}
        <div className="w-14 flex-shrink-0">
          <span className="text-xs px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
            {STAGE_LABELS[match.stage] ?? match.stage}
            {match.group_id ? ` ${match.group_id}` : ''}
          </span>
        </div>

        {/* Teams + Score */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          {/* Home */}
          <div className="flex items-center gap-1.5 flex-1 justify-end min-w-0">
            <span className="text-sm font-medium truncate text-right">
              {homeTeam?.name ?? (match.note ? match.note.split(' vs ')[0] : 'TBD')}
            </span>
            {homeTeam && <img src={flagUrl(homeTeam.code)} alt="" className="w-7 h-5 object-cover rounded-sm flex-shrink-0" />}
          </div>

          {/* Score */}
          <div className="flex-shrink-0 w-16 text-center">
            {match.status !== 'scheduled' ? (
              <span className="text-lg font-bold tabular-nums">
                {match.home_score ?? '?'} — {match.away_score ?? '?'}
              </span>
            ) : (
              <span className="text-gray-600 text-sm">vs</span>
            )}
          </div>

          {/* Away */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            {awayTeam && <img src={flagUrl(awayTeam.code)} alt="" className="w-7 h-5 object-cover rounded-sm flex-shrink-0" />}
            <span className="text-sm font-medium truncate">
              {awayTeam?.name ?? (match.note ? match.note.split(' vs ')[1] : 'TBD')}
            </span>
          </div>
        </div>

        {/* Venue */}
        <div className="hidden lg:block w-28 text-right flex-shrink-0">
          <span className="text-xs text-gray-600 truncate">{match.venue}</span>
        </div>

        {/* Status */}
        <div className="flex-shrink-0">
          <StatusBadge status={match.status} />
        </div>

        {/* Edit hint */}
        <Edit3 size={14} className="text-gray-600 flex-shrink-0 group-hover:text-gray-400 transition-colors" />
      </div>

      {/* Inline edit form */}
      {editing && (
        <EditRow
          match={match}
          teams={teams}
          onSave={save}
          onCancel={() => setEditing(false)}
        />
      )}
    </div>
  )
}

// ── Teams Tab ────────────────────────────────────────────────────────────────
function TeamsTab({ teams: initialTeams }: { teams: Team[] }) {
  const [teams, setTeams] = useState(initialTeams)
  const [saving, setSaving] = useState<string | null>(null)

  async function toggleEliminated(team: Team) {
    setSaving(team.id)
    const newStatus = team.status === 'active' ? 'eliminated' : 'active'
    const res = await fetch('/api/admin/team', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId: team.id, status: newStatus }),
    })
    if (res.ok) {
      setTeams(prev => prev.map(t => t.id === team.id ? { ...t, status: newStatus as Team['status'] } : t))
    }
    setSaving(null)
  }

  const groups = ['A','B','C','D','E','F','G','H','I','J','K','L']

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {groups.map(g => {
        const groupTeams = teams.filter(t => t.group_id === g)
        return (
          <div key={g} className="bg-gray-900/40 border border-white/5 rounded-xl p-3">
            <div className="text-xs font-bold text-gray-400 mb-2 px-1">GROUP {g}</div>
            <div className="space-y-1">
              {groupTeams.map(team => (
                <div
                  key={team.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-800/50 transition-colors"
                >
                  <img src={flagUrl(team.code)} alt="" className="w-6 h-4 object-cover rounded-sm" />
                  <span className={cn('text-sm flex-1 truncate', team.status === 'eliminated' && 'line-through text-gray-600')}>
                    {team.name}
                  </span>
                  <button
                    onClick={() => toggleEliminated(team)}
                    disabled={saving === team.id}
                    className={cn(
                      'text-xs px-2 py-0.5 rounded border font-medium transition-all',
                      team.status === 'active'
                        ? 'border-green-700/60 text-green-400 hover:bg-green-900/20'
                        : 'border-red-700/60 text-red-400 hover:bg-red-900/20'
                    )}
                  >
                    {saving === team.id ? '…' : team.status === 'active' ? 'Active' : 'Elim.'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Main AdminPanel component ────────────────────────────────────────────────
export default function AdminPanel({
  initialMatches,
  teams,
}: {
  initialMatches: AdminMatch[]
  teams: Team[]
}) {
  const router = useRouter()
  const [matches, setMatches] = useState(initialMatches)
  const [stageFilter, setStageFilter] = useState<Stage>('group')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'matches' | 'teams'>('matches')

  function updateMatch(id: string, updates: Partial<AdminMatch>) {
    setMatches(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m))
  }

  const filtered = useMemo(() => {
    return matches.filter(m => {
      if (stageFilter !== 'all' && m.stage !== stageFilter) return false
      if (statusFilter !== 'all' && m.status !== statusFilter) return false
      if (search) {
        const q = search.toLowerCase()
        const hn = (m.home_team as Team | undefined)?.name?.toLowerCase() ?? ''
        const an = (m.away_team as Team | undefined)?.name?.toLowerCase() ?? ''
        const note = (m.note ?? '').toLowerCase()
        const venue = (m.venue ?? '').toLowerCase()
        if (!hn.includes(q) && !an.includes(q) && !note.includes(q) && !venue.includes(q)) return false
      }
      return true
    })
  }, [matches, stageFilter, statusFilter, search])

  // Stats summary
  const live      = matches.filter(m => m.status === 'live').length
  const finished  = matches.filter(m => m.status === 'finished').length
  const scheduled = matches.filter(m => m.status === 'scheduled').length

  return (
    <div className="space-y-6">
      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Scheduled', count: scheduled, color: 'text-blue-400',  bg: 'bg-blue-900/20 border-blue-800/40' },
          { label: 'Live Now',  count: live,      color: 'text-red-400',   bg: 'bg-red-900/20 border-red-800/40' },
          { label: 'Finished',  count: finished,  color: 'text-gray-300',  bg: 'bg-gray-800/40 border-gray-700/40' },
        ].map(s => (
          <div key={s.label} className={cn('rounded-xl border p-4 text-center', s.bg)}>
            <div className={cn('text-2xl font-bold', s.color)}>{s.count}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 bg-gray-900/60 rounded-xl p-1 w-fit border border-white/5">
        {([['matches', Calendar, 'Matches'], ['teams', Users, 'Teams']] as const).map(([key, Icon, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === key ? 'bg-yellow-500/20 text-yellow-300' : 'text-gray-400 hover:text-white'
            )}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {activeTab === 'teams' ? (
        <TeamsTab teams={teams} />
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Stage filter */}
            <div className="flex gap-1 flex-wrap">
              {STAGE_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setStageFilter(opt.key)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                    stageFilter === opt.key
                      ? 'bg-purple-600/30 text-purple-300 border-purple-600/50'
                      : 'text-gray-400 border-gray-700 hover:border-gray-500'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Status filter */}
            <div className="flex gap-1">
              {[['all','All'],['scheduled','Scheduled'],['live','Live'],['finished','FT']].map(([v, l]) => (
                <button
                  key={v}
                  onClick={() => setStatusFilter(v)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                    statusFilter === v
                      ? 'bg-yellow-500/20 text-yellow-300 border-yellow-600/50'
                      : 'text-gray-400 border-gray-700 hover:border-gray-500'
                  )}
                >
                  {l}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative ml-auto">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search team or venue…"
                className="bg-gray-900 border border-gray-700 rounded-lg pl-8 pr-3 py-1.5 text-sm text-white placeholder-gray-600 focus:border-gray-500 outline-none w-52"
              />
            </div>

            {/* Refresh */}
            <button
              onClick={() => router.refresh()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-400 border border-gray-700 hover:border-gray-500"
            >
              <RefreshCw size={13} /> Refresh
            </button>
          </div>

          {/* Count */}
          <div className="text-xs text-gray-500">
            Showing {filtered.length} of {matches.length} matches
            {stageFilter !== 'all' && ` · ${STAGE_OPTIONS.find(s=>s.key===stageFilter)?.label}`}
          </div>

          {/* Match list */}
          <div className="space-y-1.5">
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-600">No matches found</div>
            )}
            {filtered.map(match => (
              <MatchRow
                key={match.id}
                match={match}
                teams={teams}
                onUpdate={updateMatch}
              />
            ))}
          </div>

          {/* Timezone legend */}
          <div className="border border-purple-500/20 rounded-xl p-4 bg-gray-900/30">
            <p className="text-xs text-gray-400 mb-2 font-semibold">⏰ Timezone Reference · All times displayed in CT</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="text-gray-500"><span className="text-gray-400 font-medium">ET</span> · Eastern (−1h from CT)</div>
              <div className="text-gray-300 font-medium"><span className="text-purple-300 font-bold">CT ★</span> · Central · <span className="text-purple-400">Default</span></div>
              <div className="text-gray-500"><span className="text-gray-400 font-medium">MT</span> · Mountain (+1h from CT)</div>
              <div className="text-gray-500"><span className="text-gray-400 font-medium">PT</span> · Pacific (+2h from CT)</div>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Times shown as CT. Fan-facing match cards also auto-convert to each user's local timezone.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
