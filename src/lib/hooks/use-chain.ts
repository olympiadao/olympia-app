"use client";

import { useChainId } from "wagmi";
import { getContracts } from "@/lib/contracts/addresses";
import { explorerUrlForChain, isTestnet, nativeSymbol, DEFAULT_CHAIN_ID } from "@/lib/utils/chains";

export function useActiveChainId() {
  const wagmiChainId = useChainId();
  // Fall back to default if wagmi returns unsupported chain
  return wagmiChainId === 61 || wagmiChainId === 63 ? wagmiChainId : DEFAULT_CHAIN_ID;
}

export function useChainContracts() {
  const chainId = useActiveChainId();
  return getContracts(chainId);
}

export function useExplorerUrl() {
  const chainId = useActiveChainId();
  return (type: "tx" | "address" | "block", value: string) =>
    explorerUrlForChain(chainId, type, value);
}

export function useChainMeta() {
  const chainId = useActiveChainId();
  return {
    chainId,
    isTestnet: isTestnet(chainId),
    symbol: nativeSymbol(chainId),
  };
}
