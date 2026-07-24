import { cn } from '@/lib/utils'
import { flagUrl } from '@/lib/flags'
import type { Team, TeamStats } from '@/lib/types'

interface Row {
  team: Team
  stats: TeamStats
}

export default function GroupTable({ groupId, rows }: { groupId: string; rows: Row[] }) {
  const sorted = [...rows].sort((a, b) => {
    if (b.stats.points !== a.stats.points) return b.stats.points - a.stats.points
    if (b.stats.goal_difference !== a.stats.goal_difference) return b.stats.goal_difference - a.stats.goal_difference
    return b.stats.goals_for - a.stats.goals_for
  })

  return (
    <div className="card-glass rounded-xl overflow-hidden">
      <div className="bg-purple-900/30 px-4 py-2 font-bold text-sm">Group {groupId}</div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-gray-500 border-b border-white/5">
            <th className="text-left px-4 py-2">Team</th>
            <th className="py-2 w-8">P</th>
            <th className="py-2 w-8">W</th>
            <th className="py-2 w-8">D</th>
            <th className="py-2 w-8">L</th>
            <th className="py-2 w-8">GD</th>
            <th className="py-2 w-10 text-purple-300 font-bold">Pts</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr
              key={row.team.id}
              className={cn(
                'border-b border-white/5 last:border-0',
                i < 2 && 'bg-green-900/10',
                row.team.status === 'eliminated' && 'opacity-40'
              )}
            >
              <td className="px-4 py-2.5 flex items-center gap-2">
                {i < 2 && <span className="w-1.5 h-5 bg-green-500 rounded-full" />}
                <img src={flagUrl(row.team.code)} alt={row.team.code} className="w-6 h-4 object-cover rounded-sm flex-shrink-0" />
                <span className="font-medium">{row.team.name}</span>
              </td>
              <td className="text-center text-gray-400">{row.stats.played}</td>
              <td className="text-center text-gray-400">{row.stats.won}</td>
              <td className="text-center text-gray-400">{row.stats.drawn}</td>
              <td className="text-center text-gray-400">{row.stats.lost}</td>
              <td className="text-center text-gray-400">{row.stats.goal_difference > 0 ? `+${row.stats.goal_difference}` : row.stats.goal_difference}</td>
              <td className="text-center font-bold text-purple-300">{row.stats.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
