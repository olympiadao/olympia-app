"use client";

import { use } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ProposalStatus } from "@/components/proposals/proposal-status";
import { VoteStatistics } from "@/components/proposals/vote-statistics";
import { CastVote } from "@/components/proposals/cast-vote";
import { useProposals } from "@/lib/hooks/use-proposals";
import {
  useProposalState,
  useProposalVotes,
} from "@/lib/hooks/use-proposal-state";
import { truncateAddress, explorerUrl } from "@/lib/utils/format";
import { ProposalState } from "@/lib/utils/proposal-states";

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

  const proposal = proposals.find(
    (p) => p.proposalId.toString() === id
  );

  if (isLoading) {
    return <p className="text-sm text-text-muted">Loading…</p>;
  }

  if (!proposal) {
    return <p className="text-sm text-semantic-error">Proposal not found</p>;
  }

  const title = proposal.description.split("\n")[0] || "Untitled";
  const body = proposal.description.split("\n").slice(1).join("\n").trim();
  const isActive = state === ProposalState.Active;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* Main content */}
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-3">
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

        {body && (
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <div className="whitespace-pre-wrap text-sm text-text-secondary">
              {body}
            </div>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
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
                {proposal.values[i] !== undefined && proposal.values[i] > 0n && (
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
      </div>
    </div>
  );
}
