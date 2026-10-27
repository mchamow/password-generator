import { describe, expect, it } from 'vitest'
import {
  charKind,
  charsets,
  generatePassphrase,
  generatePassword,
  LOOKALIKES,
  passphraseBits,
  passwordBits,
  SET_NAMES,
  SETS,
} from './generate'
import { randomInt, type RandomSource, shuffle } from './random'
import { WORDS } from './words'

/** A source that hands out the given words in turn, cycling. */
const scripted = (values: number[]): RandomSource => {
  let i = 0
  return (buf) => {
    for (let k = 0; k < buf.length; k++) buf[k] = values[i++ % values.length]
    return buf
  }
}

describe('randomInt', () => {
  it('maps words into range', () => {
    expect(randomInt(10, scripted([7]))).toBe(7)
    expect(randomInt(10, scripted([23]))).toBe(3)
    expect(randomInt(1, scripted([123456]))).toBe(0)
  })

  it('redraws words from the biased tail', () => {
    // 2^32 % 10 = 6, so the top six words would favour 0..5; they're rejected.
    const top = 2 ** 32 - 1
    expect(randomInt(10, scripted([top, top - 5, 42]))).toBe(2)
  })

  it('rejects silly ranges', () => {
    expect(() => randomInt(0)).toThrow(RangeError)
    expect(() => randomInt(2.5)).toThrow(RangeError)
  })

  it('uses the real CSPRNG by default and spreads results', () => {
    const counts = new Array(6).fill(0)
    for (let i = 0; i < 6000; i++) counts[randomInt(6)]++
    for (const c of counts) expect(c).toBeGreaterThan(800)
  })

  it('shuffles without losing items', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8]
    const out = shuffle(items)
    expect([...out].sort()).toEqual(items)
    expect(items).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })
})

describe('passwords', () => {
  it('has the requested length and only chosen characters', () => {
    for (const length of [4, 20, 128]) {
      const pw = generatePassword({ length, sets: ['lower', 'digits'], excludeLookalikes: false })
      expect(pw).toHaveLength(length)
      expect(pw).toMatch(/^[a-z0-9]+$/)
    }
  })

  it('includes at least one character from every chosen set', () => {
    for (let i = 0; i < 200; i++) {
      const pw = generatePassword({ length: 4, sets: [...SET_NAMES], excludeLookalikes: false })
      expect(pw).toMatch(/[A-Z]/)
      expect(pw).toMatch(/[a-z]/)
      expect(pw).toMatch(/[0-9]/)
      expect([...pw].some((c) => SETS.symbols.includes(c))).toBe(true)
    }
  })

  it('leaves out look-alikes when asked', () => {
    const sets = charsets({ sets: [...SET_NAMES], excludeLookalikes: true }).join('')
    for (const c of LOOKALIKES) expect(sets).not.toContain(c)
    const pw = generatePassword({ length: 128, sets: [...SET_NAMES], excludeLookalikes: true })
    for (const c of LOOKALIKES) expect(pw).not.toContain(c)
  })

  it('refuses to work with no characters', () => {
    expect(() => generatePassword({ length: 8, sets: [], excludeLookalikes: false })).toThrow()
  })

  it('counts bits as length × log2(pool)', () => {
    expect(passwordBits({ length: 10, sets: ['digits'], excludeLookalikes: false })).toBeCloseTo(10 * Math.log2(10))
    expect(passwordBits({ length: 20, sets: [...SET_NAMES], excludeLookalikes: false })).toBeCloseTo(20 * Math.log2(90))
    // 0 and 1 drop out of the digits.
    expect(passwordBits({ length: 10, sets: ['digits'], excludeLookalikes: true })).toBeCloseTo(10 * Math.log2(8))
  })
})

describe('passphrases', () => {
  const words = ['apple', 'berry', 'cherry', 'date']

  it('joins the picked words with the separator', () => {
    const source = scripted([0, 1, 2])
    expect(generatePassphrase({ words: 3, separator: '.', capitalize: false, number: false }, source, words)).toBe(
      'apple.berry.cherry',
    )
  })

  it('capitalizes and adds a digit to one word', () => {
    // Words 3, 0, 1; then the digit goes on word index 1, and the digit is 7.
    const source = scripted([3, 0, 1, 1, 7])
    expect(generatePassphrase({ words: 3, separator: '', capitalize: true, number: true }, source, words)).toBe(
      'DateApple7Berry',
    )
  })

  it('draws from the bundled list by default', () => {
    const phrase = generatePassphrase({ words: 6, separator: ' ', capitalize: false, number: false })
    const parts = phrase.split(' ')
    expect(parts).toHaveLength(6)
    for (const w of parts) expect(WORDS).toContain(w)
  })

  it('counts bits per word plus the digit', () => {
    expect(passphraseBits({ words: 5, separator: '-', capitalize: true, number: false }, 1024)).toBe(50)
    expect(passphraseBits({ words: 5, separator: '-', capitalize: true, number: true }, 1024)).toBeCloseTo(50 + Math.log2(50))
  })

  it('has a big, clean word list', () => {
    expect(WORDS.length).toBeGreaterThan(1500)
    expect(new Set(WORDS).size).toBe(WORDS.length)
    for (const w of WORDS) expect(w).toMatch(/^[a-z]{3,10}$/)
  })
})

it('classifies characters for colouring', () => {
  expect([...'aZ7# '].map(charKind)).toEqual(['lower', 'upper', 'digit', 'symbol', 'space'])
})
