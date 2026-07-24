import { cn } from '@/lib/utils'
import { flagUrl } from '@/lib/flags'
import type { BracketSlot } from '@/lib/types'

const STAGES = [
  { key: 'r32', label: 'R32', slots: 32 },
  { key: 'r16', label: 'R16', slots: 16 },
  { key: 'qf', label: 'QF', slots: 8 },
  { key: 'sf', label: 'SF', slots: 4 },
  { key: 'final', label: 'Final', slots: 2 },
]

export default function KnockoutBracket({ slots }: { slots: BracketSlot[] }) {
  const getSlot = (stage: string, num: number) =>
    slots.find(s => s.stage === stage && s.slot_number === num)

  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex gap-2 min-w-max p-4">
        {STAGES.map(({ key, label, slots: count }) => (
          <div key={key} className="flex flex-col gap-1">
            <p className="text-xs text-center text-gray-500 font-semibold mb-2">{label}</p>
            <div
              className="flex flex-col justify-around"
              style={{ minHeight: `${count * 52}px` }}
            >
              {Array.from({ length: count }).map((_, i) => {
                const slot = getSlot(key, i + 1)
                const team = slot?.team
                return (
                  <div
                    key={i}
                    className={cn(
                      'w-36 h-10 rounded-lg border flex items-center gap-2 px-2 text-xs font-medium',
                      team ? 'card-glass border-white/15' : 'border-dashed border-white/10 text-gray-700'
                    )}
                  >
                    {team ? (
                      <>
                        <img src={flagUrl(team.code)} alt={team.code} className="w-6 h-4 object-cover rounded-sm flex-shrink-0" />
                        <span className="truncate">{team.name}</span>
                      </>
                    ) : (
                      <span>TBD</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
