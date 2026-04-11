import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Proposals',
    template: '%s | Proposals : Olympia Governance',
  },
  description: 'Browse and vote on Olympia governance proposals for Ethereum Classic.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
