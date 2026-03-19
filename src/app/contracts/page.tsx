"use client";

import { ExternalLink } from "lucide-react";
import { useExplorerUrl } from "@/lib/hooks/use-chain";

const contracts = [
  {
    name: "OlympiaTreasury",
    address: "0x035b2e3c189B772e52F4C3DA6c45c84A3bB871bf",
    role: "Protocol-funded vault",
  },
  {
    name: "SanctionsOracle",
    address: "0xfF2B8D7937D908D81C72D20AC99302EE6ACc2709",
    role: "OFAC compliance layer",
  },
  {
    name: "OlympiaMemberNFT",
    address: "0x73e78d3a3470396325b975FcAFA8105A89A9E672",
    role: "Non-transferable membership",
  },
  {
    name: "TimelockController",
    address: "0xA5839b3e9445f7eE7AffdBC796DC0601f9b976C2",
    role: "Security delay enforcement",
  },
  {
    name: "OlympiaGovernor",
    address: "0xB85dbc899472756470EF4033b9637ff8fa2FD23D",
    role: "Proposal and voting engine",
  },
  {
    name: "OlympiaExecutor",
    address: "0x64624f74F77639CbA268a6c8bEDC2778B707eF9a",
    role: "Treasury withdrawal executor",
  },
  {
    name: "ECFPRegistry",
    address: "0xFB4De5674a6b9a301d16876795a74f3bdacfa722",
    role: "Proposal metadata registry",
  },
];

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
        Seven contracts deployed via deterministic CREATE2 — identical addresses
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
