"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ChainSelector } from "@/components/chain-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { useChainMeta } from "@/lib/hooks/use-chain";

export function Header() {
  const { isTestnet } = useChainMeta();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border-default bg-background/80 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold text-brand-green md:hidden">Olympia</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border-brand bg-brand-green-subtle px-2.5 py-0.5 text-xs font-medium text-brand-green">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-green" />
          Demo v0.2{isTestnet ? " · Mordor Testnet" : " · Ethereum Classic"}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <ChainSelector />
        <ConnectButton
          showBalance={true}
          chainStatus="none"
          accountStatus="address"
        />
      </div>
    </header>
  );
}
