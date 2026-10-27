import { describe, expect, it } from 'vitest'
import { crackTime, strength } from './strength'

describe('strength', () => {
  it('bands bits into five levels', () => {
    expect([10, 30, 50, 70, 100].map((b) => strength(b).label)).toEqual(['Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'])
    expect(strength(80).level).toBe(4)
    expect(strength(79.9).level).toBe(3)
  })
})

describe('crackTime', () => {
  // A rate of 1 guess/s makes the arithmetic readable: half of 2^bits seconds.
  it('reads small spaces in seconds to days', () => {
    expect(crackTime(1, 1)).toBe('1 second')
    expect(crackTime(0, 1)).toBe('less than a second')
    expect(crackTime(7, 1)).toBe('1 minute')
    expect(crackTime(14, 1)).toBe('2 hours')
    expect(crackTime(19, 1)).toBe('3 days')
  })

  it('reads big spaces in years with words for the zeros', () => {
    expect(crackTime(27, 1)).toBe('2 years')
    expect(crackTime(40, 1)).toBe('17 thousand years')
    expect(crackTime(60, 1)).toBe('18 billion years')
    expect(crackTime(200)).toBe('far longer than the age of the universe')
  })

  it('assumes 100 billion guesses a second by default', () => {
    expect(crackTime(30)).toBe('less than a second')
    expect(crackTime(64)).toBe('2 years')
  })
})
