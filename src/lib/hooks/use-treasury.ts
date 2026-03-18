"use client";

import { useBalance } from "wagmi";
import { getContracts } from "@/lib/contracts/addresses";
import { useActiveChainId } from "./use-chain";

export function useTreasuryBalance() {
  const chainId = useActiveChainId();
  const c = getContracts(chainId);
  return useBalance({
    address: c.treasury,
    chainId,
    query: { refetchInterval: 60_000 },
  });
}
