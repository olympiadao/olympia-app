"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useProposals } from "@/lib/hooks/use-proposals";
import { useTreasuryBalance } from "@/lib/hooks/use-treasury";
import { useTotalMembers } from "@/lib/hooks/use-member-nft";
import { formatEtc } from "@/lib/utils/format";
import { ProposalStatus } from "@/components/proposals/proposal-status";
import { useProposalState } from "@/lib/hooks/use-proposal-state";
import Link from "next/link";
import { ScrollText, Landmark, Users } from "lucide-react";

export default function Dashboard() {
  const { proposals, isLoading: proposalsLoading } = useProposals();
  const { data: balance } = useTreasuryBalance();
  const { data: totalMembers } = useTotalMembers();

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
}: {
  proposalId: bigint;
  description: string;
}) {
  const { state } = useProposalState(proposalId);
  const title = description.split("\n")[0] || "Untitled";

  return (
    <Link href={`/proposals/${proposalId.toString()}`}>
      <Card className="flex items-center justify-between transition-colors hover:border-border-brand">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{title}</p>
          <p className="mt-0.5 font-mono text-xs text-text-subtle">
            #{proposalId.toString().slice(0, 8)}…
          </p>
        </div>
        {state !== undefined && <ProposalStatus state={state} />}
      </Card>
    </Link>
  );
}
