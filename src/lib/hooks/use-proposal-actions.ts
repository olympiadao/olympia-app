"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { keccak256, toBytes } from "viem";
import { abis } from "@/lib/contracts/config";
import { getContracts } from "@/lib/contracts/addresses";
import { useActiveChainId } from "./use-chain";

export function useQueueProposal() {
  const chainId = useActiveChainId();
  const c = getContracts(chainId);
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash });

  function queue(
    targets: readonly `0x${string}`[],
    values: readonly bigint[],
    calldatas: readonly `0x${string}`[],
    description: string
  ) {
    const descriptionHash = keccak256(toBytes(description));
    writeContract({
      address: c.governor,
      abi: abis.governor,
      functionName: "queue",
      args: [[...targets], [...values], [...calldatas], descriptionHash],
    });
  }

  return { queue, hash, isPending, isConfirming, isSuccess, error };
}

export function useExecuteProposal() {
  const chainId = useActiveChainId();
  const c = getContracts(chainId);
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash });

  function execute(
    targets: readonly `0x${string}`[],
    values: readonly bigint[],
    calldatas: readonly `0x${string}`[],
    description: string
  ) {
    const descriptionHash = keccak256(toBytes(description));
    writeContract({
      address: c.governor,
      abi: abis.governor,
      functionName: "execute",
      args: [[...targets], [...values], [...calldatas], descriptionHash],
    });
  }

  return { execute, hash, isPending, isConfirming, isSuccess, error };
}

export function useCancelIfSanctioned() {
  const chainId = useActiveChainId();
  const c = getContracts(chainId);
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash });

  function cancelIfSanctioned(proposalId: bigint) {
    writeContract({
      address: c.governor,
      abi: abis.governor,
      functionName: "cancelIfSanctioned",
      args: [proposalId],
    });
  }

  return { cancelIfSanctioned, hash, isPending, isConfirming, isSuccess, error };
}
