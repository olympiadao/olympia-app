"use client";

import { use } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProposalStatus } from "@/components/proposals/proposal-status";
import { VoteStatistics } from "@/components/proposals/vote-statistics";
import { CastVote } from "@/components/proposals/cast-vote";
import { useProposals } from "@/lib/hooks/use-proposals";
import {
  useProposalState,
  useProposalVotes,
  useProposalEta,
} from "@/lib/hooks/use-proposal-state";
import {
  useQueueProposal,
  useExecuteProposal,
} from "@/lib/hooks/use-proposal-actions";
import { useTotalMembers } from "@/lib/hooks/use-member-nft";
import { truncateAddress, explorerUrl } from "@/lib/utils/format";
import { ProposalState } from "@/lib/utils/proposal-states";
import {
  parseProposalDescription,
  proposalCategoryColors,
} from "@/lib/utils/proposal-categories";
import { useBlockStats } from "@/lib/hooks/use-block-stats";
import {
  blocksRemaining,
  estimateTimeMs,
  formatCountdown,
} from "@/lib/utils/block-time";
import { Info, Clock, Play } from "lucide-react";
import Markdown from "react-markdown";

export default function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const proposalId = BigInt(id);
  const { proposals, isLoading } = useProposals();
  const { state } = useProposalState(proposalId);
  const { forVotes, againstVotes, abstainVotes } =
    useProposalVotes(proposalId);
  const { eta: proposalEta } = useProposalEta(proposalId);
  const { data: totalSupply } = useTotalMembers();

  const { data: blockStats } = useBlockStats();

  const {
    queue,
    isPending: queuePending,
    isConfirming: queueConfirming,
    isSuccess: queueSuccess,
    error: queueError,
  } = useQueueProposal();
  const {
    execute,
    isPending: executePending,
    isConfirming: executeConfirming,
    isSuccess: executeSuccess,
    error: executeError,
  } = useExecuteProposal();

  const proposal = proposals.find((p) => p.proposalId.toString() === id);

  if (isLoading) {
    return <p className="text-sm text-text-muted">Loading…</p>;
  }

  if (!proposal) {
    return (
      <p className="text-sm text-semantic-error">Proposal not found</p>
    );
  }

  const parsed = parseProposalDescription(proposal.description);
  const title = parsed.title;
  const body = parsed.body;
  const isActive = state === ProposalState.Active;
  const isSucceeded = state === ProposalState.Succeeded;
  const isQueued = state === ProposalState.Queued;

  function handleQueue() {
    queue(
      proposal!.targets,
      proposal!.values,
      proposal!.calldatas,
      proposal!.description
    );
  }

  function handleExecute() {
    execute(
      proposal!.targets,
      proposal!.values,
      proposal!.calldatas,
      proposal!.description
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* Main content */}
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-3">
            {parsed.category && (
              <span
                className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${proposalCategoryColors[parsed.category]}`}
              >
                {parsed.category}
              </span>
            )}
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {state !== undefined && <ProposalStatus state={state} />}
          </div>
          <div className="mt-2 flex items-center gap-3 text-sm text-text-muted">
            <span>
              Proposed by{" "}
              <a
                href={explorerUrl("address", proposal.proposer)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-brand-green hover:underline"
              >
                {truncateAddress(proposal.proposer)}
              </a>
            </span>
            <span>Block #{proposal.blockNumber.toString()}</span>
          </div>
        </div>

        {/* State-specific guidance */}
        <StateGuidance
          state={state}
          voteEnd={proposal.voteEnd}
          blockStats={blockStats}
          proposalEta={proposalEta}
        />

        {body && (
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <div className="prose prose-sm prose-invert max-w-none text-text-secondary prose-headings:text-text-primary prose-strong:text-text-primary prose-code:rounded prose-code:bg-bg-elevated prose-code:px-1 prose-code:py-0.5 prose-code:text-brand-green prose-pre:bg-bg-elevated prose-a:text-brand-green">
              <Markdown>{body}</Markdown>
            </div>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Treasury Action</CardTitle>
          </CardHeader>
          <div className="space-y-2">
            {proposal.targets.map((target, i) => (
              <div
                key={i}
                className="rounded-lg border border-border-subtle bg-bg-elevated p-3"
              >
                <p className="text-xs text-text-muted">Target #{i + 1}</p>
                <p className="font-mono text-sm">
                  <a
                    href={explorerUrl("address", target)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-green hover:underline"
                  >
                    {target}
                  </a>
                </p>
                {proposal.values[i] !== undefined &&
                  proposal.values[i] > 0n && (
                    <p className="mt-1 text-xs text-text-muted">
                      Value: {proposal.values[i]!.toString()} wei
                    </p>
                  )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Votes</CardTitle>
          </CardHeader>
          <VoteStatistics
            forVotes={forVotes}
            againstVotes={againstVotes}
            abstainVotes={abstainVotes}
            totalSupply={totalSupply as bigint | undefined}
          />
        </Card>

        {isActive && (
          <Card>
            <CardHeader>
              <CardTitle>Cast Your Vote</CardTitle>
            </CardHeader>
            <CastVote proposalId={proposalId} />
          </Card>
        )}

        {isSucceeded && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-brand-amber" />
                Queue Proposal
              </CardTitle>
            </CardHeader>
            <p className="mb-3 text-xs text-text-muted">
              This proposal passed. Queue it in the timelock to begin the
              1-hour waiting period before execution.
            </p>
            <Button
              size="md"
              className="w-full"
              onClick={handleQueue}
              disabled={queuePending || queueConfirming}
            >
              {queuePending || queueConfirming
                ? "Queuing…"
                : "Queue in Timelock"}
            </Button>
            {queueSuccess && (
              <p className="mt-2 text-xs text-brand-green">
                Proposal queued successfully.
              </p>
            )}
            {queueError && (
              <p className="mt-2 text-xs text-semantic-error">
                {queueError.message.slice(0, 200)}
              </p>
            )}
          </Card>
        )}

        {isQueued && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-4 w-4 text-brand-green" />
                Execute Proposal
              </CardTitle>
            </CardHeader>
            <p className="mb-3 text-xs text-text-muted">
              If the timelock delay has passed, execute this proposal to
              trigger the treasury action. The Executor will perform a final
              sanctions check.
            </p>
            <Button
              size="md"
              className="w-full"
              onClick={handleExecute}
              disabled={executePending || executeConfirming}
            >
              {executePending || executeConfirming
                ? "Executing…"
                : "Execute Proposal"}
            </Button>
            {executeSuccess && (
              <p className="mt-2 text-xs text-brand-green">
                Proposal executed successfully.
              </p>
            )}
            {executeError && (
              <p className="mt-2 text-xs text-semantic-error">
                {executeError.message.slice(0, 200)}
              </p>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

function StateGuidance({
  state,
  voteEnd,
  blockStats,
  proposalEta,
}: {
  state: number | undefined;
  voteEnd: bigint;
  blockStats: { currentBlock: number; avgBlockTimeMs: number } | undefined;
  proposalEta: bigint | undefined;
}) {
  if (state === undefined) return null;

  const countdown = blockStats
    ? formatCountdownText(voteEnd, blockStats)
    : null;

  const timelockCountdown = formatTimelockCountdown(proposalEta);

  const messages: Record<number, { text: string; color: string }> = {
    [ProposalState.Pending]: {
      text: "This proposal is waiting for the voting delay to pass (1 block). Voting will begin shortly.",
      color: "text-text-muted",
    },
    [ProposalState.Active]: {
      text: countdown
        ? `Voting closes in ~${countdown.time} (~${countdown.blocks} blocks remaining). 10% quorum required.`
        : `Voting is open until block #${voteEnd.toString()}. 10% quorum required.`,
      color: "text-semantic-info",
    },
    [ProposalState.Succeeded]: {
      text: "This proposal passed! Queue it in the timelock to begin the waiting period before execution.",
      color: "text-brand-green",
    },
    [ProposalState.Queued]: {
      text: timelockCountdown
        ? `Executable in ~${timelockCountdown}. The Executor will perform a final sanctions check.`
        : "This proposal is in the timelock waiting period. After the delay passes, it can be executed.",
      color: "text-brand-amber",
    },
    [ProposalState.Executed]: {
      text: "This proposal has been executed. The treasury action was completed successfully.",
      color: "text-brand-green",
    },
    [ProposalState.Defeated]: {
      text: "This proposal was defeated. It did not reach the required quorum or did not receive a majority of 'For' votes.",
      color: "text-semantic-error",
    },
    [ProposalState.Canceled]: {
      text: "This proposal was canceled, possibly due to a sanctioned recipient being detected (Layer 2 defense).",
      color: "text-semantic-error",
    },
    [ProposalState.Expired]: {
      text: "This proposal succeeded but was not queued before the deadline expired.",
      color: "text-text-subtle",
    },
  };

  const msg = messages[state];
  if (!msg) return null;

  return (
    <Card>
      <div className="flex items-start gap-2">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-semantic-info" />
        <div>
          <p className={`text-xs ${msg.color}`}>{msg.text}</p>
          {blockStats && state === ProposalState.Active && (
            <p className="mt-1 font-mono text-xs text-text-subtle">
              Block #{blockStats.currentBlock.toLocaleString()} / #
              {voteEnd.toString()}
            </p>
          )}
          {proposalEta && state === ProposalState.Queued && (
            <p className="mt-1 font-mono text-xs text-text-subtle">
              Executable after{" "}
              {new Date(Number(proposalEta) * 1000).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

function formatTimelockCountdown(eta: bigint | undefined): string | null {
  if (!eta || eta === 0n) return null;
  const nowMs = Date.now();
  const etaMs = Number(eta) * 1000;
  const remainingMs = etaMs - nowMs;
  if (remainingMs <= 0) return "now (ready to execute)";
  return formatCountdown(remainingMs);
}

function formatCountdownText(
  voteEnd: bigint,
  stats: { currentBlock: number; avgBlockTimeMs: number }
) {
  const blocks = blocksRemaining(voteEnd, stats.currentBlock);
  if (blocks === 0) return null;
  const ms = estimateTimeMs(blocks, stats.avgBlockTimeMs);
  return { time: formatCountdown(ms), blocks };
}
