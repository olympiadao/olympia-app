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
- Full treasury dashboard — 6 KPI cards (balance, mined income, basefee, donations, withdrawals, tx count), balance history chart (recharts), transaction table via Blockscout API v2
- Multi-chain: Mordor Testnet (63) + ETC Mainnet (61)
- Block countdown timers for voting and timelock periods
- Dark/light theme with RainbowKit wallet integration

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, TypeScript 5 (strict) |
| Styling | Tailwind CSS 4, Olympia brand tokens |
| Chain | wagmi 2 + viem 2 (contract interaction) |
| Wallet | RainbowKit 2 |
| Charts | recharts 3 |
| Data | @tanstack/react-query 5 (Blockscout API v2) |
| Icons | Lucide React |
| Testing | Vitest 3 |
| Package Manager | pnpm 10 |

## Deployed Contracts (Demo v0.3)

Identical addresses on Mordor (63) and ETC (61) via deterministic CREATE2 (salt: `OLYMPIA_DEMO_V0_3`).

All addresses in [`src/lib/contracts/contracts.json`](src/lib/contracts/contracts.json) — single source of truth.

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

- `/` — Dashboard (stats, 6 treasury KPI cards, balance history chart, recent proposals)
- `/proposals` — Proposals list with category filters
- `/proposals/new` — Create ECFP proposal
- `/proposals/[id]` — Proposal detail, voting, lifecycle timeline
- `/proposals/drafts` — Saved proposal drafts
- `/members` — NFT holders
- `/treasury` — Full treasury dashboard (KPIs, balance chart, transaction table, architecture)
- `/how-it-works` — Governance explainer
- `/contracts` — Deployed contract addresses
- `/admin` — Maintainer tools (sanctions, NFT minting)
- `/config` — Demo configuration

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
