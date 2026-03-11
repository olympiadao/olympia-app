"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { keccak256, toBytes } from "viem";
import { abis } from "@/lib/contracts/config";
import { contracts } from "@/lib/contracts/addresses";

export function useQueueProposal() {
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
      address: contracts[63].governor,
      abi: abis.governor,
      functionName: "queue",
      args: [[...targets], [...values], [...calldatas], descriptionHash],
    });
  }

  return { queue, hash, isPending, isConfirming, isSuccess, error };
}

export function useExecuteProposal() {
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
      address: contracts[63].governor,
      abi: abis.governor,
      functionName: "execute",
      args: [[...targets], [...values], [...calldatas], descriptionHash],
    });
  }

  return { execute, hash, isPending, isConfirming, isSuccess, error };
}
