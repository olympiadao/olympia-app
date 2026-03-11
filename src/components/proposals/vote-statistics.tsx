import { cn } from "@/lib/utils/cn";

interface VoteStatisticsProps {
  forVotes: bigint;
  againstVotes: bigint;
  abstainVotes: bigint;
}

export function VoteStatistics({
  forVotes,
  againstVotes,
  abstainVotes,
}: VoteStatisticsProps) {
  const total = forVotes + againstVotes + abstainVotes;
  const pct = (v: bigint) =>
    total > 0n ? Number((v * 1000n) / total) / 10 : 0;

  const forPct = pct(forVotes);
  const againstPct = pct(againstVotes);
  const abstainPct = pct(abstainVotes);

  return (
    <div className="space-y-3">
      <div className="flex h-2.5 overflow-hidden rounded-full bg-bg-elevated">
        <div
          className="bg-brand-green transition-all"
          style={{ width: `${forPct}%` }}
        />
        <div
          className="bg-semantic-error transition-all"
          style={{ width: `${againstPct}%` }}
        />
        <div
          className="bg-text-subtle transition-all"
          style={{ width: `${abstainPct}%` }}
        />
      </div>

      <div className="flex justify-between text-xs">
        <VoteLabel label="For" count={forVotes} pct={forPct} className="text-brand-green" />
        <VoteLabel label="Against" count={againstVotes} pct={againstPct} className="text-semantic-error" />
        <VoteLabel label="Abstain" count={abstainVotes} pct={abstainPct} className="text-text-subtle" />
      </div>
    </div>
  );
}

function VoteLabel({
  label,
  count,
  pct,
  className,
}: {
  label: string;
  count: bigint;
  pct: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span className="font-medium">{label}</span>
      <span className="text-text-muted">
        {count.toString()} ({pct.toFixed(1)}%)
      </span>
    </div>
  );
}
