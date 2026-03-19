"use client";

export function formatAmount(value: string): string {
  const num = parseFloat(value);
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
  return num.toFixed(4);
}

export function KpiCard({
  label,
  value,
  subtitle,
  icon: Icon,
  loading,
  error,
}: {
  label: string;
  value: string;
  subtitle?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  loading: boolean;
  error: boolean;
}) {
  return (
    <div className="rounded-xl border border-border-default bg-bg-surface p-5 transition-all duration-200 hover:border-border-brand">
      <div className="mb-3 flex items-center gap-2">
        <Icon size={18} className="text-brand-green" />
        <span className="text-xs font-medium uppercase tracking-wider text-text-subtle">
          {label}
        </span>
      </div>
      {loading ? (
        <div className="h-8 w-32 animate-pulse rounded bg-bg-elevated" />
      ) : error ? (
        <p className="text-sm text-semantic-error">Error loading</p>
      ) : (
        <>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p className="mt-1 text-[10px] text-text-subtle">{subtitle}</p>
          )}
        </>
      )}
    </div>
  );
}
