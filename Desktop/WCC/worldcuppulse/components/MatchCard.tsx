import Link from 'next/link'
import { cn } from '@/lib/utils'
import { stageLabel } from '@/lib/utils'
import { flagUrl } from '@/lib/flags'
import type { Match, Team } from '@/lib/types'
import LocalTimeHint from './LocalTimeHint'

/** Central Time kick-off display */
function ctTime(utc: string): string {
  return new Date(utc).toLocaleTimeString('en-US', {
    timeZone: 'America/Chicago',
    hour:     'numeric',
    minute:   '2-digit',
    hour12:   true,
  })
}

/** All four US timezones for the multi-tz footer strip */
function allZoneTimes(utc: string) {
  const d = new Date(utc)
  const tz = (zone: string) =>
    d.toLocaleTimeString('en-US', { timeZone: zone, hour: 'numeric', minute: '2-digit', hour12: true })
  return {
    et: tz('America/New_York'),
    ct: tz('America/Chicago'),
    mt: tz('America/Denver'),
    pt: tz('America/Los_Angeles'),
  }
}

export default function MatchCard({
  match,
  showTimezones = false,
}: {
  match: Match
  showTimezones?: boolean
}) {
  const homeTeam = match.home_team as Team | undefined
  const awayTeam = match.away_team as Team | undefined
  const isTBD = !homeTeam && !awayTeam

  const statusColor = {
    live:      'bg-red-500 animate-pulse',
    finished:  'bg-gray-600',
    scheduled: 'bg-blue-600',
  }[match.status]

  // Primary kick-off time label shown in the badge
  const kickoffLabel = match.status === 'live'
    ? '🔴 LIVE'
    : match.status === 'finished'
    ? 'FT'
    : `${ctTime(match.match_date)} CT`

  const zones = allZoneTimes(match.match_date)

  return (
    <Link
      href={`/matches/${match.id}`}
      className="card-glass rounded-xl p-4 hover:border-purple-500/40 transition-all block"
    >
      {/* Header row: stage label + status/time badge */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500">
          {stageLabel(match.stage)}{match.group_id ? ` · Group ${match.group_id}` : ''}
        </span>

        <div className="flex items-center gap-1.5">
          <span className={cn('text-xs px-2 py-0.5 rounded-full text-white', statusColor)}>
            {kickoffLabel}
          </span>
          {/* Local-time hint: auto-shows user's timezone if they're not in CT */}
          {match.status === 'scheduled' && (
            <LocalTimeHint utc={match.match_date} className="text-gray-500 text-xs" />
          )}
        </div>
      </div>

      {isTBD ? (
        /* Knockout match with TBD teams */
        <div className="text-center py-2">
          <p className="text-sm font-medium text-gray-400">{match.note ?? 'TBD vs TBD'}</p>
          <p className="text-xs text-gray-600 mt-1">{match.venue}</p>
        </div>
      ) : (
        /* Known teams */
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            {homeTeam && (
              <img
                src={flagUrl(homeTeam.code)}
                alt={homeTeam.code}
                className="w-7 h-5 object-cover rounded-sm flex-shrink-0"
              />
            )}
            <span className="font-semibold text-sm truncate">{homeTeam?.name ?? 'TBD'}</span>
          </div>

          <div className="text-center min-w-[60px]">
            {match.status !== 'scheduled' ? (
              <span className="text-xl font-bold tabular-nums">
                {match.home_score} — {match.away_score}
              </span>
            ) : (
              <span className="text-gray-500 text-sm">vs</span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-1 justify-end">
            <span className="font-semibold text-sm truncate">{awayTeam?.name ?? 'TBD'}</span>
            {awayTeam && (
              <img
                src={flagUrl(awayTeam.code)}
                alt={awayTeam.code}
                className="w-7 h-5 object-cover rounded-sm flex-shrink-0"
              />
            )}
          </div>
        </div>
      )}

      {/* Venue */}
      {match.venue && !isTBD && (
        <p className="text-xs text-gray-600 mt-2 text-center">{match.venue}</p>
      )}

      {/* Multi-timezone strip (opt-in via showTimezones prop) */}
      {showTimezones && match.status === 'scheduled' && (
        <div className="mt-2 pt-2 border-t border-white/5 grid grid-cols-4 gap-1 text-center">
          {([['ET', zones.et], ['CT', zones.ct], ['MT', zones.mt], ['PT', zones.pt]] as const).map(([label, time]) => (
            <div key={label}>
              <div className={cn('text-xs font-semibold', label === 'CT' ? 'text-purple-300' : 'text-gray-500')}>
                {label}
              </div>
              <div className={cn('text-xs font-medium', label === 'CT' ? 'text-white' : 'text-gray-400')}>
                {time}
              </div>
            </div>
          ))}
        </div>
      )}
    </Link>
  )
}
