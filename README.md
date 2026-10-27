# 🔐 Password Generator

[![Test and deploy](https://github.com/mchamow/password-generator/actions/workflows/deploy.yml/badge.svg)](https://github.com/mchamow/password-generator/actions/workflows/deploy.yml)

**Day 33 of [100 Days of React](https://github.com/mchamow?tab=repositories)**: Generate strong passwords and passphrases with the Web Crypto API.

**Live demo:** https://mchamow.github.io/password-generator/

## Features

- **Passwords** of 4 to 128 characters from any mix of uppercase, lowercase, digits and symbols, with at least one character from every set you pick. You can't switch off the last set
- **Avoid look-alikes**: leaves out `I l 1 O 0 o |`
- **Passphrases** of 3 to 12 words from a bundled list of about 1,600 common words. Choose the separator (hyphen, space, dot, underscore or none), capitalize words, and optionally add one random digit
- **Strength meter**: bits of entropy, a five-step rating and how long a brute-force search would take at 100 billion guesses a second
- **Colour-coded result**: digits and symbols stand out, and passphrases wrap between words
- **Copy** with one click or <kbd>C</kbd>. *Recently copied* keeps the last 10 for this tab only, so you can grab one again
- **Hide** (<kbd>H</kbd>) masks the result and the copied list for when someone's looking over your shoulder
- <kbd>R</kbd> or <kbd>Space</kbd> generates a new one, and changing any option does too
- Settings are remembered in `localStorage`; generated passwords never are
- Light and dark themes that follow the system, and a phone layout

## How it works

- [`src/random.ts`](src/random.ts): every random choice comes from `crypto.getRandomValues`. Drawing an index uses rejection sampling, so `% n` doesn't favour small values, and shuffling is an unbiased Fisher–Yates
- [`src/generate.ts`](src/generate.ts): builds passwords (one guaranteed character per set, then shuffled) and passphrases, and works out their entropy: length × log2(pool) bits for passwords, and log2(list size) bits per word for passphrases, plus the digit
- [`src/strength.ts`](src/strength.ts): turns bits into a rating and a readable brute-force time
- [`src/settings.ts`](src/settings.ts): settings as reducer actions, and a guarded load that falls back field by field on bad saved data

## Tech

React 19 · TypeScript · Vite · Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com) (Base UI) · lucide icons · Vitest + Testing Library · deployed to GitHub Pages with GitHub Actions.

## Run locally

```bash
pnpm install
pnpm dev
pnpm test   # 43 unit and component tests (Vitest)
```
