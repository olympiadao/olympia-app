"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useTreasuryStats } from "@/lib/hooks/use-treasury";
import { useChainContracts, useExplorerUrl, useChainMeta } from "@/lib/hooks/use-chain";
import {
  ExternalLink,
  Info,
  Wallet,
  Pickaxe,
  Flame,
  Heart,
  TrendingDown,
  Activity,
} from "lucide-react";
import { KpiCard, formatAmount } from "@/components/treasury/kpi-card";
import { BalanceChart } from "@/components/treasury/balance-chart";
import { TransactionsTable } from "@/components/treasury/transactions-table";

export default function TreasuryPage() {
  const { data: stats, isLoading, error } = useTreasuryStats();
  const contracts = useChainContracts();
  const explorerUrl = useExplorerUrl();
  const { symbol } = useChainMeta();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Olympia{" "}
            <span className="text-brand-green">Treasury</span>
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            Live monitoring of the protocol-funded vault for Ethereum Classic.
          </p>
        </div>
        <a
          href={explorerUrl("address", contracts.treasury)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-brand-green px-5 py-2.5 text-sm font-semibold text-background transition-all duration-200 hover:brightness-110"
        >
          Explorer
          <ExternalLink size={14} />
        </a>
      </div>

      {/* Vault address */}
      <div className="rounded-lg border border-border-default bg-bg-elevated px-5 py-3">
        <span className="mr-3 text-xs font-medium uppercase tracking-wider text-text-subtle">
          Vault
        </span>
        <code className="font-mono text-sm text-brand-green">
          {contracts.treasury}
        </code>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          label="Balance"
          value={stats ? `${formatAmount(stats.balance.formatted)} ${symbol}` : "\u2014"}
          icon={Wallet}
          loading={isLoading}
          error={!!error}
        />
        <KpiCard
          label="Mined Income"
          value={stats ? `${formatAmount(stats.minedIncome)} ${symbol}` : "\u2014"}
          subtitle={`Block rewards + tx fees${stats ? ` \u00b7 ${stats.blockCount} blocks` : ""}`}
          icon={Pickaxe}
          loading={isLoading}
          error={!!error}
        />
        <KpiCard
          label="BaseFee"
          value={stats ? `${formatAmount(stats.baseFeeIncome)} ${symbol}` : "\u2014"}
          subtitle="Activates with Olympia"
          icon={Flame}
          loading={isLoading}
          error={!!error}
        />
        <KpiCard
          label="Donations"
          value={stats ? `${formatAmount(stats.totalDonations)} ${symbol}` : "\u2014"}
          subtitle="Direct transfers from wallets"
          icon={Heart}
          loading={isLoading}
          error={!!error}
        />
        <KpiCard
          label="Withdrawals"
          value={stats ? `${formatAmount(stats.totalOutflow)} ${symbol}` : "\u2014"}
          subtitle="Governance-approved ECFPs"
          icon={TrendingDown}
          loading={isLoading}
          error={!!error}
        />
        <KpiCard
          label="Transactions"
          value={stats ? stats.txCount.toString() : "\u2014"}
          icon={Activity}
          loading={isLoading}
          error={!!error}
        />
      </div>

      {/* Balance History Chart */}
      <BalanceChart />

      {/* Transactions Table */}
      <TransactionsTable />

      {/* Contract Addresses */}
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

      {/* Execution Path */}
      <Card>
        <CardHeader>
          <CardTitle>Execution Path</CardTitle>
        </CardHeader>
        <div className="space-y-2 text-sm text-text-secondary">
          <p>1. ECFP draft submitted to ECFPRegistry (5 min review period)</p>
          <p>2. Maintainer activates draft → Governor proposal created</p>
          <p>3. Governance vote (100 blocks, ~22 min on Mordor)</p>
          <p>4. Proposal queued in TimelockController (1 hour)</p>
          <p>5. OlympiaExecutor checks sanctions (Layer 3), calls Treasury.withdraw()</p>
          <p>6. Treasury releases funds to recipient</p>
        </div>
      </Card>

      {/* Architecture */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-4 w-4 text-semantic-info" />
            Treasury Architecture (v0.3)
          </CardTitle>
        </CardHeader>
        <div className="space-y-3 text-sm text-text-secondary">
          <p>
            The treasury is a <strong className="text-text-primary">pure Solidity contract</strong> with
            an <strong className="text-text-primary">immutable executor</strong> address
            set at deployment. There are no admin functions, no roles, and no
            upgrade path : the executor address can never be changed.
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
