import deployment from "./contracts.json";

// Build address map from contracts.json (single source of truth)
const ADDRESSES = Object.fromEntries(
  Object.entries(deployment.contracts).map(([key, c]) => [key, c.address as `0x${string}`])
) as { [K in keyof typeof deployment.contracts]: `0x${string}` };

// Identical addresses on both chains (deterministic CREATE2)
export const contracts = {
  61: ADDRESSES,
  63: ADDRESSES,
} as const;

export type SupportedChainId = keyof typeof contracts;

export type ContractName = keyof typeof ADDRESSES;

export function getContracts(chainId: number) {
  const c = contracts[chainId as SupportedChainId];
  if (!c) throw new Error(`Unsupported chain: ${chainId}`);
  return c;
}

// Re-export deployment metadata for contracts page
export { deployment };
