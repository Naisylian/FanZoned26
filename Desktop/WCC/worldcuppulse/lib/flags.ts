/**
 * Maps FIFA team codes → ISO 3166-1 alpha-2 codes for flagcdn.com
 * Official FIFA World Cup 2026 group draw teams
 *
 * Usage: <img src={flagUrl('BRA')} alt="Brazil" className="w-8 h-6 object-cover rounded-sm" />
 */
const CODE_MAP: Record<string, string> = {
  // Group A
  MEX: 'mx', RSA: 'za', KOR: 'kr', CZE: 'cz',
  // Group B
  CAN: 'ca', BIH: 'ba', QAT: 'qa', SUI: 'ch',
  // Group C
  BRA: 'br', MAR: 'ma', HAI: 'ht', SCO: 'gb-sct',
  // Group D
  USA: 'us', PAR: 'py', AUS: 'au', TUR: 'tr',
  // Group E
  GER: 'de', CUW: 'cw', CIV: 'ci', ECU: 'ec',
  // Group F
  NED: 'nl', JPN: 'jp', SWE: 'se', TUN: 'tn',
  // Group G
  BEL: 'be', EGY: 'eg', IRN: 'ir', NZL: 'nz',
  // Group H
  ESP: 'es', CPV: 'cv', KSA: 'sa', URU: 'uy',
  // Group I
  FRA: 'fr', SEN: 'sn', IRQ: 'iq', NOR: 'no',
  // Group J
  ARG: 'ar', ALG: 'dz', AUT: 'at', JOR: 'jo',
  // Group K
  POR: 'pt', COD: 'cd', UZB: 'uz', COL: 'co',
  // Group L
  ENG: 'gb-eng', CRO: 'hr', GHA: 'gh', PAN: 'pa',
}

/**
 * Returns a flagcdn.com image URL (40px wide) for the given FIFA team code.
 */
export function flagUrl(code: string | undefined): string {
  if (!code) return ''
  const iso = CODE_MAP[code.toUpperCase()]
  if (!iso) return ''
  return `https://flagcdn.com/w40/${iso}.png`
}

/**
 * Returns a 2x (80px wide) flagcdn.com image URL for retina displays.
 */
export function flagUrl2x(code: string | undefined): string {
  if (!code) return ''
  const iso = CODE_MAP[code.toUpperCase()]
  if (!iso) return ''
  return `https://flagcdn.com/w80/${iso}.png`
}
