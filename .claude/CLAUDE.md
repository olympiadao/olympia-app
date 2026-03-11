# Olympia App — Claude Code Instructions

## Project Context

CoreDAO governance application for the Olympia upgrade on Ethereum Classic. Provides proposal browsing, ECFP submission, voting UI, sanctions status, and member NFT management. Interacts with on-chain governance contracts (ECIP-1113, ECIP-1114, ECIP-1119).

**Repo:** `olympiadao/olympia-app`
**Deploy:** Vercel

## Tech Stack

- Next.js 16 (App Router, Turbopack)
- React 19, TypeScript 5 (strict)
- Tailwind CSS 4 (CSS-first config)
- wagmi 2 + viem (wallet/contract interaction)
- Lucide React (icons)
- Vitest 3 (testing)
- pnpm 10, Node 24

## Quick Commands

```bash
pnpm dev          # Dev server (Turbopack)
pnpm build        # Production build
pnpm lint         # ESLint
pnpm typecheck    # tsc --noEmit
pnpm test         # Run tests
```

## Brand

- Primary: `#00ffae` (neon green)
- Background: `#0a0f10` (dark)
- Font: Inter (UI) + JetBrains Mono (code/addresses)
- Dark-first design, Olympia palette only

## Key Contracts (Mordor Testnet, Chain 63)

| Contract | Address |
|----------|---------|
| OlympiaGovernor | `0xEdbD61F1cE825CF939beBB422F8C914a69826dDA` |
| OlympiaExecutor | `0x94d4f74dDdE715Ed195B597A3434713690B14e97` |
| TimelockController | `0x1E0fADee5540a77012f1944fcce58677fC087f6e` |
| ECFPRegistry | `0xcB532fe70299D53Cc81B5F6365f56A108784d05d` |
| SanctionsOracle | `0xEeeb33c8b7C936bD8e72A859a3e1F9cc8A26f3B4` |
| OlympiaMemberNFT | `0x720676EBfe45DECfC43c8E9870C64413a2480EE0` |
| OlympiaTreasury | `0xd6165F3aF4281037bce810621F62B43077Fb0e37` |

Addresses defined in `src/lib/contracts/addresses.ts`. ABIs in `src/lib/contracts/abis/`.

## Related ECIPs

- ECIP-1113: DAO Governance Framework (OlympiaGovernor, Executor, Timelock)
- ECIP-1114: ECFP Funding Process (ECFPRegistry)
- ECIP-1119: Sanctions Constraint (SanctionsOracle)

## Boundaries

### Always Do
- Run `pnpm lint && pnpm typecheck` before commits
- Use wagmi hooks for contract reads/writes
- Use JetBrains Mono for contract addresses and hashes
- Keep contract addresses consistent with olympia-framework README

### Ask First
- Adding new dependencies
- Changing wallet connection flow
- Modifying contract ABIs

### Never Do
- Commit `.env` files or private keys
- Use `any` type without justification
- Skip TypeScript errors with `@ts-ignore`
- Use deprecated versions (Node 22, Next.js 14/15)
- Hardcode chain IDs — use config

## Validation

Before every commit:

```bash
pnpm lint && pnpm typecheck && pnpm build
```

All three must pass.
