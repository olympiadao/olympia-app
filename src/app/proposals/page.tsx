"use client";

import Link from "next/link";
import { Plus, Info, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProposalStatus } from "@/components/proposals/proposal-status";
import { useProposals } from "@/lib/hooks/use-proposals";
import { useProposalState } from "@/lib/hooks/use-proposal-state";
import { useBlockStats } from "@/lib/hooks/use-block-stats";
import { truncateAddress } from "@/lib/utils/format";
import { ProposalState } from "@/lib/utils/proposal-states";
import {
  blocksRemaining,
  estimateTimeMs,
  formatCountdown,
} from "@/lib/utils/block-time";
import {
  parseProposalDescription,
  proposalCategoryColors,
  stripMarkdown,
} from "@/lib/utils/proposal-categories";
import { decodeProposalActions } from "@/lib/utils/decode-actions";
import { useCheckSanction } from "@/lib/hooks/use-admin";

export default function ProposalsPage() {
  const { proposals, isLoading, error } = useProposals();
  const { data: blockStats } = useBlockStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Proposals</h1>
          <p className="mt-1 text-sm text-text-muted">
            Browse and vote on governance proposals
          </p>
        </div>
        <Link href="/proposals/new">
          <Button size="md">
            <Plus className="h-4 w-4" />
            New Proposal
          </Button>
        </Link>
      </div>

      {/* Proposal Lifecycle Guide */}
      <Card>
        <details className="group">
          <summary className="flex cursor-pointer items-center gap-2 list-none">
            <Info className="h-4 w-4 text-semantic-info" />
            <span className="text-sm font-semibold">Proposal Lifecycle</span>
            <ChevronDown className="ml-auto h-4 w-4 text-text-subtle transition-transform group-open:rotate-180" />
          </summary>

          <div className="mt-4 space-y-4">
            {/* Happy path */}
            <div className="flex flex-wrap items-start gap-y-4">
              <FlowStep label="Pending" color="text-text-muted bg-bg-elevated" desc="Voting delay (1 block)" />
              <FlowArrow />
              <div className="flex flex-col items-center gap-1">
                <FlowStep label="Active" color="text-brand-green bg-brand-green-subtle" desc="Voting open" />
                <div className="flex gap-2">
                  <TerminalBranch label="Rejected" color="text-orange-400" desc="No quorum or majority" />
                  <TerminalBranch label="Blocked" color="text-semantic-error" desc="Sanctioned recipient" />
                </div>
              </div>
              <FlowArrow />
              <div className="flex flex-col items-center gap-1">
                <FlowStep label="Succeeded" color="text-brand-green bg-brand-green-subtle" desc="Passed" />
                <TerminalBranch label="Expired" color="text-text-subtle" desc="Not queued in time" />
              </div>
              <FlowArrow />
              <FlowStep label="Queued" color="text-text-muted bg-bg-elevated" desc="Timelock (1 hour)" />
              <FlowArrow />
              <FlowStep label="Executed" color="text-brand-green bg-brand-green-subtle" desc="Complete" />
            </div>
          </div>
        </details>
      </Card>

      {isLoading ? (
        <p className="text-sm text-text-muted">Loading proposals…</p>
      ) : error ? (
        <Card>
          <p className="text-sm text-semantic-error">
            Failed to load proposals: {error.message}
          </p>
        </Card>
      ) : proposals.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-text-muted">No proposals yet</p>
          <Link href="/proposals/new">
            <Button variant="secondary" size="sm" className="mt-4">
              Create the first proposal
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {proposals.map((p) => (
            <ProposalCard
              key={p.proposalId.toString()}
              proposalId={p.proposalId}
              description={p.description}
              proposer={p.proposer}
              blockNumber={p.blockNumber}
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
  );
}

function ProposalCard({
  proposalId,
  description,
  proposer,
  blockNumber,
  voteEnd,
  blockStats,
  targets,
  values,
  calldatas,
}: {
  proposalId: bigint;
  description: string;
  proposer: `0x${string}`;
  blockNumber: bigint;
  voteEnd: bigint;
  blockStats: { currentBlock: number; avgBlockTimeMs: number } | undefined;
  targets: readonly `0x${string}`[];
  values: readonly bigint[];
  calldatas: readonly `0x${string}`[];
}) {
  const { state } = useProposalState(proposalId);
  const parsed = parseProposalDescription(description);
  const title = parsed.title;
  const body = parsed.body;

  const treasuryRecipient = decodeProposalActions(targets, values, calldatas)
    .find((a) => a.recipient)?.recipient;
  const { data: recipientSanctioned } = useCheckSanction(treasuryRecipient);
  // Active threat: sanctioned recipient on a live proposal (can still cancel)
  const isSanctioned =
    recipientSanctioned === true &&
    state !== undefined &&
    state !== ProposalState.Defeated &&
    state !== ProposalState.Canceled &&
    state !== ProposalState.Executed &&
    state !== ProposalState.Expired;
  // Terminal: proposal ended while recipient was sanctioned
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
      <Card className={`transition-colors hover:border-border-brand ${isSanctioned || isBlocked ? "border-semantic-error/30" : ""}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {parsed.category && (
                <span
                  className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${proposalCategoryColors[parsed.category]}`}
                >
                  {parsed.category}
                </span>
              )}
              <p className="text-base font-semibold">{title}</p>
            </div>
            {body && (
              <p className="mt-1 line-clamp-2 text-sm text-text-muted">
                {stripMarkdown(body)}
              </p>
            )}
            <div className="mt-2 flex items-center gap-3 text-xs text-text-subtle">
              <span>
                by{" "}
                <span className="font-mono">{truncateAddress(proposer)}</span>
              </span>
              <span>Block #{blockNumber.toString()}</span>
              {countdown && (
                <span className="text-brand-green">~{countdown} left</span>
              )}
            </div>
          </div>
          {state !== undefined && <ProposalStatus state={state} sanctioned={isSanctioned} blocked={isBlocked} />}
        </div>
      </Card>
    </Link>
  );
}

function FlowStep({
  label,
  color,
  desc,
}: {
  label: string;
  color: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5" title={desc}>
      <span
        className={`rounded-full border border-border-subtle px-3 py-1 text-xs font-medium ${color}`}
      >
        {label}
      </span>
      <span className="text-[10px] text-text-subtle">{desc}</span>
    </div>
  );
}

function FlowArrow() {
  return (
    <span className="flex items-center px-1 text-text-subtle" aria-hidden>
      <span className="hidden text-xs sm:inline">→</span>
      <span className="text-xs sm:hidden">↓</span>
    </span>
  );
}

function TerminalBranch({
  label,
  color,
  desc,
}: {
  label: string;
  color: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5" title={desc}>
      <span className="text-[10px] text-text-subtle" aria-hidden>↓</span>
      <span
        className={`rounded-full border border-border-subtle bg-bg-elevated px-2 py-0.5 text-[10px] font-medium ${color}`}
      >
        {label}
      </span>
    </div>
  );
}
