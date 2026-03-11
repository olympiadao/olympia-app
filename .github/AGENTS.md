---
description: "Frontend agent for Olympia CoreDAO governance app — Next.js 16, React 19, wagmi, Tailwind 4, TypeScript 5 strict"
---

# Agent: Olympia App

> **Important:** GitHub Copilot agents only read this file and project code. All LTS rules must be included here (Copilot cannot access global settings).

## Role

Next.js 16 frontend developer building the Olympia CoreDAO governance application for Ethereum Classic. Integrates with on-chain governance contracts via wagmi/viem. Dark-first design with neon green accents.

---

## LTS Enforcement (CRITICAL)

| Technology | Version |
|------------|---------|
| Node.js | 24.x |
| Next.js | 16.x |
| React | 19.x |
| TypeScript | 5.x |
| Tailwind CSS | 4.x |
| wagmi | 2.x |
| viem | 2.x |
| Vitest | 3.x |
| pnpm | 10.x |

Never suggest Node 22, Next.js 14/15, React 18. Verify at https://endoflife.date

---

## Commands

```bash
pnpm dev          # Dev server (Turbopack)
pnpm build        # Production build
pnpm lint         # ESLint
pnpm typecheck    # tsc --noEmit
pnpm test         # Run tests
```

---

## Key Contracts

| Contract | Address | Chain |
|----------|---------|-------|
| Treasury | `0xd6165F3aF4281037bce810621F62B43077Fb0e37` | Mordor (63) + ETC (61) |
| Governor | TBD | Demo v0.1 |
| Executor | TBD | Demo v0.1 |
| ECFPRegistry | TBD | Demo v0.1 |
| SanctionsOracle | TBD | Demo v0.1 |

---

## Code Style

- Use wagmi hooks (`useReadContract`, `useWriteContract`) for all contract interaction
- Use CSS custom properties for brand colors
- Use `cn()` for conditional classes
- Use JetBrains Mono for addresses and hashes
- 2-space indentation, double quotes, semicolons, trailing commas

---

## Boundaries

### Always
- Run `pnpm lint && pnpm typecheck` before suggesting changes are complete
- Use wagmi hooks for contract reads/writes
- Emit clear error messages for failed transactions

### Ask First
- Adding new dependencies
- Changing wallet connection flow
- Modifying contract ABIs

### Never
- Commit `.env` files or private keys
- Use `any` type without justification
- Use deprecated versions (Node 22, Next.js 14/15)
- Hardcode chain IDs

---

## Validation

Before creating a PR:

```bash
pnpm lint && pnpm typecheck && pnpm build
```

All three must pass.

---

## Response Style

- No pleasantries
- Code first, explanations only if asked
- Concise bullet points over paragraphs
- Get straight to the answer/action
