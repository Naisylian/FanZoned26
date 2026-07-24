import Link from 'next/link'
import { cn } from '@/lib/utils'
import { flagUrl } from '@/lib/flags'
import type { Team, TeamStats } from '@/lib/types'

interface Props {
  team: Team
  stats?: TeamStats
  showForm?: boolean
}

export default function TeamCard({ team, stats, showForm = false }: Props) {
  const isEliminated = team.status === 'eliminated'

  return (
    <Link
      href={`/teams/${team.id}`}
      className={cn(
        'card-glass rounded-xl p-4 flex items-center gap-3 hover:border-purple-500/40 transition-all group',
        isEliminated && 'opacity-50 grayscale'
      )}
    >
      <img src={flagUrl(team.code)} alt={team.code} className="w-8 h-6 object-cover rounded-sm flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-sm truncate">{team.name}</p>
          {isEliminated && (
            <span className="text-xs bg-red-900/40 text-red-400 px-1.5 py-0.5 rounded">
              Eliminated
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500">Group {team.group_id} · {team.code}</p>
        {showForm && stats?.form && (
          <div className="flex gap-1 mt-1.5">
            {stats.form.split('').map((r, i) => (
              <span
                key={i}
                className={cn(
                  'w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold text-white',
                  r === 'W' ? 'bg-green-500' : r === 'D' ? 'bg-yellow-500' : 'bg-red-500'
                )}
              >
                {r}
              </span>
            ))}
          </div>
        )}
      </div>
      {stats && (
        <div className="text-right">
          <p className="text-sm font-bold text-purple-300">{stats.points} pts</p>
          <p className="text-xs text-gray-500">{stats.played} played</p>
        </div>
      )}
    </Link>
  )
}
