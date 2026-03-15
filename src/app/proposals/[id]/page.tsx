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
import { useMembers } from "@/lib/hooks/use-member-nft";
import { useVoteCastEvents } from "@/lib/hooks/use-vote-events";
import type { VoteCastEvent } from "@/lib/hooks/use-vote-events";
import type { Member } from "@/lib/hooks/use-member-nft";
import { truncateAddress, formatEtc, explorerUrl } from "@/lib/utils/format";
import { decodeProposalActions } from "@/lib/utils/decode-actions";
import { useProposalTxHashes } from "@/lib/hooks/use-proposal-events";
import { useCheckSanction } from "@/lib/hooks/use-admin";
import { useCancelIfSanctioned } from "@/lib/hooks/use-proposal-actions";
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
import { Info, Clock, Play, ExternalLink, ChevronDown, ShieldAlert } from "lucide-react";
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
  const { data: blockStats } = useBlockStats();
  const txHashes = useProposalTxHashes(proposalId);
  const { votes } = useVoteCastEvents(proposalId);
  const { members } = useMembers();

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
  const {
    cancelIfSanctioned,
    isPending: cancelPending,
    isConfirming: cancelConfirming,
    isSuccess: cancelSuccess,
    error: cancelError,
  } = useCancelIfSanctioned();

  const proposal = proposals.find((p) => p.proposalId.toString() === id);

  // Extract treasury recipient for sanctions check (must be before early returns)
  const treasuryRecipient = proposal
    ? decodeProposalActions(proposal.targets, proposal.values, proposal.calldatas)
        .find((a) => a.recipient)?.recipient
    : undefined;
  const { data: recipientSanctioned } = useCheckSanction(treasuryRecipient);

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
  const isCancellable =
    recipientSanctioned === true &&
    (isActive || isSucceeded || isQueued);

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
          forVotes={forVotes}
          againstVotes={againstVotes}
          abstainVotes={abstainVotes}
        />

        {/* Sanctions alert — Layer 2 defense */}
        {isCancellable && (
          <Card className="border-semantic-error/40 bg-semantic-error/10">
            <div className="flex items-start gap-2">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-semantic-error" />
              <div className="text-xs">
                <p className="font-medium text-semantic-error">
                  Sanctioned Recipient Detected
                </p>
                <p className="mt-1 text-semantic-error/80">
                  The treasury recipient{" "}
                  <a
                    href={explorerUrl("address", treasuryRecipient!)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 font-mono text-semantic-error underline"
                  >
                    {truncateAddress(treasuryRecipient!)}
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>{" "}
                  is currently on the sanctions list. This proposal can be
                  canceled by anyone using the Layer 2 defense (
                  <code className="rounded bg-semantic-error/20 px-1">
                    cancelIfSanctioned
                  </code>
                  ).
                </p>
              </div>
            </div>
          </Card>
        )}

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

        <ProposalActions
          targets={proposal.targets}
          values={proposal.values}
          calldatas={proposal.calldatas}
        />

        <GovernancePipeline
          state={state}
          proposer={proposal.proposer}
          blockNumber={proposal.blockNumber}
          voteStart={proposal.voteStart}
          forVotes={forVotes}
          againstVotes={againstVotes}
          abstainVotes={abstainVotes}
          txHashes={txHashes}
          votes={votes}
          members={members}
        />
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
            eligibleMembers={proposal ? members.filter((m) => m.blockNumber <= proposal.voteStart).length : undefined}
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

        {isCancellable && (
          <Card className="border-semantic-error/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-semantic-error">
                <ShieldAlert className="h-4 w-4" />
                Cancel — Sanctioned Recipient
              </CardTitle>
            </CardHeader>
            <p className="mb-3 text-xs text-text-muted">
              The recipient is on the sanctions list. Anyone can invoke
              Layer 2 defense to cancel this proposal.
            </p>
            <Button
              variant="destructive"
              size="md"
              className="w-full"
              onClick={() => cancelIfSanctioned(proposalId)}
              disabled={cancelPending || cancelConfirming || cancelSuccess}
            >
              {cancelPending || cancelConfirming
                ? "Canceling…"
                : cancelSuccess
                  ? "Canceled"
                  : "Cancel Proposal"}
            </Button>
            {cancelSuccess && (
              <p className="mt-2 text-xs text-brand-green">
                Proposal canceled successfully.
              </p>
            )}
            {cancelError && (
              <p className="mt-2 text-xs text-semantic-error">
                {cancelError.message.slice(0, 200)}
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
  forVotes,
  againstVotes,
  abstainVotes,
}: {
  state: number | undefined;
  voteEnd: bigint;
  blockStats: { currentBlock: number; avgBlockTimeMs: number } | undefined;
  proposalEta: bigint | undefined;
  forVotes: bigint;
  againstVotes: bigint;
  abstainVotes: bigint;
}) {
  if (state === undefined) return null;

  const countdown = blockStats
    ? formatCountdownText(voteEnd, blockStats)
    : null;

  const timelockCountdown = formatTimelockCountdown(proposalEta);

  const totalVotes = forVotes + againstVotes + abstainVotes;
  const voteSummary =
    totalVotes > 0n
      ? `Voted ${forVotes.toString()} For, ${againstVotes.toString()} Against${abstainVotes > 0n ? `, ${abstainVotes.toString()} Abstain` : ""}.`
      : null;

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
      text: `This proposal passed${voteSummary ? ` (${voteSummary})` : ""}. Queue it in the timelock to begin the waiting period before execution.`,
      color: "text-brand-green",
    },
    [ProposalState.Queued]: {
      text: timelockCountdown
        ? `${voteSummary ? `${voteSummary} ` : ""}Executable in ~${timelockCountdown}. The Executor will perform a final sanctions check.`
        : `${voteSummary ? `${voteSummary} ` : ""}This proposal is in the timelock waiting period. After the delay passes, it can be executed.`,
      color: "text-brand-amber",
    },
    [ProposalState.Executed]: {
      text: `This proposal has been executed.${voteSummary ? ` ${voteSummary}` : ""} The treasury action was completed successfully.`,
      color: "text-brand-green",
    },
    [ProposalState.Defeated]: {
      text: `This proposal was defeated. ${
        forVotes > againstVotes
          ? `${voteSummary ?? ""} It did not reach the 10% quorum threshold.`
          : againstVotes > forVotes
            ? `It was voted down ${againstVotes.toString()} Against to ${forVotes.toString()} For.`
            : totalVotes === 0n
              ? "No votes were cast — quorum was not reached."
              : `It tied ${forVotes.toString()}-${againstVotes.toString()} and did not achieve a majority.`
      }`,
      color: "text-semantic-error",
    },
    [ProposalState.Canceled]: {
      text: `This proposal was canceled${voteSummary ? ` (${voteSummary})` : ""}, possibly due to a sanctioned recipient being detected (Layer 2 defense).`,
      color: "text-semantic-error",
    },
    [ProposalState.Expired]: {
      text: `This proposal succeeded${voteSummary ? ` (${voteSummary})` : ""} but was not queued before the deadline expired.`,
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
          {proposalEta !== undefined && proposalEta > 0n && state === ProposalState.Queued && (
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

function ProposalActions({
  targets,
  values,
  calldatas,
}: {
  targets: readonly `0x${string}`[];
  values: readonly bigint[];
  calldatas: readonly `0x${string}`[];
}) {
  const actions = decodeProposalActions(targets, values, calldatas);

  return (
    <Card>
      <CardHeader>
        <CardTitle>On-Chain Actions</CardTitle>
      </CardHeader>
      <div className="space-y-3">
        {actions.map((action, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-lg border border-border-subtle"
          >
            <div className="flex items-center justify-between bg-bg-elevated px-3 py-2">
              <span className="text-xs font-medium text-text-primary">
                Action #{i + 1}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  action.type === "Treasury Withdrawal"
                    ? "bg-brand-amber-subtle text-brand-amber"
                    : action.type === "Signaling"
                      ? "bg-brand-green-subtle text-brand-green"
                      : "bg-bg-elevated text-text-muted"
                }`}
              >
                {action.type}
              </span>
            </div>
            <table className="w-full text-sm">
              <tbody>
                <ActionRow label="Target">
                  <span className="text-text-muted">{action.targetLabel}</span>
                  <span className="mx-1.5 text-text-subtle">·</span>
                  <a
                    href={explorerUrl("address", action.target)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-brand-green hover:underline"
                  >
                    {truncateAddress(action.target)}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </ActionRow>
                {action.recipient && (
                  <ActionRow label="Recipient">
                    <a
                      href={explorerUrl("address", action.recipient)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-brand-green hover:underline"
                    >
                      {truncateAddress(action.recipient)}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </ActionRow>
                )}
                {action.amount !== undefined && (
                  <ActionRow label="Amount">
                    <span className="font-semibold text-brand-amber">
                      {formatEtc(action.amount)} METC
                    </span>
                  </ActionRow>
                )}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ActionRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <tr className="border-t border-border-subtle">
      <td className="w-24 px-3 py-2 text-xs text-text-muted">{label}</td>
      <td className="px-3 py-2 text-xs">{children}</td>
    </tr>
  );
}

const VOTE_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "For", color: "text-brand-green" },
  0: { label: "Against", color: "text-semantic-error" },
  2: { label: "Abstain", color: "text-text-subtle" },
};

function GovernancePipeline({
  state,
  proposer,
  blockNumber,
  voteStart,
  forVotes,
  againstVotes,
  abstainVotes,
  txHashes,
  votes,
  members,
}: {
  state: number | undefined;
  proposer: string;
  blockNumber: bigint;
  voteStart: bigint;
  forVotes: bigint;
  againstVotes: bigint;
  abstainVotes: bigint;
  txHashes: {
    createTxHash?: `0x${string}`;
    queueTxHash?: `0x${string}`;
    executeTxHash?: `0x${string}`;
  };
  votes: VoteCastEvent[];
  members: Member[];
}) {
  const totalVotes = forVotes + againstVotes + abstainVotes;

  // Only members minted at or before the snapshot block were eligible to vote
  const eligibleMembers = members.filter(
    (m) => m.blockNumber <= voteStart
  );
  const votedAddresses = new Set(
    votes.map((v) => v.voter.toLowerCase())
  );
  const nonVoters = eligibleMembers.filter(
    (m) => !votedAddresses.has(m.address.toLowerCase())
  );

  const isTerminal =
    state === ProposalState.Defeated ||
    state === ProposalState.Canceled ||
    state === ProposalState.Expired;

  const terminalLabel =
    state === ProposalState.Defeated
      ? "Proposal defeated"
      : state === ProposalState.Canceled
        ? "Proposal canceled"
        : state === ProposalState.Expired
          ? "Proposal expired"
          : undefined;

  const steps = [
    {
      label: "Proposed",
      detail: `by ${truncateAddress(proposer)} at block #${blockNumber.toString()}`,
      txHash: txHashes.createTxHash,
      reached: state !== undefined,
    },
    {
      label: "Voted",
      detail:
        totalVotes > 0n
          ? `${forVotes.toString()} for · ${againstVotes.toString()} against · ${abstainVotes.toString()} abstain`
          : "No votes yet",
      reached:
        state !== undefined &&
        state !== ProposalState.Pending,
    },
    {
      label: "Queued",
      detail: txHashes.queueTxHash
        ? "Entered timelock"
        : isTerminal
          ? terminalLabel!
          : state === ProposalState.Succeeded
            ? "Ready to queue"
            : "Pending",
      txHash: txHashes.queueTxHash,
      reached:
        state === ProposalState.Queued ||
        state === ProposalState.Executed,
      skipped: isTerminal,
    },
    {
      label: "Executed",
      detail: txHashes.executeTxHash
        ? "Treasury action completed"
        : isTerminal
          ? terminalLabel!
          : "Pending",
      txHash: txHashes.executeTxHash,
      reached: state === ProposalState.Executed,
      skipped: isTerminal,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Governance Pipeline</CardTitle>
      </CardHeader>
      <div className="space-y-0">
        {steps.map((step, i) => (
          <div key={step.label} className="flex gap-3">
            {/* Timeline connector */}
            <div className="flex flex-col items-center">
              <div
                className={`h-3 w-3 shrink-0 rounded-full border-2 ${
                  step.reached
                    ? "border-brand-green bg-brand-green"
                    : step.skipped
                      ? "border-semantic-error/40 bg-semantic-error/20"
                      : "border-border-default bg-bg-elevated"
                }`}
              />
              {i < steps.length - 1 && (
                <div
                  className={`w-0.5 grow ${
                    steps[i + 1]?.reached
                      ? "bg-brand-green"
                      : steps[i + 1]?.skipped
                        ? "bg-semantic-error/20"
                        : "bg-border-default"
                  }`}
                />
              )}
            </div>
            {/* Content */}
            <div className="min-w-0 flex-1 pb-4">
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-medium ${
                    step.reached
                      ? "text-text-primary"
                      : step.skipped
                        ? "text-text-subtle line-through"
                        : "text-text-subtle"
                  }`}
                >
                  {step.label}
                </span>
                {step.txHash && (
                  <a
                    href={explorerUrl("tx", step.txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-xs text-brand-green hover:underline"
                  >
                    {step.txHash.slice(0, 10)}…{step.txHash.slice(-4)}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              <p className={`text-xs ${step.skipped ? "text-semantic-error/60" : "text-text-muted"}`}>{step.detail}</p>

              {/* Collapsible vote ledger under the Voted step */}
              {step.label === "Voted" && step.reached && votes.length > 0 && (
                <details className="group mt-2">
                  <summary className="flex cursor-pointer list-none items-center gap-1 text-xs font-medium text-text-muted hover:text-text-secondary">
                    <ChevronDown className="h-3 w-3 transition-transform group-open:rotate-180" />
                    View {votes.length} vote{votes.length !== 1 ? "s" : ""}
                    {nonVoters.length > 0 &&
                      ` · ${nonVoters.length} did not vote`}
                  </summary>
                  <div className="mt-2 overflow-x-auto rounded-lg border border-border-subtle">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border-subtle bg-bg-elevated">
                          <th className="px-3 py-1.5 text-left font-medium text-text-muted">
                            Voter
                          </th>
                          <th className="px-3 py-1.5 text-left font-medium text-text-muted">
                            Vote
                          </th>
                          <th className="px-3 py-1.5 text-left font-medium text-text-muted">
                            Tx
                          </th>
                          <th className="px-3 py-1.5 text-right font-medium text-text-muted">
                            Block
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {votes.map((vote) => {
                          const voteInfo = VOTE_LABELS[vote.support] ?? {
                            label: `Unknown (${vote.support})`,
                            color: "text-text-muted",
                          };
                          return (
                            <tr
                              key={vote.txHash}
                              className="border-b border-border-subtle last:border-b-0"
                            >
                              <td className="px-3 py-1.5">
                                <a
                                  href={explorerUrl("address", vote.voter)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 font-mono text-brand-green hover:underline"
                                >
                                  {truncateAddress(vote.voter)}
                                  <ExternalLink className="h-2.5 w-2.5" />
                                </a>
                              </td>
                              <td className="px-3 py-1.5">
                                <span className={`font-medium ${voteInfo.color}`}>
                                  {voteInfo.label}
                                </span>
                                {vote.reason && (
                                  <span
                                    className="ml-1.5 text-text-subtle"
                                    title={vote.reason}
                                  >
                                    &ldquo;
                                    {vote.reason.length > 30
                                      ? `${vote.reason.slice(0, 30)}…`
                                      : vote.reason}
                                    &rdquo;
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-1.5">
                                <a
                                  href={explorerUrl("tx", vote.txHash)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 font-mono text-brand-green hover:underline"
                                >
                                  {vote.txHash.slice(0, 10)}…
                                  {vote.txHash.slice(-4)}
                                  <ExternalLink className="h-2.5 w-2.5" />
                                </a>
                              </td>
                              <td className="px-3 py-1.5 text-right font-mono text-text-muted">
                                #{vote.blockNumber.toString()}
                              </td>
                            </tr>
                          );
                        })}
                        {nonVoters.map((member) => (
                          <tr
                            key={member.address}
                            className="border-b border-border-subtle last:border-b-0 opacity-50"
                          >
                            <td className="px-3 py-1.5">
                              <a
                                href={explorerUrl("address", member.address)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-mono text-brand-green hover:underline"
                              >
                                {truncateAddress(member.address)}
                                <ExternalLink className="h-2.5 w-2.5" />
                              </a>
                            </td>
                            <td
                              className="px-3 py-1.5 text-text-subtle"
                              colSpan={3}
                            >
                              Did not vote
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
