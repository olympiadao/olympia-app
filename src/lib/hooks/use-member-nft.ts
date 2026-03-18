"use client";

import { useReadContract, useAccount, usePublicClient } from "wagmi";
import { useEffect, useState } from "react";
import { parseAbiItem } from "viem";
import { abis } from "@/lib/contracts/config";
import { getContracts } from "@/lib/contracts/addresses";
import { useActiveChainId } from "./use-chain";

export function useMemberBalance(address?: `0x${string}`) {
  const chainId = useActiveChainId();
  const c = getContracts(chainId);
  return useReadContract({
    address: c.memberNFT,
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
  const chainId = useActiveChainId();
  const c = getContracts(chainId);
  return useReadContract({
    address: c.memberNFT,
    abi: abis.memberNFT,
    functionName: "totalSupply",
    query: { refetchInterval: 60_000 },
  });
}

export interface Member {
  address: `0x${string}`;
  tokenId: bigint;
  blockNumber: bigint;
}

const transferEvent = parseAbiItem(
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
);

export function useMembers() {
  const client = usePublicClient();
  const chainId = useActiveChainId();
  const c = getContracts(chainId);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!client) return;

    async function fetchMembers() {
      try {
        setIsLoading(true);

        // Fetch mint events (from = zero address)
        const mintLogs = await client!.getLogs({
          address: c.memberNFT,
          event: transferEvent,
          args: {
            from: "0x0000000000000000000000000000000000000000",
          },
          fromBlock: 15_700_000n,
          toBlock: "latest",
        });

        // Fetch burn events (to = zero address)
        const burnLogs = await client!.getLogs({
          address: c.memberNFT,
          event: transferEvent,
          args: {
            to: "0x0000000000000000000000000000000000000000",
          },
          fromBlock: 15_700_000n,
          toBlock: "latest",
        });

        const burnedTokenIds = new Set(
          burnLogs.map((log) => log.args.tokenId!.toString())
        );

        const parsed = mintLogs
          .filter((log) => !burnedTokenIds.has(log.args.tokenId!.toString()))
          .map((log) => ({
            address: log.args.to!,
            tokenId: log.args.tokenId!,
            blockNumber: log.blockNumber,
          }));

        setMembers(parsed);
      } catch {
        // Silently fail — members list is supplementary
      } finally {
        setIsLoading(false);
      }
    }

    fetchMembers();
    const interval = setInterval(fetchMembers, 60_000);
    return () => clearInterval(interval);
  }, [client, c.memberNFT]);

  return { members, isLoading };
}
