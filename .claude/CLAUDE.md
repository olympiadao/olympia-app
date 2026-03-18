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

## Key Contracts (Demo v0.2 — Deterministic CREATE2, identical on Chain 61 + 63)

| Contract | Address |
|----------|---------|
| OlympiaGovernor | `0xb85dbc899472756470ef4033b9637ff8fa2fd23d` |
| OlympiaExecutor | `0x64624f74f77639cba268a6c8bedc2778b707ef9a` |
| TimelockController | `0xa5839b3e9445f7ee7affdbc796dc0601f9b976c2` |
| ECFPRegistry | `0xfb4de5674a6b9a301d16876795a74f3bdacfa722` |
| SanctionsOracle | `0xff2b8d7937d908d81c72d20ac99302ee6acc2709` |
| OlympiaMemberNFT | `0x73e78d3a3470396325b975fcafa8105a89a9e672` |
| OlympiaTreasury | `0x035b2e3c189B772e52F4C3DA6c45c84A3bB871bf` |

Addresses defined in `src/lib/contracts/addresses.ts`. ABIs in `src/lib/contracts/abis/`.

## Supported Chains

- Mordor Testnet (chain 63) — default, RPC: `https://rpc.mordor.etccooperative.org`
- ETC Mainnet (chain 61) — RPC: `https://etc.rivet.link`

Chain config in `src/lib/utils/chains.ts`. Hooks in `src/lib/hooks/use-chain.ts`.

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
