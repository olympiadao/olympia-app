"use client";

import { useBalance } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { getContracts } from "@/lib/contracts/addresses";
import { useActiveChainId } from "./use-chain";
import {
  fetchStats,
  fetchTransactions,
  fetchBalanceHistory,
} from "@/lib/treasury-api";

const REFETCH_INTERVAL = 600_000; // 10 min
const STALE_TIME = 300_000; // 5 min

/** On-chain balance via wagmi (fast, single RPC call) */
export function useTreasuryBalance() {
  const chainId = useActiveChainId();
  const c = getContracts(chainId);
  return useBalance({
    address: c.treasury,
    chainId,
    query: { refetchInterval: 60_000 },
  });
}

/** Aggregated treasury stats from Blockscout API */
export function useTreasuryStats() {
  const chainId = useActiveChainId();
  return useQuery({
    queryKey: ["treasury", "stats", chainId],
    queryFn: () => fetchStats(chainId),
    refetchInterval: REFETCH_INTERVAL,
    staleTime: STALE_TIME,
  });
}

/** Treasury transactions from Blockscout API */
export function useTreasuryTransactions() {
  const chainId = useActiveChainId();
  return useQuery({
    queryKey: ["treasury", "transactions", chainId],
    queryFn: () => fetchTransactions(chainId),
    refetchInterval: REFETCH_INTERVAL,
    staleTime: STALE_TIME,
  });
}

/** Balance history events for chart */
export function useTreasuryBalanceHistory() {
  const chainId = useActiveChainId();
  return useQuery({
    queryKey: ["treasury", "balanceHistory", chainId],
    queryFn: () => fetchBalanceHistory(chainId),
    refetchInterval: REFETCH_INTERVAL,
    staleTime: STALE_TIME,
  });
}
