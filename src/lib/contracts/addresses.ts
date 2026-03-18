// Demo v0.2 — deterministic CREATE2 deployment (identical on both chains)
const V0_2_ADDRESSES = {
  governor: "0xb85dbc899472756470ef4033b9637ff8fa2fd23d" as const,
  executor: "0x64624f74f77639cba268a6c8bedc2778b707ef9a" as const,
  timelock: "0xa5839b3e9445f7ee7affdbc796dc0601f9b976c2" as const,
  ecfpRegistry: "0xfb4de5674a6b9a301d16876795a74f3bdacfa722" as const,
  sanctionsOracle: "0xff2b8d7937d908d81c72d20ac99302ee6acc2709" as const,
  memberNFT: "0x73e78d3a3470396325b975fcafa8105a89a9e672" as const,
  treasury: "0x035b2e3c189B772e52F4C3DA6c45c84A3bB871bf" as const,
} as const;

export const contracts = {
  61: V0_2_ADDRESSES,
  63: V0_2_ADDRESSES,
} as const;

export type SupportedChainId = keyof typeof contracts;

export type ContractName = keyof typeof V0_2_ADDRESSES;

export function getContracts(chainId: number) {
  const c = contracts[chainId as SupportedChainId];
  if (!c) throw new Error(`Unsupported chain: ${chainId}`);
  return c;
}
