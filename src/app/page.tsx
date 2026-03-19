"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useProposals } from "@/lib/hooks/use-proposals";
import { useTreasuryBalance, useTreasuryStats } from "@/lib/hooks/use-treasury";
import { useTotalMembers } from "@/lib/hooks/use-member-nft";
import { formatEtc } from "@/lib/utils/format";
import { ProposalStatus } from "@/components/proposals/proposal-status";
import { useProposalState } from "@/lib/hooks/use-proposal-state";
import { useBlockStats } from "@/lib/hooks/use-block-stats";
import { ProposalState } from "@/lib/utils/proposal-states";
import {
  blocksRemaining,
  estimateTimeMs,
  formatCountdown,
} from "@/lib/utils/block-time";
import Link from "next/link";
import {
  ScrollText,
  Landmark,
  Users,
  Info,
  ExternalLink,
  Wallet,
  Pickaxe,
  Flame,
  Heart,
  TrendingDown,
  Activity,
} from "lucide-react";
import {
  parseProposalDescription,
  proposalCategoryColors,
} from "@/lib/utils/proposal-categories";
import { decodeProposalActions } from "@/lib/utils/decode-actions";
import { useCheckSanction } from "@/lib/hooks/use-admin";
import { useActiveChainId, useExplorerUrl, useChainContracts, useChainMeta } from "@/lib/hooks/use-chain";
import { KpiCard, formatAmount } from "@/components/treasury/kpi-card";
import { BalanceChart } from "@/components/treasury/balance-chart";

