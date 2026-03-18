# Olympia Governance App

CoreDAO governance UI for Ethereum Classic — browse proposals, vote, manage treasury, and participate in on-chain governance.

**URL:** [app.olympiadao.org](https://app.olympiadao.org)

## Features

- Proposal browsing with category badges (Security, Infrastructure, Development, Governance, Community, Operations)
- ECFP submission with markdown description and treasury action parameters
- Voting with reasons (For/Against/Abstain)
- Sanctions 3-layer defense (form validation, active check, executor enforcement)
- Proposal lifecycle pipeline: Propose → Vote → Queue → Execute → Disclose
- Member NFT management
- Treasury balance and contract info
- Multi-chain: Mordor Testnet (63) + ETC Mainnet (61)
- Block countdown timers for voting and timelock periods

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, TypeScript 5 (strict) |
| Styling | Tailwind CSS 4, Olympia brand tokens |
| Chain | wagmi 2 + viem 2 (contract interaction) |
| Wallet | RainbowKit 2 |
| Icons | Lucide React |
| Testing | Vitest 3 |
| Package Manager | pnpm 10 |

## Deployed Contracts (Demo v0.2)

Identical addresses on Mordor (63) and ETC (61) via deterministic CREATE2:

| Contract | Address |
|----------|---------|
| OlympiaTreasury | `0x035b2e3c189B772e52F4C3DA6c45c84A3bB871bf` |
| OlympiaGovernor | `0xB85dbc899472756470EF4033b9637ff8fa2FD23D` |
| OlympiaExecutor | `0x64624f74F77639CbA268a6c8bEDC2778B707eF9a` |
| TimelockController | `0xA5839b3e9445f7eE7AffdBC796DC0601f9b976C2` |
| ECFPRegistry | `0xFB4De5674a6b9a301d16876795a74f3bdacfa722` |
| OlympiaMemberNFT | `0x73e78d3a3470396325b975FcAFA8105A89A9E672` |
| SanctionsOracle | `0xfF2B8D7937D908D81C72D20AC99302EE6ACc2709` |

## Development

```bash
pnpm install
pnpm dev          # Dev server (Turbopack)
pnpm build        # Production build
pnpm lint         # ESLint
pnpm typecheck    # TypeScript check
pnpm test         # Run tests
```

## Pages

- `/` — Dashboard (stats, recent proposals, treasury balance)
- `/proposals` — Proposals list with category filters
- `/proposals/new` — Create ECFP proposal
- `/proposals/[id]` — Proposal detail, voting, lifecycle timeline
- `/members` — NFT holders
- `/treasury` — Treasury balance + contract info

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `demo_v0.1` | Preserved snapshot — fast-iteration development, not ECIP-aligned |
| `demo_v0.2` | Active development — spec-compliant, multi-chain, CREATE2 contracts |
| `main` | Production — deployed after Olympia activates on ETC mainnet |

## Related Repos

- [olympia-governance-contracts](https://github.com/olympiadao/olympia-governance-contracts) — Governor, Executor, ECFPRegistry, NFT, Sanctions
- [olympia-treasury-contract](https://github.com/olympiadao/olympia-treasury-contract) — Treasury vault (pure Solidity, no OZ)
- [olympia-brand](https://github.com/olympiadao/olympia-brand) — Design tokens, logos, favicons
- [olympiadao-org](https://github.com/olympiadao/olympiadao-org) — Landing page
- [olympiatreasury-org](https://github.com/olympiadao/olympiatreasury-org) — Treasury dashboard
- [ethereumclassicdao-org](https://github.com/EthereumClassicDAO/ethereumclassicdao-org) — Institutional website

## Authors

- [Cody Burns](https://github.com/realcodywburns)
- [Chris Mercer](https://github.com/chris-mercer)
