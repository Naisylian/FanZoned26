/**
 * Strips all non-printable and non-ASCII characters from environment variable strings.
 * Removes BOM (U+FEFF), zero-width spaces, and any invisible Unicode that causes
 * "String contains non ISO-8859-1 code point" fetch header errors.
 */
export const sanitizeEnv = (str: string | undefined): string =>
  (str ?? '').replace(/[^\x20-\x7E]/g, '').trim()
