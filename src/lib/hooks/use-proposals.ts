"use client";

import { usePublicClient } from "wagmi";
import { useEffect, useState } from "react";
import { type Log, parseAbiItem } from "viem";
import { contracts } from "@/lib/contracts/addresses";

export interface ProposalCreatedEvent {
  proposalId: bigint;
  proposer: `0x${string}`;
  targets: readonly `0x${string}`[];
  values: readonly bigint[];
  calldatas: readonly `0x${string}`[];
  description: string;
  voteStart: bigint;
  voteEnd: bigint;
  blockNumber: bigint;
}

const proposalCreatedEvent = parseAbiItem(
  "event ProposalCreated(uint256 proposalId, address proposer, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, uint256 voteStart, uint256 voteEnd, string description)"
);

export function useProposals() {
  const client = usePublicClient();
  const [proposals, setProposals] = useState<ProposalCreatedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!client) return;

    async function fetchProposals() {
      try {
        setIsLoading(true);
        const logs = await client!.getLogs({
          address: contracts[63].governor,
          event: proposalCreatedEvent,
          fromBlock: 15_700_000n,
          toBlock: "latest",
        });

        const parsed = logs.map((log: Log<bigint, number, false, typeof proposalCreatedEvent>) => ({
          proposalId: log.args.proposalId!,
          proposer: log.args.proposer!,
          targets: log.args.targets!,
          values: log.args.values!,
          calldatas: log.args.calldatas!,
          description: log.args.description!,
          voteStart: log.args.voteStart!,
          voteEnd: log.args.voteEnd!,
          blockNumber: log.blockNumber,
        }));

        setProposals(parsed.reverse());
      } catch (e) {
        setError(e instanceof Error ? e : new Error("Failed to fetch proposals"));
      } finally {
        setIsLoading(false);
      }
    }

    fetchProposals();
    const interval = setInterval(fetchProposals, 60_000);
    return () => clearInterval(interval);
  }, [client]);

  return { proposals, isLoading, error };
}
