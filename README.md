# Olympia Governance App

CoreDAO governance UI for Ethereum Classic — browse proposals, vote, manage treasury, and participate in on-chain governance.

**URL:** [app.olympiadao.org](https://app.olympiadao.org)

## Built With

- [Next.js 16](https://nextjs.org) (App Router)
- [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org) (strict)
- [Tailwind CSS 4](https://tailwindcss.com)
- [wagmi](https://wagmi.sh) + [viem](https://viem.sh) — contract interaction
- [RainbowKit](https://www.rainbowkit.com) — wallet connection
- [Recharts](https://recharts.org) — treasury charts
- [@tanstack/react-query](https://tanstack.com/query) — live chain data

## Development

```bash
pnpm install
pnpm dev          # Dev server (Turbopack)
pnpm build        # Production build
pnpm lint         # ESLint
pnpm typecheck    # TypeScript check
pnpm test         # Run tests
```

## Related

- [olympia-governance-contracts](https://github.com/olympiadao/olympia-governance-contracts) — Governor, Executor, Registry
- [olympia-treasury-contract](https://github.com/olympiadao/olympia-treasury-contract) — Treasury vault
- [olympia-brand](https://github.com/olympiadao/olympia-brand) — Design tokens, logos, favicons
- [olympiadao-org](https://github.com/olympiadao/olympiadao-org) — Landing page
- [olympiatreasury-org](https://github.com/olympiadao/olympiatreasury-org) — Treasury dashboard
- [ethereumclassicdao-org](https://github.com/EthereumClassicDAO/ethereumclassicdao-org) — Institutional website

## Ethereum Classic Core Developers

- [Cody Burns](https://github.com/realcodywburns)
- [Chris Mercer](https://github.com/chris-mercer)

## License

[Apache 2.0](LICENSE)
