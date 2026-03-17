"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useTreasuryBalance } from "@/lib/hooks/use-treasury";
import { formatEtc, explorerUrl } from "@/lib/utils/format";
import { contracts } from "@/lib/contracts/addresses";
import { Landmark, ExternalLink, Info } from "lucide-react";

export default function TreasuryPage() {
  const { data: balance, isLoading } = useTreasuryBalance();

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
            address={contracts[63].treasury}
          />
          <AddressRow
            label="Executor"
            address={contracts[63].executor}
          />
          <AddressRow
            label="Timelock"
            address={contracts[63].timelock}
          />
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Execution Path</CardTitle>
        </CardHeader>
        <div className="space-y-2 text-sm text-text-secondary">
          <p>1. Proposal passes governance vote (100 blocks, ~22 min)</p>
          <p>2. Proposal is queued in TimelockController (1 hour on Mordor)</p>
          <p>3. After timelock, proposal is executed</p>
          <p>4. OlympiaExecutor checks sanctions (Layer 3)</p>
          <p>5. Treasury releases funds to recipient</p>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-4 w-4 text-semantic-info" />
            How Treasury Withdrawals Work
          </CardTitle>
        </CardHeader>
        <div className="space-y-3 text-sm text-text-secondary">
          <p>
            Only the <strong className="text-text-primary">OlympiaExecutor</strong> can
            withdraw from the treasury. Direct transfers to the treasury
            contract are accepted but cannot be withdrawn except through
            governance.
          </p>
          <p>
            The Executor is called by the TimelockController after a proposal
            passes the full governance pipeline (propose → vote → queue →
            execute).
          </p>
          <p>
            <strong className="text-text-primary">Layer 3 sanctions check:</strong> The
            Executor verifies the recipient is not on the sanctions list before
            releasing funds. If the recipient is sanctioned, the withdrawal
            reverts and funds remain safe in the treasury.
          </p>
        </div>
      </Card>
    </div>
  );
}

function AddressRow({
  label,
  address,
}: {
  label: string;
  address: string;
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
