"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProposalStatus } from "@/components/proposals/proposal-status";
import { useProposals } from "@/lib/hooks/use-proposals";
import { useProposalState } from "@/lib/hooks/use-proposal-state";
import { truncateAddress } from "@/lib/utils/format";

export default function ProposalsPage() {
  const { proposals, isLoading, error } = useProposals();

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
}: {
  proposalId: bigint;
  description: string;
  proposer: `0x${string}`;
  blockNumber: bigint;
}) {
  const { state } = useProposalState(proposalId);
  const title = description.split("\n")[0] || "Untitled";
  const body = description.split("\n").slice(1).join("\n").trim();

  return (
    <Link href={`/proposals/${proposalId.toString()}`}>
      <Card className="transition-colors hover:border-border-brand">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold">{title}</p>
            {body && (
              <p className="mt-1 line-clamp-2 text-sm text-text-muted">
                {body}
              </p>
            )}
            <div className="mt-2 flex items-center gap-3 text-xs text-text-subtle">
              <span>
                by{" "}
                <span className="font-mono">{truncateAddress(proposer)}</span>
              </span>
              <span>Block #{blockNumber.toString()}</span>
            </div>
          </div>
          {state !== undefined && <ProposalStatus state={state} />}
        </div>
      </Card>
    </Link>
  );
}
