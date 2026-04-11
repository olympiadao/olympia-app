"use client";

import { ExternalLink } from "lucide-react";
import { useExplorerUrl } from "@/lib/hooks/use-chain";
import { deployment } from "@/lib/contracts/addresses";

const contracts = Object.values(deployment.contracts);

export default function ContractsPage() {
  const explorerUrl = useExplorerUrl();

  return (
    <div>
      <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-widest text-brand-green">
        Deployed Contracts
      </p>
      <h1 className="mb-2 text-2xl font-bold tracking-tight">
        On-Chain Infrastructure
      </h1>
      <p className="mb-8 max-w-2xl text-sm text-text-muted">
        Nine contracts deployed via deterministic CREATE2 : identical addresses
        on Mordor Testnet and ETC Mainnet.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {contracts.map((contract) => (
          <a
            key={contract.name}
            href={explorerUrl("address", contract.address)}
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-xl border border-border-default bg-bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-border-brand"
          >
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold">{contract.name}</h3>
              <ExternalLink className="h-3.5 w-3.5 text-text-subtle transition-colors group-hover:text-brand-green" />
            </div>
            <p className="mb-2 text-xs text-text-muted">{contract.role}</p>
            <code className="block truncate font-mono text-xs text-brand-green">
              {contract.address}
            </code>
          </a>
        ))}
      </div>
    </div>
  );
}
