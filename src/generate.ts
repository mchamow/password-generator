import { pick, randomInt, type RandomSource, shuffle } from './random'
import { WORDS } from './words'

export const SET_NAMES = ['upper', 'lower', 'digits', 'symbols'] as const
export type SetName = (typeof SET_NAMES)[number]

export const SETS: Record<SetName, string> = {
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower: 'abcdefghijklmnopqrstuvwxyz',
  digits: '0123456789',
  // No quotes, backslash or backtick: these survive shells, JSON and most password fields.
  symbols: '!#$%&()*+,-./:;<=>?@[]^_{|}~',
}

/** Characters that are easy to misread for one another in many fonts. */
export const LOOKALIKES = 'Il1O0o|'

export interface PasswordOptions {
  length: number
  sets: SetName[]
  excludeLookalikes: boolean
}

export const SEPARATORS = ['-', ' ', '.', '_', ''] as const
export type Separator = (typeof SEPARATORS)[number]

export interface PassphraseOptions {
  words: number
  separator: Separator
  capitalize: boolean
  /** Append one random digit to one random word. */
  number: boolean
}

/** The characters each chosen set contributes, look-alikes removed when asked. Empty sets are dropped. */
export function charsets({ sets, excludeLookalikes }: Pick<PasswordOptions, 'sets' | 'excludeLookalikes'>): string[] {
  return SET_NAMES.filter((n) => sets.includes(n))
    .map((n) => (excludeLookalikes ? [...SETS[n]].filter((c) => !LOOKALIKES.includes(c)).join('') : SETS[n]))
    .filter(Boolean)
}

/**
 * A password of `length` characters from the chosen sets, with at least one character from each set
 * (when the length allows), positions shuffled so the guaranteed ones aren't always up front.
 */
export function generatePassword(options: PasswordOptions, source?: RandomSource): string {
  const sets = charsets(options)
  if (sets.length === 0) throw new Error('Pick at least one character set')
  const pool = sets.join('')
  const required = options.length >= sets.length ? sets.map((s) => pick([...s], source)) : []
  const rest = Array.from({ length: options.length - required.length }, () => pick([...pool], source))
  return shuffle([...required, ...rest], source).join('')
}

/** Bits of entropy of a generated password: length × log2(pool). Slightly generous, as the one-of-each rule trims a sliver. */
export function passwordBits(options: PasswordOptions): number {
  const pool = charsets(options).join('').length
  return pool > 1 ? options.length * Math.log2(pool) : 0
}

const capitalize = (w: string) => w[0].toUpperCase() + w.slice(1)

export function generatePassphrase(options: PassphraseOptions, source?: RandomSource, words: readonly string[] = WORDS): string {
  const chosen = Array.from({ length: options.words }, () => pick(words, source))
  const shaped = options.capitalize ? chosen.map(capitalize) : chosen
  if (options.number) {
    const i = randomInt(shaped.length, source)
    shaped[i] += String(randomInt(10, source))
  }
  return shaped.join(options.separator)
}

/** Bits of a passphrase: log2(list size) per word, plus which word got the digit and which digit. */
export function passphraseBits(options: PassphraseOptions, listSize = WORDS.length): number {
  return options.words * Math.log2(listSize) + (options.number ? Math.log2(10 * options.words) : 0)
}

export type CharKind = 'upper' | 'lower' | 'digit' | 'symbol' | 'space'

/** How to colour one character of the result. */
export function charKind(c: string): CharKind {
  if (c === ' ') return 'space'
  if (/[0-9]/.test(c)) return 'digit'
  if (/[A-Z]/.test(c)) return 'upper'
  if (/[a-z]/.test(c)) return 'lower'
  return 'symbol'
}
