# Olympia App — Copilot Instructions

> **Important:** GitHub Copilot only reads this file and your project code. It does NOT have access to global settings. All LTS rules must be included here.

## Project

CoreDAO governance application for the Olympia upgrade on Ethereum Classic. Proposal browsing, ECFP submission, voting, sanctions status, and member NFT management.

## LTS Enforcement (CRITICAL)

**ALWAYS use current stable LTS versions.**

| Technology | Version |
|------------|---------|
| Node.js | 24.x |
| Next.js | 16.x |
| React | 19.x |
| TypeScript | 5.x |
| Tailwind CSS | 4.x |
| wagmi | 2.x |
| viem | 2.x |
| pnpm | 10.x |

**Never suggest:** Node 22, Next.js 14/15, React 18.

## Tech Stack

- Next.js 16.x (App Router, Turbopack)
- React 19.x, TypeScript 5.x (strict)
- Tailwind CSS 4.x (CSS-first `@theme inline`)
- wagmi 2.x + viem (wallet/contract interaction)
- Lucide React (icons)
- Inter (UI) + JetBrains Mono (code/addresses)

## Commands

```bash
pnpm dev          # Dev server (Turbopack)
pnpm build        # Production build
pnpm lint         # ESLint
pnpm typecheck    # tsc --noEmit
pnpm test         # Run tests
```

## Key Rules

1. Use TypeScript strict mode
2. Use wagmi hooks for all contract interaction
3. Use CSS custom properties for brand colors
4. Use Lucide React for icons
5. Use JetBrains Mono for addresses/hashes
6. Contract addresses must match olympia-framework README

## Code Style

- 2-space indentation
- Double quotes for strings
- Semicolons
- Trailing commas in multiline

## Validation

Before committing:

```bash
pnpm lint && pnpm typecheck && pnpm build
```

## Don't

- Commit .env files or secrets
- Use `any` type
- Skip type errors with `@ts-ignore`
- Use deprecated versions
- Hardcode chain IDs

## Response Style

- Code first, explanations only if asked
- Concise bullet points over paragraphs
- Get straight to the answer
