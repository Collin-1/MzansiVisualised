// lib/utils.ts — shared utility functions
// Flask equivalent: your utils.py / helpers.py

/** Format a ZAR number to a short human string: 1_800_000 → "R1.8m" */
export function fmtRandShort(n: number): string {
  if (n >= 1_000_000) return `R${(n / 1_000_000).toFixed(1)}m`
  if (n >= 1_000)     return `R${(n / 1_000).toFixed(0)}k`
  return `R${n}`
}

/** Format a ZAR number with locale commas: 1800000 → "R1,800,000" */
export function fmtRandFull(n: number): string {
  return 'R' + n.toLocaleString('en-ZA')
}

/** Format a percentage with sign: 8.2 → "+8.2%" */
export function fmtPct(n: number): string {
  return `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`
}

/** Format an ISO date string to a readable form: "2026-03-13" → "13 March 2026" */
export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-ZA', {
    day:   'numeric',
    month: 'long',
    year:  'numeric',
  })
}

/** Merge class names conditionally (lightweight clsx alternative) */
export function cx(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
