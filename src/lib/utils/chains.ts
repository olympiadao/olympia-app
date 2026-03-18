import { defineChain } from "viem";

// Ethereum Classic Mainnet
export const classic = defineChain({
  id: 61,
  name: "Ethereum Classic",
  nativeCurrency: { name: "Ether", symbol: "ETC", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://etc.rivet.link"] },
  },
  blockExplorers: {
    default: { name: "Blockscout", url: "https://etc.blockscout.com" },
  },
});

// Mordor Testnet
export const mordor = defineChain({
  id: 63,
  name: "Mordor Testnet",
  nativeCurrency: { name: "Mordor ETC", symbol: "METC", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.mordor.etccooperative.org"] },
  },
  blockExplorers: {
    default: { name: "Blockscout", url: "https://etc-mordor.blockscout.com" },
  },
  testnet: true,
});

// Mordor first = default chain during testing
export const supportedChains = [mordor, classic] as const;

export type SupportedChainId = 61 | 63;

export const DEFAULT_CHAIN_ID: SupportedChainId = 63;

export function getChainById(chainId: number) {
  if (chainId === 61) return classic;
  if (chainId === 63) return mordor;
  return undefined;
}

export function isTestnet(chainId: number): boolean {
  return chainId === 63;
}

export function explorerUrlForChain(
  chainId: number,
  type: "tx" | "address" | "block",
  value: string
): string {
  const chain = getChainById(chainId);
  const base = chain?.blockExplorers?.default.url ?? "https://etc-mordor.blockscout.com";
  return `${base}/${type}/${value}`;
}

export function nativeSymbol(chainId: number): string {
  return chainId === 61 ? "ETC" : "METC";
}
