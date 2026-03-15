"use client";

import { useBlockNumber } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { fetchBlockscoutStats } from "@/lib/utils/blockscout";

const AVG_BLOCK_TIME_POLL = 5 * 60 * 1000; // 5 minutes for avg block time
const BLOCK_POLL = 15_000; // 15 seconds for current block (~1 Mordor block)

export function useBlockStats(chainId: number = 63) {
  const { data: blockNumber } = useBlockNumber({
    watch: true,
    query: { refetchInterval: BLOCK_POLL },
  });

  const { data: blockscoutStats } = useQuery({
    queryKey: ["blockscout-stats", chainId],
    queryFn: () => fetchBlockscoutStats(chainId),
    refetchInterval: AVG_BLOCK_TIME_POLL,
    staleTime: 60_000,
    retry: 2,
  });

  const data =
    blockNumber !== undefined && blockscoutStats
      ? {
          currentBlock: Number(blockNumber),
          avgBlockTimeMs: blockscoutStats.avgBlockTimeMs,
        }
      : blockscoutStats ?? undefined;

  return { data };
}
