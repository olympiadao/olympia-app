"use client";

import { useReadContract, useAccount } from "wagmi";
import { abis } from "@/lib/contracts/config";
import { contracts } from "@/lib/contracts/addresses";

export function useMemberBalance(address?: `0x${string}`) {
  return useReadContract({
    address: contracts[63].memberNFT,
    abi: abis.memberNFT,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

export function useIsMember() {
  const { address } = useAccount();
  const { data: balance, isLoading } = useMemberBalance(address);
  return {
    isMember: balance !== undefined && (balance as bigint) > 0n,
    isLoading,
  };
}

export function useTotalMembers() {
  return useReadContract({
    address: contracts[63].memberNFT,
    abi: abis.memberNFT,
    functionName: "totalMembers",
  });
}
