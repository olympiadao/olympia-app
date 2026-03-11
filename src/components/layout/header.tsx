"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border-default bg-bg-primary/80 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 md:hidden">
        <span className="text-lg font-bold text-brand-green">Olympia</span>
      </div>
      <div className="hidden md:block" />
      <ConnectButton
        showBalance={true}
        chainStatus="icon"
        accountStatus="address"
      />
    </header>
  );
}
