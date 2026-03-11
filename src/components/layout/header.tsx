"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border-default bg-bg-primary/80 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold text-brand-green md:hidden">Olympia</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border-brand bg-brand-green-subtle px-2.5 py-0.5 text-xs font-medium text-brand-green">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-green" />
          Demo · Mordor
        </span>
      </div>
      <ConnectButton
        showBalance={true}
        chainStatus="icon"
        accountStatus="address"
      />
    </header>
  );
}
