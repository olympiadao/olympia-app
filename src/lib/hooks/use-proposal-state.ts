"use client";

import { useReadContract } from "wagmi";
import { abis } from "@/lib/contracts/config";
import { contracts } from "@/lib/contracts/addresses";
import type { ProposalStateValue } from "@/lib/utils/proposal-states";

export function useProposalState(proposalId: bigint) {
  const { data, isLoading, error } = useReadContract({
    address: contracts[63].governor,
    abi: abis.governor,
    functionName: "state",
    args: [proposalId],
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
  });

  const [againstVotes, forVotes, abstainVotes] = (data as
    | [bigint, bigint, bigint]
    | undefined) ?? [0n, 0n, 0n];

  return { forVotes, againstVotes, abstainVotes, isLoading, error };
}
