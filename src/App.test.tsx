import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { LOOKALIKES, SETS } from './generate'
import { STORAGE_KEY } from './settings'
import { WORDS } from './words'

const button = (name: string | RegExp) => screen.getByRole('button', { name })
const sw = (name: RegExp) => screen.getByRole('switch', { name })
const slider = (name: string) => screen.getByLabelText(name, { selector: 'input[type=range]' })
const result = () => screen.getByLabelText(/^Generated (password|passphrase)$/).textContent ?? ''
const press = (key: string) => fireEvent.keyDown(window, { key })
const meter = () => screen.getByRole('meter', { name: 'Strength' })
const stored = () => JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')

let writeText: ReturnType<typeof vi.fn>

beforeEach(() => {
  localStorage.clear()
  writeText = vi.fn(() => Promise.resolve())
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('passwords', () => {
  it('starts with a 20-character password from every set, rated very strong', () => {
    render(<App />)
    const pw = result()
    expect(pw).toHaveLength(20)
    expect(pw).toMatch(/[A-Z]/)
    expect(pw).toMatch(/[a-z]/)
    expect(pw).toMatch(/[0-9]/)
    expect([...pw].some((c) => SETS.symbols.includes(c))).toBe(true)
    expect(meter().getAttribute('aria-valuetext')).toBe('Very strong, about 130 bits')
    for (const n of ['Uppercase A–Z', 'Lowercase a–z', 'Digits 0–9', 'Symbols #$&']) {
      expect(button(n).getAttribute('aria-pressed')).toBe('true')
    }
  })

  it('changes length with the slider and regenerates', () => {
    render(<App />)
    const first = result()
    fireEvent.keyDown(slider('Length'), { key: 'ArrowRight' })
    expect(result()).toHaveLength(21)
    expect(result()).not.toBe(first)
    fireEvent.keyDown(slider('Length'), { key: 'Home' })
    expect(result()).toHaveLength(4)
    expect(slider('Length').getAttribute('aria-valuetext')).toBe('4 characters')
  })

  it('uses only the chosen sets and keeps at least one on', () => {
    render(<App />)
    fireEvent.click(button('Uppercase A–Z'))
    fireEvent.click(button('Symbols #$&'))
    expect(result()).toMatch(/^[a-z0-9]{20}$/)
    fireEvent.click(button('Lowercase a–z'))
    expect(result()).toMatch(/^[0-9]{20}$/)
    fireEvent.click(button('Digits 0–9'))
    expect(button('Digits 0–9').getAttribute('aria-pressed')).toBe('true')
    expect(result()).toMatch(/^[0-9]{20}$/)
    expect(meter().getAttribute('aria-valuetext')).toBe('Strong, about 66 bits')
  })

  it('rates short digit-only passwords very weak', () => {
    render(<App />)
    for (const n of ['Uppercase A–Z', 'Lowercase a–z', 'Symbols #$&']) fireEvent.click(button(n))
    fireEvent.keyDown(slider('Length'), { key: 'Home' })
    expect(meter().getAttribute('aria-valuetext')).toBe('Very weak, about 13 bits')
    expect(screen.getByTestId('crack-time').textContent).toBe('less than a second')
  })

  it('leaves out look-alike characters', () => {
    render(<App />)
    fireEvent.keyDown(slider('Length'), { key: 'End' })
    fireEvent.click(sw(/Avoid look-alikes/))
    for (let i = 0; i < 20; i++) {
      for (const c of LOOKALIKES) expect(result()).not.toContain(c)
      press('r')
    }
  })

  it('generates a new one with the button, R and Space', () => {
    render(<App />)
    const seen = new Set([result()])
    fireEvent.click(button(/^New/))
    seen.add(result())
    press('r')
    seen.add(result())
    press(' ')
    seen.add(result())
    expect(seen.size).toBe(4)
  })
})

describe('passphrases', () => {
  it('builds capitalized words joined by hyphens with one digit', () => {
    render(<App />)
    fireEvent.click(button('Passphrase'))
    const phrase = result()
    expect(phrase).toMatch(/^([A-Z][a-z]+\d?-){4}[A-Z][a-z]+\d?$/)
    expect(phrase.match(/\d/g)).toHaveLength(1)
    for (const w of phrase.split('-')) expect(WORDS).toContain(w.replace(/\d/, '').toLowerCase())
    expect(screen.getByLabelText('Generated passphrase')).toBeTruthy()
  })

  it('follows the word count, separator, capitals and digit options', () => {
    render(<App />)
    fireEvent.click(button('Passphrase'))
    fireEvent.keyDown(slider('Words'), { key: 'ArrowRight' })
    fireEvent.click(button('Space'))
    fireEvent.click(sw(/Capitalize words/))
    fireEvent.click(sw(/Add a digit/))
    const words = result().split(' ')
    expect(words).toHaveLength(6)
    for (const w of words) expect(WORDS).toContain(w)
    fireEvent.click(button('No separator'))
    expect(result()).toMatch(/^[a-z]+$/)
    expect(meter().getAttribute('aria-valuetext')).toMatch(/^Strong, about 64 bits$/)
  })
})

describe('copying', () => {
  it('copies with the button and C, and lists what was copied', async () => {
    render(<App />)
    expect(screen.getByText(/Nothing yet/)).toBeTruthy()
    const first = result()
    await act(async () => fireEvent.click(button(/^Copy$/)))
    expect(writeText).toHaveBeenLastCalledWith(first)
    expect(screen.getByText('Copied')).toBeTruthy()
    // Copying the same value again doesn't list it twice.
    await act(async () => press('c'))
    const list = () => screen.getByRole('list', { name: 'Recently copied' })
    expect(within(list()).getAllByRole('listitem')).toHaveLength(1)

    press('r')
    const second = result()
    await act(async () => press('c'))
    expect(within(list()).getAllByTestId('recent-value').map((e) => e.textContent)).toEqual([second, first])

    await act(async () => fireEvent.click(button('Copy item 2 again')))
    expect(writeText).toHaveBeenLastCalledWith(first)
    expect(within(list()).getAllByTestId('recent-value')[0].textContent).toBe(first)

    fireEvent.click(button(/Clear/))
    expect(screen.queryByRole('list', { name: 'Recently copied' })).toBeNull()
  })

  it('says so when the clipboard is unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true })
    render(<App />)
    await act(async () => fireEvent.click(button(/^Copy$/)))
    expect(screen.getByText(/Copy failed/)).toBeTruthy()
    expect(screen.queryByRole('list', { name: 'Recently copied' })).toBeNull()
  })

  it('never puts a generated secret in storage', async () => {
    render(<App />)
    await act(async () => fireEvent.click(button(/^Copy$/)))
    expect(localStorage.getItem(STORAGE_KEY)).not.toContain(result())
  })
})

describe('hiding and remembering', () => {
  it('masks the result and the copied list with the button and H', async () => {
    render(<App />)
    const pw = result()
    await act(async () => fireEvent.click(button(/^Copy$/)))
    fireEvent.click(button('Hide password'))
    expect(result()).toBe('•'.repeat(20))
    expect(screen.getByTestId('recent-value').textContent).toBe('•'.repeat(20))
    // Hiding doesn't change the password underneath.
    await act(async () => press('c'))
    expect(writeText).toHaveBeenLastCalledWith(pw)
    press('h')
    expect(result()).toBe(pw)
    expect(button('Hide password')).toBeTruthy()
  })

  it('keeps settings, not secrets, across a reload', () => {
    const { unmount } = render(<App />)
    fireEvent.click(button('Passphrase'))
    fireEvent.click(button('Dot'))
    press('h')
    unmount()
    render(<App />)
    expect(button('Passphrase').getAttribute('aria-pressed')).toBe('true')
    expect(button('Dot').getAttribute('aria-pressed')).toBe('true')
    expect(button('Show passphrase')).toBeTruthy()
    expect(stored()).toMatchObject({ mode: 'passphrase', hidden: true, passphrase: { separator: '.' } })
  })
})
