"use client";

import { useRef, useState } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { ChevronDown, Check } from "lucide-react";
import { useActiveChainId } from "@/lib/hooks/use-chain";
import { cn } from "@/lib/utils/cn";

interface ChainOption {
  id: number;
  name: string;
  shortName: string;
  icon: string;
  isTestnet: boolean;
}

const CHAINS: ChainOption[] = [
  {
    id: 63,
    name: "Mordor Testnet",
    shortName: "Mordor",
    icon: "/chains/mordor.svg",
    isTestnet: true,
  },
  {
    id: 61,
    name: "Ethereum Classic",
    shortName: "ETC",
    icon: "/chains/etc.svg",
    isTestnet: false,
  },
];

export function ChainSelector() {
  const chainId = useActiveChainId();
  const { isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = CHAINS.find((c) => c.id === chainId) ?? CHAINS[0];
  if (!current) return null;

  // Close on outside click
  function handleBlur(e: React.FocusEvent) {
    if (!ref.current?.contains(e.relatedTarget as Node)) {
      setIsOpen(false);
    }
  }

  function handleSwitch(chain: ChainOption) {
    if (chain.id !== chainId && isConnected) {
      switchChain({ chainId: chain.id });
    }
    setIsOpen(false);
  }

  return (
    <div ref={ref} className="relative" onBlur={handleBlur}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
          isOpen
            ? "border-brand-green bg-bg-elevated"
            : "border-border-default bg-bg-surface hover:border-brand-green"
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.icon}
          alt={current.name}
          className="h-5 w-5 rounded-full"
        />
        <span className="hidden sm:inline">{current.shortName}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-text-muted transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-50 min-w-[200px] rounded-xl border border-border-default bg-bg-surface p-1.5 shadow-lg">
          {CHAINS.map((chain) => (
            <button
              key={chain.id}
              onClick={() => handleSwitch(chain)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                chain.id === chainId
                  ? "bg-bg-elevated"
                  : "hover:bg-bg-elevated"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={chain.icon}
                alt={chain.name}
                className="h-5 w-5 rounded-full"
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{chain.name}</span>
                {chain.isTestnet && (
                  <span className="text-[11px] text-orange-400">Testnet</span>
                )}
              </div>
              {chain.id === chainId && (
                <Check className="ml-auto h-4 w-4 text-brand-green" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
