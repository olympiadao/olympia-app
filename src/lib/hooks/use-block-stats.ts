"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchBlockscoutStats } from "@/lib/utils/blockscout";

const POLL_INTERVAL = 5 * 60 * 1000; // 5 minutes
const STALE_TIME = 60 * 1000; // 1 minute

export function useBlockStats(chainId: number = 63) {
  return useQuery({
    queryKey: ["blockscout-stats", chainId],
    queryFn: () => fetchBlockscoutStats(chainId),
    refetchInterval: POLL_INTERVAL,
    staleTime: STALE_TIME,
    retry: 2,
  });
}
