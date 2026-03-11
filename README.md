# Olympia Governance App

CoreDAO governance UI for Ethereum Classic — browse proposals, vote, manage treasury.

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19, TypeScript 5 (strict)
- Tailwind CSS 4 (olympia-brand tokens)
- wagmi 2 + viem 2 (contract interaction)
- RainbowKit 2 (wallet connection)
- Mordor Testnet (Chain 63)

## Setup

```bash
pnpm install
pnpm dev
```

## Commands

```bash
pnpm dev          # Dev server (Turbopack)
pnpm build        # Production build
pnpm lint         # ESLint
pnpm typecheck    # TypeScript check
```

## Pages

- `/` — Dashboard (stats, recent proposals, treasury balance)
- `/proposals` — Proposals list
- `/proposals/new` — Create proposal
- `/proposals/[id]` — Proposal detail + voting
- `/members` — NFT holders
- `/treasury` — Treasury balance + contract info
