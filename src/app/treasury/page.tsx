"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useTreasuryBalance } from "@/lib/hooks/use-treasury";
import { formatEtc } from "@/lib/utils/format";
import { useChainContracts, useExplorerUrl } from "@/lib/hooks/use-chain";
import { Landmark, ExternalLink, Info } from "lucide-react";

export default function TreasuryPage() {
  const { data: balance, isLoading } = useTreasuryBalance();
  const contracts = useChainContracts();
  const explorerUrl = useExplorerUrl();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Treasury</h1>
        <p className="mt-1 text-sm text-text-muted">
          CoreDAO treasury balance and execution history
        </p>
      </div>

      <Card>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-treasury-subtle">
            <Landmark className="h-6 w-6 text-brand-treasury" />
          </div>
          <div>
            <p className="text-sm text-text-muted">Treasury Balance</p>
            <p className="text-3xl font-bold tracking-tight text-brand-treasury">
              {isLoading ? "…" : balance ? `${formatEtc(balance.value)} METC` : "0 METC"}
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contract Addresses</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          <AddressRow
            label="Treasury"
            address={contracts.treasury}
            explorerUrl={explorerUrl}
          />
          <AddressRow
            label="Executor"
            address={contracts.executor}
            explorerUrl={explorerUrl}
          />
          <AddressRow
            label="Timelock"
            address={contracts.timelock}
            explorerUrl={explorerUrl}
          />
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Execution Path</CardTitle>
        </CardHeader>
        <div className="space-y-2 text-sm text-text-secondary">
          <p>1. ECFP draft submitted to ECFPRegistry (5 min review period)</p>
          <p>2. Admin activates draft → Governor proposal created</p>
          <p>3. Governance vote (100 blocks, ~22 min on Mordor)</p>
          <p>4. Proposal queued in TimelockController (1 hour)</p>
          <p>5. OlympiaExecutor checks sanctions (Layer 3), calls Treasury.withdraw()</p>
          <p>6. Treasury releases funds to recipient</p>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-4 w-4 text-semantic-info" />
            Treasury Architecture (v0.2)
          </CardTitle>
        </CardHeader>
        <div className="space-y-3 text-sm text-text-secondary">
          <p>
            The treasury is a <strong className="text-text-primary">pure Solidity contract</strong> with
            an <strong className="text-text-primary">immutable executor</strong> address
            set at deployment. There are no admin functions, no roles, and no
            upgrade path — the executor address can never be changed.
          </p>
          <p>
            Only two functions exist:{" "}
            <code className="rounded bg-bg-elevated px-1.5 py-0.5 font-mono text-xs text-text-primary">
              withdraw(to, amount)
            </code>{" "}
            (callable only by the immutable executor) and{" "}
            <code className="rounded bg-bg-elevated px-1.5 py-0.5 font-mono text-xs text-text-primary">
              receive()
            </code>{" "}
            (accepts donations from any address).
          </p>
          <p>
            The Executor is called by the TimelockController after a proposal
            passes the full governance pipeline. The execution path is:
          </p>
          <p className="font-mono text-xs text-text-muted">
            Governor → Timelock → Executor → Treasury.withdraw()
          </p>
          <p>
            <strong className="text-text-primary">Layer 3 sanctions check:</strong> The
            Executor verifies the recipient is not on the sanctions list before
            calling Treasury.withdraw(). If sanctioned, the withdrawal reverts
            and funds remain safe.
          </p>
        </div>
      </Card>
    </div>
  );
}

function AddressRow({
  label,
  address,
  explorerUrl,
}: {
  label: string;
  address: string;
  explorerUrl: (type: "tx" | "address" | "block", value: string) => string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-elevated px-3 py-2">
      <span className="text-sm text-text-muted">{label}</span>
      <a
        href={explorerUrl("address", address)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 font-mono text-sm text-brand-green hover:underline"
      >
        {address.slice(0, 6)}…{address.slice(-4)}
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}
