"use client";

import { useBalance } from "wagmi";
import { contracts } from "@/lib/contracts/addresses";
import { mordor } from "@/lib/utils/mordor";

export function useTreasuryBalance() {
  return useBalance({
    address: contracts[63].treasury,
    chainId: mordor.id,
    query: { refetchInterval: 60_000 },
  });
}
