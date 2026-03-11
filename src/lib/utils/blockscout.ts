const BLOCKSCOUT_URLS: Record<number, string> = {
  63: "https://etc-mordor.blockscout.com",
  61: "https://etc.blockscout.com",
};

export interface BlockscoutStats {
  currentBlock: number;
  avgBlockTimeMs: number;
}

export async function fetchBlockscoutStats(
  chainId: number
): Promise<BlockscoutStats> {
  const baseUrl = BLOCKSCOUT_URLS[chainId];
  if (!baseUrl) throw new Error(`No Blockscout URL for chain ${chainId}`);

  const res = await fetch(`${baseUrl}/api/v2/stats`);
  if (!res.ok) throw new Error(`Blockscout API error: ${res.status}`);

  const data = await res.json();

  return {
    currentBlock: Number(data.total_blocks),
    avgBlockTimeMs: Number(data.average_block_time),
  };
}
