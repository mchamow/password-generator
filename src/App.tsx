import { Fragment, useCallback, useEffect, useState } from 'react'
import { CheckIcon, CopyIcon, EyeIcon, EyeOffIcon, KeyRoundIcon, RefreshCwIcon, ShieldCheckIcon, Trash2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Kbd } from '@/components/ui/kbd'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import {
  charKind,
  generatePassphrase,
  generatePassword,
  LOOKALIKES,
  passphraseBits,
  passwordBits,
  SEPARATORS,
  type Separator,
  SET_NAMES,
  type SetName,
} from './generate'
import {
  type Action,
  LENGTH_MAX,
  LENGTH_MIN,
  load,
  type Mode,
  reducer,
  save,
  type Settings,
  WORDS_MAX,
  WORDS_MIN,
} from './settings'
import { crackTime, strength } from './strength'

const make = (s: Settings) => (s.mode === 'password' ? generatePassword(s.password) : generatePassphrase(s.passphrase))
const bitsOf = (s: Settings) => (s.mode === 'password' ? passwordBits(s.password) : passphraseBits(s.passphrase))

const SET_LABELS: Record<SetName, { short: string; name: string }> = {
  upper: { short: 'A–Z', name: 'Uppercase A–Z' },
  lower: { short: 'a–z', name: 'Lowercase a–z' },
  digits: { short: '0–9', name: 'Digits 0–9' },
  symbols: { short: '#$&', name: 'Symbols #$&' },
}
const SEPARATOR_LABELS: Record<Separator, { short: string; name: string }> = {
  '-': { short: '-', name: 'Hyphen' },
  ' ': { short: '␣', name: 'Space' },
  '.': { short: '.', name: 'Dot' },
  _: { short: '_', name: 'Underscore' },
  '': { short: 'none', name: 'No separator' },
}
/** Toggle values can't be empty strings, so "no separator" goes by a name. */
const toggleValue = (sep: Separator) => sep || 'none'
const KIND_CLASS = {
  upper: 'text-foreground',
  lower: 'text-foreground',
  digit: 'text-sky-600 dark:text-sky-400',
  symbol: 'text-pink-600 dark:text-pink-400',
  space: '',
}
const LEVEL_CLASS = ['bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-lime-500', 'bg-emerald-500']
const LEVEL_TEXT = [
  'text-red-600 dark:text-red-400',
  'text-orange-600 dark:text-orange-400',
  'text-amber-600 dark:text-amber-400',
  'text-lime-700 dark:text-lime-400',
  'text-emerald-600 dark:text-emerald-400',
]
const RECENT_MAX = 10
/** A pressed chip should read as "on" at a glance, more than the default muted fill. */
const CHIP_ON =
  'aria-pressed:bg-emerald-600 aria-pressed:text-white aria-pressed:hover:bg-emerald-600/90 dark:aria-pressed:bg-emerald-500 dark:aria-pressed:text-emerald-950'

const mask = (v: string) => '•'.repeat(Math.min(v.length, 40))

/** Single-key shortcuts fire everywhere except where a key already means something (text fields). */
const isTyping = (target: EventTarget | null) =>
  (target as Element | null)?.closest?.('textarea, [contenteditable="true"], input:not([type=range]):not([type=checkbox])') != null
const takesSpace = (target: EventTarget | null) =>
  (target as Element | null)?.closest?.('button, a, input, [role=button], [role=switch], [role=slider], [role=radio]') != null

interface Copied {
  id: number
  value: string
  mode: Mode
}

