import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Treasury',
  description: 'Olympia protocol treasury : funded by basefee revenue, governed on-chain.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
