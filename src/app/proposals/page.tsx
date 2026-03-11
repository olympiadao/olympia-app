"use client";

import Link from "next/link";
import { Plus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ProposalStatus } from "@/components/proposals/proposal-status";
import { useProposals } from "@/lib/hooks/use-proposals";
import { useProposalState } from "@/lib/hooks/use-proposal-state";
import { truncateAddress } from "@/lib/utils/format";
import {
  parseProposalDescription,
  proposalCategoryColors,
} from "@/lib/utils/proposal-categories";

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

      {/* Proposal Lifecycle Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-4 w-4 text-semantic-info" />
            Proposal Lifecycle
          </CardTitle>
        </CardHeader>
        <div className="grid gap-2 text-xs sm:grid-cols-2">
          <LifecycleStep
            state="Pending"
            color="text-text-muted"
            desc="Waiting for voting delay (1 block)"
          />
          <LifecycleStep
            state="Active"
            color="text-semantic-info"
            desc="Voting open. Cast For/Against/Abstain. Needs 10% quorum."
          />
          <LifecycleStep
            state="Succeeded"
            color="text-brand-green"
            desc="Passed. Ready to queue in the timelock."
          />
          <LifecycleStep
            state="Queued"
            color="text-brand-amber"
            desc="In timelock (1 hour). Safety period before execution."
          />
          <LifecycleStep
            state="Executed"
            color="text-brand-green"
            desc="Treasury action completed successfully."
          />
          <LifecycleStep
            state="Defeated"
            color="text-semantic-error"
            desc="Did not reach quorum or majority."
          />
          <LifecycleStep
            state="Canceled"
            color="text-semantic-error"
            desc="Canceled (e.g., sanctioned recipient detected)."
          />
          <LifecycleStep
            state="Expired"
            color="text-text-subtle"
            desc="Succeeded but not queued in time."
          />
        </div>
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
  const parsed = parseProposalDescription(description);
  const title = parsed.title;
  const body = parsed.body;

  return (
    <Link href={`/proposals/${proposalId.toString()}`}>
      <Card className="transition-colors hover:border-border-brand">
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

function LifecycleStep({
  state,
  color,
  desc,
}: {
  state: string;
  color: string;
  desc: string;
}) {
  return (
    <div className="rounded-lg border border-border-subtle bg-bg-elevated px-3 py-2">
      <span className={`font-medium ${color}`}>{state}</span>
      <span className="ml-1 text-text-subtle">— {desc}</span>
    </div>
  );
}
