"use client";

import { ArrowDownLeft, ArrowUpRight, ExternalLink } from "lucide-react";
import { useTreasuryTransactions } from "@/lib/hooks/use-treasury";
import { useExplorerUrl, useChainMeta, useChainContracts } from "@/lib/hooks/use-chain";

function truncateHash(hash: string): string {
  return `${hash.slice(0, 10)}\u2026${hash.slice(-6)}`;
}

function truncateAddress(addr: string): string {
  return `${addr.slice(0, 8)}\u2026${addr.slice(-6)}`;
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TransactionsTable() {
  const { data: transactions, isLoading } = useTreasuryTransactions();
  const explorerUrl = useExplorerUrl();
  const { symbol } = useChainMeta();
  const contracts = useChainContracts();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent Transactions</h2>
        <a
          href={`${explorerUrl("address", contracts.treasury).replace(/\/address\/.*/, "")}/address/${contracts.treasury}?tab=txs`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-text-muted transition-colors hover:text-brand-green"
        >
          View all on Explorer
          <ExternalLink size={12} />
        </a>
      </div>

      <div className="overflow-hidden rounded-xl border border-border-default bg-bg-surface">
        {isLoading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-10 animate-pulse rounded bg-bg-elevated"
              />
            ))}
          </div>
        ) : !transactions || transactions.length === 0 ? (
          <div className="flex h-32 items-center justify-center">
            <p className="text-sm text-text-muted">No transactions yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-default text-left text-xs font-medium uppercase tracking-wider text-text-subtle">
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Hash</th>
                  <th className="px-5 py-3">From / To</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-5 py-3">Block</th>
                  <th className="px-5 py-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 25).map((tx) => (
                  <tr
                    key={tx.hash}
                    className="border-b border-border-subtle transition-colors hover:bg-bg-elevated"
                  >
                    <td className="px-5 py-3">
                      <div className="flex flex-col gap-0.5">
                        {tx.type === "inflow" ? (
                          <span className="inline-flex items-center gap-1 text-brand-green">
                            <ArrowDownLeft size={14} />
                            Donation
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-text-muted">
                            <ArrowUpRight size={14} />
                            Withdrawal
                          </span>
                        )}
                        {tx.governance && (
                          <span className="inline-flex rounded-full border border-border-default px-2 py-0.5 text-[10px] font-medium text-text-muted">
                            ECFP
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <a
                        href={explorerUrl("tx", tx.hash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs text-text-muted transition-colors hover:text-brand-green"
                      >
                        {truncateHash(tx.hash)}
                      </a>
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-mono text-xs text-text-muted">
                        {tx.type === "inflow"
                          ? truncateAddress(tx.from)
                          : truncateAddress(tx.to || "")}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span
                        className={`font-mono text-xs font-medium ${
                          tx.type === "inflow"
                            ? "text-brand-green"
                            : "text-text-muted"
                        }`}
                      >
                        {tx.type === "inflow" ? "+" : "\u2212"}
                        {parseFloat(tx.value).toFixed(4)} {symbol}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-mono text-xs text-text-subtle">
                        #{tx.blockNumber.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs text-text-subtle">
                        {formatTimestamp(tx.timestamp)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
