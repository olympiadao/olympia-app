# Olympia Governance App — Demo v0.1

> **Branch:** `demo_v0.1` (preserved snapshot)
> **Superseded by:** `demo_v0.2`
>
> **Note:** Demo v0.1 was a fast-iteration development branch and is not aligned to the public Olympia ECIP specifications. See `demo_v0.2` for the spec-compliant implementation.

CoreDAO governance UI for Ethereum Classic — browse proposals, vote, manage treasury.

## Version Context

Demo v0.1 was the initial governance app deployment. Key characteristics:

- **Single chain:** Mordor Testnet only (Chain 63)
- **Contracts:** OZ 5.6 treasury + OZ 5.1 governor (non-deterministic deployment)
- **Features:** Proposal browsing, ECFP submission, voting with reasons, sanctions 3-layer defense, member NFT management
- **E2E tested:** ECFP-001 executed, ECFP-002 rejected, ECFP-003 blocked (sanctions)

### Demo v0.1 Contract Addresses (Mordor)

| Contract | Address |
|----------|---------|
| OlympiaGovernor | `0xEdbD61F1cE825CF939beBB422F8C914a69826dDA` |
| OlympiaExecutor | `0x94d4f74dDdE715Ed195B597A3434713690B14e97` |
| TimelockController | `0x1E0fADee5540a77012f1944fcce58677fC087f6e` |
| ECFPRegistry | `0xcB532fe70299D53Cc81B5F6365f56A108784d05d` |
| SanctionsOracle | `0xEeeb33c8b7C936bD8e72A859a3e1F9cc8A26f3B4` |
| OlympiaMemberNFT | `0x720676EBfe45DECfC43c8E9870C64413a2480EE0` |
| OlympiaTreasury | `0xd6165F3aF4281037bce810621F62B43077Fb0e37` |

This branch is preserved as a historical snapshot. Active development continues on `demo_v0.2`.

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19, TypeScript 5 (strict)
- Tailwind CSS 4 (olympia-brand tokens)
- wagmi 2 + viem 2 (contract interaction)
- RainbowKit 2 (wallet connection)
- pnpm 10, Node 24

## Development

```bash
pnpm install
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

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `demo_v0.1` | Preserved snapshot — initial Mordor-only governance UI |
| `demo_v0.2` | Active development — multi-chain, CREATE2 contracts, enhanced UX |
| `main` | Production — deployed after Olympia activates on ETC mainnet |

## Authors

- [Cody Burns](https://github.com/realcodywburns)
- [Chris Mercer](https://github.com/chris-mercer)
