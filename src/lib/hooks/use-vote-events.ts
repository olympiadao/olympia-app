"use client";

import { usePublicClient } from "wagmi";
import { useEffect, useState } from "react";
import { parseAbiItem } from "viem";
import { contracts } from "@/lib/contracts/addresses";

const voteCastEvent = parseAbiItem(
  "event VoteCast(address indexed voter, uint256 proposalId, uint8 support, uint256 weight, string reason)"
);

export interface VoteCastEvent {
  voter: `0x${string}`;
  support: number;
  weight: bigint;
  reason: string;
  txHash: `0x${string}`;
  blockNumber: bigint;
}

export function useVoteCastEvents(proposalId: bigint) {
  const client = usePublicClient();
  const [votes, setVotes] = useState<VoteCastEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!client) return;

    async function fetchVotes() {
      try {
        const logs = await client!.getLogs({
          address: contracts[63].governor,
          event: voteCastEvent,
          fromBlock: 15_700_000n,
          toBlock: "latest",
        });

        const filtered = logs
          .filter((l) => l.args.proposalId === proposalId)
          .map((l) => ({
            voter: l.args.voter!,
            support: Number(l.args.support!),
            weight: l.args.weight!,
            reason: l.args.reason ?? "",
            txHash: l.transactionHash,
            blockNumber: l.blockNumber,
          }))
          .sort((a, b) => Number(a.blockNumber - b.blockNumber));

        setVotes(filtered);
      } catch {
        // Non-critical — vote details are supplementary
      } finally {
        setIsLoading(false);
      }
    }

    fetchVotes();
    const interval = setInterval(fetchVotes, 60_000);
    return () => clearInterval(interval);
  }, [client, proposalId]);

  return { votes, isLoading };
}
