'use client'

/**
 * Renders the user's local time for a match kick-off, only if they are
 * NOT already in the Central Time zone.
 *
 * Server renders nothing (null). After hydration the browser's
 * Intl.DateTimeFormat API detects the actual timezone and, if it differs
 * from CT, shows e.g. "(3:00 PM ET)" in muted text.
 */

import { useState, useEffect } from 'react'

const CT_ZONES = new Set([
  'America/Chicago',
  'America/Indiana/Knox',
  'America/Indiana/Tell_City',
  'America/Menominee',
  'America/North_Dakota/Beulah',
  'America/North_Dakota/Center',
  'America/North_Dakota/New_Salem',
  'America/Matamoros',
  'America/Winnipeg',
  'America/Rainy_River',
  'America/Rankin_Inlet',
  'America/Resolute',
])

interface Props {
  /** UTC ISO date string */
  utc: string
  className?: string
}

export default function LocalTimeHint({ utc, className }: Props) {
  const [hint, setHint] = useState<string | null>(null)

  useEffect(() => {
    const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone

    // Already in CT — nothing extra to show
    if (CT_ZONES.has(userTz)) return

    const d = new Date(utc)

    // Format user's local time
    const localTime = d.toLocaleTimeString('en-US', {
      timeZone: userTz,
      hour:     'numeric',
      minute:   '2-digit',
      hour12:   true,
    })

    // Short timezone abbreviation (e.g. "EDT", "BST", "IST")
    const tzAbbr =
      new Intl.DateTimeFormat('en-US', { timeZone: userTz, timeZoneName: 'short' })
        .formatToParts(d)
        .find(p => p.type === 'timeZoneName')?.value ?? ''

    setHint(`${localTime}${tzAbbr ? ` ${tzAbbr}` : ''}`)
  }, [utc])

  if (!hint) return null

  return (
    <span className={className ?? 'text-gray-500 text-xs'}>
      ({hint})
    </span>
  )
}
