import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string) {
  return new Date(date).toLocaleString('en-US', {
    timeZone: 'America/Chicago',
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  }) + ' CT'
}

export function getFormColor(result: string) {
  if (result === 'W') return 'bg-green-500'
  if (result === 'D') return 'bg-yellow-500'
  return 'bg-red-500'
}

export function stageLabel(stage: string) {
  const map: Record<string, string> = {
    group: 'Group Stage', r32: 'Round of 32', r16: 'Round of 16',
    qf: 'Quarter Final', sf: 'Semi Final', final: 'Final'
  }
  return map[stage] ?? stage
}

export function isChatLocked(match: { status: string; match_date: string }) {
  if (match.status === 'scheduled') return true
  if (match.status === 'live') return false
  // lock 30 mins after finished
  const end = new Date(match.match_date).getTime() + (110 + 30) * 60 * 1000
  return Date.now() > end
}
