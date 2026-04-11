import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How It Works',
  description: 'Learn how Olympia governance works : from proposal submission to on-chain execution.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
