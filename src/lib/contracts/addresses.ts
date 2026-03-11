export const contracts = {
  63: {
    governor: "0xEdbD61F1cE825CF939beBB422F8C914a69826dDA" as const,
    executor: "0x94d4f74dDdE715Ed195B597A3434713690B14e97" as const,
    timelock: "0x1E0fADee5540a77012f1944fcce58677fC087f6e" as const,
    ecfpRegistry: "0xcB532fe70299D53Cc81B5F6365f56A108784d05d" as const,
    sanctionsOracle: "0xEeeb33c8b7C936bD8e72A859a3e1F9cc8A26f3B4" as const,
    memberNFT: "0x720676EBfe45DECfC43c8E9870C64413a2480EE0" as const,
    treasury: "0xd6165F3aF4281037bce810621F62B43077Fb0e37" as const,
  },
} as const;

export type SupportedChainId = keyof typeof contracts;

export function getContracts(chainId: number) {
  const c = contracts[chainId as SupportedChainId];
  if (!c) throw new Error(`Unsupported chain: ${chainId}`);
  return c;
}