export default function Dashboard() {
  const { proposals, isLoading: proposalsLoading } = useProposals();
  const { data: balance } = useTreasuryBalance();
  const { data: stats, isLoading: statsLoading, error: statsError } = useTreasuryStats();
  const { data: totalMembers } = useTotalMembers();
  const { data: blockStats } = useBlockStats();
  const explorerUrl = useExplorerUrl();
  const contracts = useChainContracts();
  const { symbol } = useChainMeta();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-text-muted">
          Olympia CoreDAO Governance — Demo v0.2
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<ScrollText className="h-5 w-5 text-brand-green" />}
          label="Proposals"
          value={proposalsLoading ? "…" : proposals.length.toString()}
        />
        <StatCard
          icon={<Landmark className="h-5 w-5 text-brand-treasury" />}
          label="Treasury"
          value={balance ? `${formatEtc(balance.value)} METC` : "…"}
        />
        <StatCard
          icon={<Users className="h-5 w-5 text-semantic-info" />}
          label="Members"
          value={
            totalMembers !== undefined
              ? (totalMembers as bigint).toString()
              : "…"
          }
        />
      </div>

      {/* Treasury Section */}
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-widest text-brand-green">
              Live Data
            </p>
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
              Olympia{" "}
              <span className="text-brand-green">Treasury</span>
            </h2>
            <p className="mt-1 text-sm text-text-muted">
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
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="rounded-lg border border-border-default bg-bg-elevated px-4 py-2.5">
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
            loading={statsLoading}
            error={!!statsError}
          />
          <KpiCard
            label="Mined Income"
            value={stats ? `${formatAmount(stats.minedIncome)} ${symbol}` : "\u2014"}
            subtitle={`Block rewards + tx fees${stats ? ` \u00b7 ${stats.blockCount} blocks` : ""}`}
            icon={Pickaxe}
            loading={statsLoading}
            error={!!statsError}
          />
          <KpiCard
            label="BaseFee"
            value={stats ? `${formatAmount(stats.baseFeeIncome)} ${symbol}` : "\u2014"}
            subtitle="Activates with Olympia"
            icon={Flame}
            loading={statsLoading}
            error={!!statsError}
          />
          <KpiCard
            label="Donations"
            value={stats ? `${formatAmount(stats.totalDonations)} ${symbol}` : "\u2014"}
            subtitle="Direct transfers from wallets"
            icon={Heart}
            loading={statsLoading}
            error={!!statsError}
          />
          <KpiCard
            label="Withdrawals"
            value={stats ? `${formatAmount(stats.totalOutflow)} ${symbol}` : "\u2014"}
            subtitle="Governance-approved ECFPs"
            icon={TrendingDown}
            loading={statsLoading}
            error={!!statsError}
          />
          <KpiCard
            label="Transactions"
            value={stats ? stats.txCount.toString() : "\u2014"}
            icon={Activity}
            loading={statsLoading}
            error={!!statsError}
          />
        </div>

        {/* Balance History Chart */}
        <BalanceChart />
      </div>

      {/* How Governance Works */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-4 w-4 text-semantic-info" />
            How Governance Works
          </CardTitle>
        </CardHeader>
        <div className="space-y-2 text-sm text-text-secondary">
          <p>
            <strong className="text-text-primary">1.</strong> Members hold{" "}
            <Link href="/members" className="text-brand-green hover:underline">
              soulbound NFTs
            </Link>{" "}
            — one NFT equals one vote
          </p>
          <p>
            <strong className="text-text-primary">2.</strong> Anyone can{" "}
            <Link
              href="/proposals/new"
              className="text-brand-green hover:underline"
            >
              submit a proposal
            </Link>{" "}
            (treasury withdrawal or signaling)
          </p>
          <p>
            <strong className="text-text-primary">3.</strong> Members vote
            during the voting period (100 blocks, ~22 min on Mordor)
          </p>
          <p>
            <strong className="text-text-primary">4.</strong> Passed proposals
            are queued in a{" "}
            <Link href="/treasury" className="text-brand-green hover:underline">
              timelock
            </Link>{" "}
            (1 hour on Mordor)
          </p>
          <p>
            <strong className="text-text-primary">5.</strong> After the
            timelock, proposals are executed via the Executor with a final
            sanctions check
          </p>
        </div>
      </Card>

      <div>
        <CardHeader>
          <CardTitle>Recent Proposals</CardTitle>
          <Link
            href="/proposals"
            className="text-sm text-brand-green hover:text-brand-green-hover"
          >
            View all
          </Link>
        </CardHeader>

        {proposalsLoading ? (
          <p className="text-sm text-text-muted">Loading proposals…</p>
        ) : proposals.length === 0 ? (
          <Card>
            <p className="text-center text-sm text-text-muted">
              No proposals yet. Be the first to create one.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {proposals.slice(0, 5).map((p) => (
              <ProposalRow
                key={p.proposalId.toString()}
                proposalId={p.proposalId}
                description={p.description}
                voteEnd={p.voteEnd}
                blockStats={blockStats}
                targets={p.targets}
                values={p.values}
                calldatas={p.calldatas}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-xs text-text-muted">{label}</p>
          <p className="text-xl font-bold tracking-tight">{value}</p>
        </div>
      </div>
    </Card>
  );
}

function ProposalRow({
  proposalId,
  description,
  voteEnd,
  blockStats,
  targets,
  values,
  calldatas,
}: {
  proposalId: bigint;
  description: string;
  voteEnd: bigint;
  blockStats: { currentBlock: number; avgBlockTimeMs: number } | undefined;
  targets: readonly `0x${string}`[];
  values: readonly bigint[];
  calldatas: readonly `0x${string}`[];
}) {
  const { state } = useProposalState(proposalId);
  const chainId = useActiveChainId();
  const parsed = parseProposalDescription(description);

  const treasuryRecipient = decodeProposalActions(targets, values, calldatas, chainId)
    .find((a) => a.recipient)?.recipient;
  const { data: recipientSanctioned } = useCheckSanction(treasuryRecipient);
  const isSanctioned =
    recipientSanctioned === true &&
    state !== undefined &&
    state !== ProposalState.Defeated &&
    state !== ProposalState.Canceled &&
    state !== ProposalState.Executed &&
    state !== ProposalState.Expired;
  const isBlocked =
    recipientSanctioned === true &&
    (state === ProposalState.Defeated || state === ProposalState.Canceled);

  let countdown: string | null = null;
  if (state === ProposalState.Active && blockStats) {
    const blocks = blocksRemaining(voteEnd, blockStats.currentBlock);
    if (blocks > 0) {
      const ms = estimateTimeMs(blocks, blockStats.avgBlockTimeMs);
      countdown = formatCountdown(ms);
    }
  }

  return (
    <Link href={`/proposals/${proposalId.toString()}`}>
      <Card className={`flex items-center justify-between transition-colors hover:border-border-brand ${isSanctioned || isBlocked ? "border-semantic-error/30" : ""}`}>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {parsed.category && (
              <span
                className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${proposalCategoryColors[parsed.category]}`}
              >
                {parsed.category}
              </span>
            )}
            <p className="truncate text-sm font-medium">{parsed.title}</p>
            {countdown && (
              <span className="shrink-0 text-xs text-brand-green">
                ~{countdown} left
              </span>
            )}
          </div>
          <p className="mt-0.5 font-mono text-xs text-text-subtle">
            #{proposalId.toString().slice(0, 8)}…
          </p>
        </div>
        {state !== undefined && <ProposalStatus state={state} sanctioned={isSanctioned} blocked={isBlocked} />}
      </Card>
    </Link>
  );
}
