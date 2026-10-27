import { beforeEach, describe, expect, it } from 'vitest'
import { defaultSettings, load, reducer, save, type Settings, STORAGE_KEY } from './settings'

const put = (v: unknown) => localStorage.setItem(STORAGE_KEY, typeof v === 'string' ? v : JSON.stringify(v))

beforeEach(() => localStorage.clear())

describe('reducer', () => {
  it('clamps length and word count', () => {
    let s = reducer(defaultSettings(), { type: 'length', length: 500 })
    expect(s.password.length).toBe(128)
    s = reducer(s, { type: 'length', length: 1 })
    expect(s.password.length).toBe(4)
    s = reducer(s, { type: 'words', words: 99 })
    expect(s.passphrase.words).toBe(12)
  })

  it('keeps sets in a fixed order and never lets the last one go', () => {
    let s = reducer(defaultSettings(), { type: 'sets', sets: ['digits', 'upper'] })
    expect(s.password.sets).toEqual(['upper', 'digits'])
    const before = s
    s = reducer(s, { type: 'sets', sets: [] })
    expect(s).toBe(before)
  })

  it('switches mode and the passphrase and display options', () => {
    let s = reducer(defaultSettings(), { type: 'mode', mode: 'passphrase' })
    s = reducer(s, { type: 'separator', separator: ' ' })
    s = reducer(s, { type: 'capitalize', on: false })
    s = reducer(s, { type: 'number', on: false })
    s = reducer(s, { type: 'lookalikes', on: true })
    s = reducer(s, { type: 'hidden', on: true })
    expect(s).toMatchObject({
      mode: 'passphrase',
      passphrase: { separator: ' ', capitalize: false, number: false },
      password: { excludeLookalikes: true },
      hidden: true,
    })
  })
})

describe('storage', () => {
  it('round-trips settings', () => {
    const s: Settings = {
      mode: 'passphrase',
      password: { length: 32, sets: ['lower', 'symbols'], excludeLookalikes: true },
      passphrase: { words: 7, separator: '', capitalize: false, number: false },
      hidden: true,
    }
    save(s)
    expect(load()).toEqual(s)
  })

  it('falls back to defaults on nothing or garbage', () => {
    expect(load()).toEqual(defaultSettings())
    put('{oops')
    expect(load()).toEqual(defaultSettings())
    put('"just a string"')
    expect(load()).toEqual(defaultSettings())
  })

  it('replaces bad fields one by one', () => {
    put({
      mode: 'pin',
      password: { length: 3, sets: ['emoji'], excludeLookalikes: 'yes' },
      passphrase: { words: 4, separator: '+', capitalize: false },
      hidden: 1,
    })
    const d = defaultSettings()
    expect(load()).toEqual({ ...d, passphrase: { ...d.passphrase, words: 4, capitalize: false } })
  })

  it('never stores a generated secret', () => {
    save(defaultSettings())
    expect(Object.keys(JSON.parse(localStorage.getItem(STORAGE_KEY)!))).toEqual(['mode', 'password', 'passphrase', 'hidden'])
  })

  it('survives storage that throws', () => {
    const broken = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('full')
      },
    } as unknown as Storage
    expect(() => save(defaultSettings(), broken)).not.toThrow()
    expect(load(broken)).toEqual(defaultSettings())
  })
})
