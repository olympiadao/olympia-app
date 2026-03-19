"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTreasuryBalanceHistory } from "@/lib/hooks/use-treasury";
import { useChainMeta } from "@/lib/hooks/use-chain";

interface ChartPoint {
  label: string;
  balance: number;
}

export function BalanceChart() {
  const { data: events, isLoading } = useTreasuryBalanceHistory();
  const { symbol } = useChainMeta();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const tickColor = isDark ? "#6b7280" : "#9ca3af";
  const axisColor = isDark ? "#1f292b" : "#e2e8f0";
  const tooltipBg = isDark ? "#0f1614" : "#ffffff";
  const tooltipBorder = isDark ? "#1f292b" : "#e2e8f0";
  const tooltipText = isDark ? "#fff" : "#0a0f10";

  const chartData = useMemo(() => {
    if (!events || events.length === 0) return [];

    let running = 0;
    const points: ChartPoint[] = [];

    for (const event of events) {
      running += event.delta;
      points.push({
        label: `#${event.blockNumber}`,
        balance: parseFloat(running.toFixed(6)),
      });
    }

    return points;
  }, [events]);

  if (isLoading) {
    return (
      <div>
        <h2 className="mb-4 text-lg font-semibold">Balance History</h2>
        <div className="h-64 animate-pulse rounded-xl border border-border-default bg-bg-surface" />
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div>
        <h2 className="mb-4 text-lg font-semibold">Balance History</h2>
        <div className="flex h-48 items-center justify-center rounded-xl border border-border-default bg-bg-surface">
          <p className="text-sm text-text-muted">No transaction data yet</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Balance History</h2>
      <div className="rounded-xl border border-border-default bg-bg-surface p-4">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart
            data={chartData}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00ffae" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#00ffae" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              tick={{ fill: tickColor, fontSize: 11 }}
              axisLine={{ stroke: axisColor }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: tickColor, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) =>
                v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v.toFixed(2)
              }
              width={60}
            />
            <Tooltip
              contentStyle={{
                background: tooltipBg,
                border: `1px solid ${tooltipBorder}`,
                borderRadius: 8,
                fontSize: 13,
                color: tooltipText,
              }}
              formatter={(value) => [
                `${Number(value).toFixed(4)} ${symbol}`,
                "Balance",
              ]}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#00ffae"
              strokeWidth={2}
              fill="url(#balanceGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
