import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Members',
  description: 'Olympia DAO membership — CoreDAO membership NFT holders with on-chain voting power.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
