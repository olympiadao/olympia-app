"use client";

import { useReadContract } from "wagmi";
import { abis } from "@/lib/contracts/config";
import { contracts } from "@/lib/contracts/addresses";
import type { ProposalStateValue } from "@/lib/utils/proposal-states";

/** Poll every 60s — catches state transitions within ~4 Mordor blocks */
const POLL_INTERVAL = 60_000;

export function useProposalState(proposalId: bigint) {
  const { data, isLoading, error } = useReadContract({
    address: contracts[63].governor,
    abi: abis.governor,
    functionName: "state",
    args: [proposalId],
    query: { refetchInterval: POLL_INTERVAL },
  });

  return {
    state: data as ProposalStateValue | undefined,
    isLoading,
    error,
  };
}

export function useProposalEta(proposalId: bigint) {
  const { data, isLoading, error } = useReadContract({
    address: contracts[63].governor,
    abi: abis.governor,
    functionName: "proposalEta",
    args: [proposalId],
    query: { refetchInterval: POLL_INTERVAL },
  });

  return {
    eta: data as bigint | undefined,
    isLoading,
    error,
  };
}

export function useProposalVotes(proposalId: bigint) {
  const { data, isLoading, error } = useReadContract({
    address: contracts[63].governor,
    abi: abis.governor,
    functionName: "proposalVotes",
    args: [proposalId],
    query: { refetchInterval: POLL_INTERVAL },
  });

  const [againstVotes, forVotes, abstainVotes] = (data as
    | [bigint, bigint, bigint]
    | undefined) ?? [0n, 0n, 0n];

  return { forVotes, againstVotes, abstainVotes, isLoading, error };
}
