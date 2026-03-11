"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useProposals } from "@/lib/hooks/use-proposals";
import { useTreasuryBalance } from "@/lib/hooks/use-treasury";
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
import { ScrollText, Landmark, Users, Info } from "lucide-react";
import {
  parseProposalDescription,
  proposalCategoryColors,
} from "@/lib/utils/proposal-categories";

export default function Dashboard() {
  const { proposals, isLoading: proposalsLoading } = useProposals();
  const { data: balance } = useTreasuryBalance();
  const { data: totalMembers } = useTotalMembers();
  const { data: blockStats } = useBlockStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-text-muted">
          Olympia CoreDAO Governance — Demo v0.1
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<ScrollText className="h-5 w-5 text-brand-green" />}
          label="Proposals"
          value={proposalsLoading ? "…" : proposals.length.toString()}
        />
        <StatCard
          icon={<Landmark className="h-5 w-5 text-brand-amber" />}
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
            <strong className="text-text-primary">2.</strong> Any member can{" "}
            <Link
              href="/proposals/new"
              className="text-brand-green hover:underline"
            >
              create a proposal
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
}: {
  proposalId: bigint;
  description: string;
  voteEnd: bigint;
  blockStats: { currentBlock: number; avgBlockTimeMs: number } | undefined;
}) {
  const { state } = useProposalState(proposalId);
  const parsed = parseProposalDescription(description);

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
      <Card className="flex items-center justify-between transition-colors hover:border-border-brand">
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
        {state !== undefined && <ProposalStatus state={state} />}
      </Card>
    </Link>
  );
}