export default function App() {
  const [settings, setSettings] = useState(load)
  const [value, setValue] = useState(() => make(settings))
  const [recent, setRecent] = useState<Copied[]>([])
  const [nextId, setNextId] = useState(1)
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => save(settings), [settings])
  useEffect(() => {
    if (!status) return
    const id = setTimeout(() => setStatus(null), 1800)
    return () => clearTimeout(id)
  }, [status])

  /** Applies a settings change; any change to what gets generated also generates a fresh value. */
  const update = (action: Action) => {
    const next = reducer(settings, action)
    if (next === settings) return
    setSettings(next)
    if (action.type !== 'hidden') setValue(make(next))
  }

  const regenerate = useCallback(() => setValue(make(settings)), [settings])
  const toggleHidden = useCallback(() => setSettings((s) => reducer(s, { type: 'hidden', on: !s.hidden })), [])

  const copy = useCallback(
    async (text: string, mode: Mode) => {
      try {
        await navigator.clipboard.writeText(text)
        setStatus({ ok: true, text: 'Copied' })
        setRecent((r) => [{ id: nextId, value: text, mode }, ...r.filter((c) => c.value !== text)].slice(0, RECENT_MAX))
        setNextId((n) => n + 1)
      } catch {
        setStatus({ ok: false, text: 'Copy failed: select the text and copy it yourself' })
      }
    },
    [nextId],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || isTyping(e.target)) return
      const key = e.key.toLowerCase()
      if (key === 'r' || (key === ' ' && !takesSpace(e.target))) {
        e.preventDefault()
        regenerate()
      } else if (key === 'c') {
        void copy(value, settings.mode)
      } else if (key === 'h') {
        toggleHidden()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [copy, regenerate, settings.mode, toggleHidden, value])

  const bits = bitsOf(settings)
  const s = strength(bits)
  const noun = settings.mode === 'password' ? 'password' : 'passphrase'

  return (
    <TooltipProvider>
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-6 sm:py-10">
        <header className="flex items-center gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white shadow-sm dark:bg-emerald-500 dark:text-emerald-950">
            <KeyRoundIcon className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Password Generator</h1>
            <p className="text-sm text-muted-foreground">Made in your browser with the Web Crypto API. Nothing leaves this page.</p>
          </div>
        </header>

        <Card>
          <CardHeader>
            <ToggleGroup
              aria-label="Kind"
              variant="outline"
              size="sm"
              spacing={0}
              value={[settings.mode]}
              onValueChange={(v) => {
                if (v[0] === 'password' || v[0] === 'passphrase') update({ type: 'mode', mode: v[0] })
              }}
            >
              <ToggleGroupItem value="password" className="px-3">
                Password
              </ToggleGroupItem>
              <ToggleGroupItem value="passphrase" className="px-3">
                Passphrase
              </ToggleGroupItem>
            </ToggleGroup>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-3 rounded-xl bg-muted/60 p-3 ring-1 ring-border sm:p-4">
              <output
                aria-label={`Generated ${noun}`}
                aria-live="polite"
                data-hidden={settings.hidden || undefined}
                className={cn(
                  'min-h-12 font-mono text-xl leading-snug font-medium sm:text-2xl',
                  settings.mode === 'password' ? 'break-all' : 'wrap-anywhere',
                )}
              >
                {settings.hidden ? (
                  <span className="tracking-widest text-muted-foreground">{mask(value)}</span>
                ) : (
                  [...value].map((c, i) => (
                    <Fragment key={i}>
                      {/* Passphrases wrap between words, not inside them. */}
                      {settings.mode === 'passphrase' && i > 0 && charKind(c) === 'upper' && <wbr />}
                      <span className={KIND_CLASS[charKind(c)]}>{c}</span>
                      {settings.mode === 'passphrase' && charKind(c) === 'symbol' && <wbr />}
                    </Fragment>
                  ))
                )}
              </output>
              <div className="flex flex-wrap items-center gap-2">
                <p
                  role="status"
                  className={cn('me-auto text-xs', status?.ok === false ? 'text-destructive' : 'text-emerald-700 dark:text-emerald-400')}
                >
                  {status?.text}
                </p>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={settings.hidden ? `Show ${noun}` : `Hide ${noun}`}
                        onClick={toggleHidden}
                      />
                    }
                  >
                    {settings.hidden ? <EyeIcon /> : <EyeOffIcon />}
                  </TooltipTrigger>
                  <TooltipContent>
                    {settings.hidden ? 'Show' : 'Hide'} <Kbd>H</Kbd>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger render={<Button variant="outline" size="sm" onClick={regenerate} />}>
                    <RefreshCwIcon />
                    <span className="max-sm:sr-only">New</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    Generate another <Kbd>R</Kbd>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger render={<Button size="sm" onClick={() => void copy(value, settings.mode)} />}>
                    {status?.ok ? <CheckIcon /> : <CopyIcon />}
                    Copy
                  </TooltipTrigger>
                  <TooltipContent>
                    <Kbd>C</Kbd>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            <StrengthMeter bits={bits} level={s.level} label={s.label} />

            {settings.mode === 'password' ? (
              <div className="flex flex-col gap-5">
                <SliderField
                  label="Length"
                  value={settings.password.length}
                  min={LENGTH_MIN}
                  max={LENGTH_MAX}
                  unit="characters"
                  onChange={(length) => update({ type: 'length', length })}
                />
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium" id="sets-label">
                    Characters
                  </span>
                  <ToggleGroup
                    multiple
                    aria-labelledby="sets-label"
                    variant="outline"
                    spacing={0}
                    className="w-full"
                    value={settings.password.sets}
                    onValueChange={(v) => update({ type: 'sets', sets: v as SetName[] })}
                  >
                    {SET_NAMES.map((n) => (
                      <ToggleGroupItem key={n} value={n} aria-label={SET_LABELS[n].name} className={cn('flex-1 font-mono', CHIP_ON)}>
                        {SET_LABELS[n].short}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>
                <SwitchField
                  label="Avoid look-alikes"
                  hint={
                    <>
                      Leaves out <code className="font-mono">{[...LOOKALIKES].join(' ')}</code>
                    </>
                  }
                  checked={settings.password.excludeLookalikes}
                  onChange={(on) => update({ type: 'lookalikes', on })}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <SliderField
                  label="Words"
                  value={settings.passphrase.words}
                  min={WORDS_MIN}
                  max={WORDS_MAX}
                  unit="words"
                  onChange={(words) => update({ type: 'words', words })}
                />
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium" id="separator-label">
                    Separator
                  </span>
                  <ToggleGroup
                    aria-labelledby="separator-label"
                    variant="outline"
                    spacing={0}
                    className="w-full"
                    value={[toggleValue(settings.passphrase.separator)]}
                    onValueChange={(v) => {
                      const separator = SEPARATORS.find((sep) => toggleValue(sep) === v[0])
                      if (separator !== undefined) update({ type: 'separator', separator })
                    }}
                  >
                    {SEPARATORS.map((sep) => (
                      <ToggleGroupItem
                        key={toggleValue(sep)}
                        value={toggleValue(sep)}
                        aria-label={SEPARATOR_LABELS[sep].name}
                        className={cn('flex-1', sep && 'font-mono text-base', CHIP_ON)}
                      >
                        {SEPARATOR_LABELS[sep].short}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>
                <SwitchField
                  label="Capitalize words"
                  checked={settings.passphrase.capitalize}
                  onChange={(on) => update({ type: 'capitalize', on })}
                />
                <SwitchField
                  label="Add a digit"
                  hint="One random digit on one random word"
                  checked={settings.passphrase.number}
                  onChange={(on) => update({ type: 'number', on })}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recently copied</CardTitle>
            <CardDescription>Only in this tab, and gone when you close it. Nothing is ever saved.</CardDescription>
            {recent.length > 0 && (
              <CardAction>
                <Button variant="ghost" size="sm" onClick={() => setRecent([])}>
                  <Trash2Icon />
                  Clear
                </Button>
              </CardAction>
            )}
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing yet. Whatever you copy shows up here so you can grab it again.</p>
            ) : (
              <ul aria-label="Recently copied" className="flex flex-col divide-y divide-border">
                {recent.map((c, i) => (
                  <li key={c.id} className="flex items-center gap-2 py-1.5">
                    <span className="min-w-0 flex-1 truncate font-mono text-sm" data-testid="recent-value">
                      {settings.hidden ? mask(c.value) : c.value}
                    </span>
                    <span className="text-xs text-muted-foreground max-sm:hidden">{c.mode}</span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Copy item ${i + 1} again`}
                      onClick={() => void copy(c.value, c.mode)}
                    >
                      <CopyIcon />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <footer className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span>
            <Kbd>R</Kbd> or <Kbd>Space</Kbd> new
          </span>
          <span>
            <Kbd>C</Kbd> copy
          </span>
          <span>
            <Kbd>H</Kbd> hide
          </span>
          <span className="ms-auto">
            Day 33 of{' '}
            <a className="underline underline-offset-2 hover:text-foreground" href="https://github.com/mchamow?tab=repositories">
              100 Days of React
            </a>
          </span>
        </footer>
      </main>
    </TooltipProvider>
  )
}

function StrengthMeter({ bits, level, label }: { bits: number; level: number; label: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div
        role="meter"
        aria-label="Strength"
        aria-valuemin={0}
        aria-valuemax={128}
        aria-valuenow={Math.round(Math.min(bits, 128))}
        aria-valuetext={`${label}, about ${Math.round(bits)} bits`}
        className="grid grid-cols-5 gap-1.5"
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={cn('h-1.5 rounded-full transition-colors', i <= level ? LEVEL_CLASS[level] : 'bg-muted')} />
        ))}
      </div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-sm">
        <span className={cn('flex items-center gap-1.5 font-semibold', LEVEL_TEXT[level])}>
          <ShieldCheckIcon className="size-4" />
          {label}
          <span className="font-normal text-muted-foreground tabular-nums">· ≈{Math.round(bits)} bits</span>
        </span>
        <span className="text-xs text-muted-foreground">
          Brute force at 100 billion guesses/s:{' '}
          <span className="font-medium text-foreground" data-testid="crack-time">
            {crackTime(bits)}
          </span>
        </span>
      </div>
    </div>
  )
}

function SliderField({
  label,
  value,
  min,
  max,
  unit,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  unit: string
  onChange: (n: number) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="font-mono text-sm tabular-nums">{value}</span>
      </div>
      <Slider
        min={min}
        max={max}
        step={1}
        largeStep={max > 32 ? 8 : 2}
        value={[value]}
        onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : v)}
        thumbLabel={label}
        valueText={`${value} ${unit}`}
      />
    </div>
  )
}

function SwitchField({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string
  hint?: React.ReactNode
  checked: boolean
  onChange: (on: boolean) => void
}) {
  return (
    <Label className="flex items-center justify-between gap-4 font-normal">
      <span className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">{label}</span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </Label>
  )
}
