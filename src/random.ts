/** Fills an array with random 32-bit words. The default is the browser's CSPRNG; tests pass their own. */
export type RandomSource = (buf: Uint32Array<ArrayBuffer>) => Uint32Array<ArrayBuffer>

export const cryptoSource: RandomSource = (buf) => crypto.getRandomValues(buf)

const RANGE = 2 ** 32

/**
 * A uniform integer in [0, max). Plain `word % max` favours small results whenever max doesn't divide
 * 2^32, so words from the biased tail are thrown away and redrawn (rejection sampling).
 */
export function randomInt(max: number, source: RandomSource = cryptoSource): number {
  if (!Number.isInteger(max) || max < 1 || max > RANGE) throw new RangeError(`max must be an integer in 1..2^32, got ${max}`)
  const limit = RANGE - (RANGE % max)
  const buf = new Uint32Array(1)
  for (;;) {
    const v = source(buf)[0]
    if (v < limit) return v % max
  }
}

export const pick = <T>(items: readonly T[], source?: RandomSource): T => items[randomInt(items.length, source)]

/** A Fisher–Yates shuffle with unbiased draws, returning a new array. */
export function shuffle<T>(items: readonly T[], source?: RandomSource): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = randomInt(i + 1, source)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}
