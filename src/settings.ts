import { type PassphraseOptions, type PasswordOptions, SEPARATORS, type Separator, SET_NAMES, type SetName } from './generate'

export const LENGTH_MIN = 4
export const LENGTH_MAX = 128
export const WORDS_MIN = 3
export const WORDS_MAX = 12

export type Mode = 'password' | 'passphrase'

/** What the generator remembers between visits. Generated secrets are never saved. */
export interface Settings {
  mode: Mode
  password: PasswordOptions
  passphrase: PassphraseOptions
  /** Mask the result on screen. */
  hidden: boolean
}

export const defaultSettings = (): Settings => ({
  mode: 'password',
  password: { length: 20, sets: [...SET_NAMES], excludeLookalikes: false },
  passphrase: { words: 5, separator: '-', capitalize: true, number: true },
  hidden: false,
})

export type Action =
  | { type: 'mode'; mode: Mode }
  | { type: 'length'; length: number }
  | { type: 'sets'; sets: SetName[] }
  | { type: 'lookalikes'; on: boolean }
  | { type: 'words'; words: number }
  | { type: 'separator'; separator: Separator }
  | { type: 'capitalize'; on: boolean }
  | { type: 'number'; on: boolean }
  | { type: 'hidden'; on: boolean }

const clampInt = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Math.round(n)))

export function reducer(s: Settings, a: Action): Settings {
  switch (a.type) {
    case 'mode':
      return { ...s, mode: a.mode }
    case 'length':
      return { ...s, password: { ...s.password, length: clampInt(a.length, LENGTH_MIN, LENGTH_MAX) } }
    case 'sets': {
      // At least one set stays on: a password needs something to be made of.
      const sets = SET_NAMES.filter((n) => a.sets.includes(n))
      return sets.length ? { ...s, password: { ...s.password, sets } } : s
    }
    case 'lookalikes':
      return { ...s, password: { ...s.password, excludeLookalikes: a.on } }
    case 'words':
      return { ...s, passphrase: { ...s.passphrase, words: clampInt(a.words, WORDS_MIN, WORDS_MAX) } }
    case 'separator':
      return { ...s, passphrase: { ...s.passphrase, separator: a.separator } }
    case 'capitalize':
      return { ...s, passphrase: { ...s.passphrase, capitalize: a.on } }
    case 'number':
      return { ...s, passphrase: { ...s.passphrase, number: a.on } }
    case 'hidden':
      return { ...s, hidden: a.on }
  }
}

export const STORAGE_KEY = 'password-generator'

export function save(s: Settings, storage: Storage = localStorage): void {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch {
    // Storage blocked or full: settings just won't be remembered.
  }
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null
const isIntIn = (v: unknown, lo: number, hi: number): v is number => Number.isInteger(v) && (v as number) >= lo && (v as number) <= hi
const bool = (v: unknown, fallback: boolean) => (typeof v === 'boolean' ? v : fallback)

/** The saved settings, field by field: anything missing or malformed takes its default. */
export function load(storage: Storage = localStorage): Settings {
  const d = defaultSettings()
  let raw: unknown
  try {
    raw = JSON.parse(storage.getItem(STORAGE_KEY) ?? 'null')
  } catch {
    raw = null
  }
  if (!isRecord(raw)) return d
  const pw = isRecord(raw.password) ? raw.password : {}
  const pp = isRecord(raw.passphrase) ? raw.passphrase : {}
  const sets = Array.isArray(pw.sets) ? SET_NAMES.filter((n) => (pw.sets as unknown[]).includes(n)) : []
  return {
    mode: raw.mode === 'passphrase' || raw.mode === 'password' ? raw.mode : d.mode,
    password: {
      length: isIntIn(pw.length, LENGTH_MIN, LENGTH_MAX) ? pw.length : d.password.length,
      sets: sets.length ? sets : d.password.sets,
      excludeLookalikes: bool(pw.excludeLookalikes, d.password.excludeLookalikes),
    },
    passphrase: {
      words: isIntIn(pp.words, WORDS_MIN, WORDS_MAX) ? pp.words : d.passphrase.words,
      separator: SEPARATORS.includes(pp.separator as Separator) ? (pp.separator as Separator) : d.passphrase.separator,
      capitalize: bool(pp.capitalize, d.passphrase.capitalize),
      number: bool(pp.number, d.passphrase.number),
    },
    hidden: bool(raw.hidden, d.hidden),
  }
}
