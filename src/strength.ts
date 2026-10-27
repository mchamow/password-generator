export interface Strength {
  /** 0 (very weak) to 4 (very strong). */
  level: 0 | 1 | 2 | 3 | 4
  label: string
}

/** Rough bands, in bits of entropy, for a randomly generated secret. */
export function strength(bits: number): Strength {
  if (bits < 28) return { level: 0, label: 'Very weak' }
  if (bits < 45) return { level: 1, label: 'Weak' }
  if (bits < 60) return { level: 2, label: 'Fair' }
  if (bits < 80) return { level: 3, label: 'Strong' }
  return { level: 4, label: 'Very strong' }
}

/** Guesses per second of a well-equipped offline attack on a fast, unsalted hash. */
export const GUESSES_PER_SECOND = 1e11

const UNITS: [number, string][] = [
  [60, 'second'],
  [60, 'minute'],
  [24, 'hour'],
  [365.25, 'day'],
]
const BIG: [number, string][] = [
  [1e12, 'trillion'],
  [1e9, 'billion'],
  [1e6, 'million'],
  [1e3, 'thousand'],
]
const AGE_OF_UNIVERSE_YEARS = 1.38e10

const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? '' : 's'}`

/** How long the average brute-force search (half the space) takes at `rate` guesses a second, in words. */
export function crackTime(bits: number, rate = GUESSES_PER_SECOND): string {
  let t = 2 ** (bits - 1) / rate
  if (t < 1) return 'less than a second'
  for (const [size, unit] of UNITS) {
    if (t < size) return plural(Math.floor(t), unit)
    t /= size
  }
  if (t > 1000 * AGE_OF_UNIVERSE_YEARS) return 'far longer than the age of the universe'
  for (const [size, word] of BIG) {
    if (t >= size) return `${Math.floor(t / size).toLocaleString('en')} ${word} years`
  }
  return plural(Math.floor(t), 'year')
}
