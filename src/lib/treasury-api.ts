import { formatEther } from "viem";
import { getContracts } from "@/lib/contracts/addresses";
import { getChainById, nativeSymbol } from "@/lib/utils/chains";

// ---------- Types ----------

export interface TreasuryBalance {
  wei: bigint;
  formatted: string;
}

export interface TreasuryTransaction {
  hash: string;
  blockNumber: number;
  timestamp: string;
  from: string;
  to: string;
  value: string;
  type: "inflow" | "outflow";
  governance: boolean;
}

export interface MinedBlocksData {
  blockRewards: bigint;
  txFees: bigint;
  blockCount: number;
}

export interface TreasuryStats {
  balance: TreasuryBalance;
  totalInflow: string;
  totalOutflow: string;
  totalDonations: string;
  minedIncome: string;
  baseFeeIncome: string;
  blockCount: number;
  txCount: number;
}

export interface BalanceEvent {
  blockNumber: number;
  timestamp: string;
  delta: number;
  source: "mining" | "donation" | "withdrawal";
}

// ---------- Chain config adapter ----------

function getChainConfig(chainId: number) {
  const chain = getChainById(chainId);
  const c = getContracts(chainId);
  const base =
    chain?.blockExplorers?.default.url ?? "https://etc-mordor.blockscout.com";
  return {
    api: `${base}/api/v2`,
    treasury: c.treasury,
    executor: c.executor,
    eraLength: chainId === 61 ? 5_000_000 : 2_000_000,
    symbol: nativeSymbol(chainId),
    explorer: base,
  };
}

// ---------- Blockscout API types ----------

interface BlockscoutAddress {
  coin_balance: string;
}

interface BlockscoutTx {
  hash: string;
  block_number: number;
  timestamp: string;
  from: { hash: string };
  to: { hash: string } | null;
  value: string;
}

interface BlockscoutInternalTx {
  transaction_hash: string;
  block_number: number;
  timestamp: string;
  from: { hash: string };
  to: { hash: string } | null;
  value: string;
  type: string;
}

interface BlockscoutBlock {
  height: number;
  timestamp: string;
  rewards: { reward: string; type: string }[];
  transaction_fees: string;
}

interface BlockscoutResponse<T> {
  items: T[];
  next_page_params: Record<string, string> | null;
}

// ---------- ECIP-1017 ----------

/** ECIP-1017: 5 ETC base reward, reduced by 4/5 each era */
function ecip1017Reward(blockNumber: number, eraLength: number): bigint {
  const era = Math.floor(blockNumber / eraLength);
  let reward = 5_000_000_000_000_000_000n; // 5 ETC in wei
  for (let i = 0; i < era; i++) {
    reward = (reward * 4n) / 5n;
  }
  return reward;
}

// ---------- Fetch functions ----------

export async function fetchBalance(
  chainId: number
): Promise<TreasuryBalance> {
  const { api, treasury } = getChainConfig(chainId);
  const res = await fetch(`${api}/addresses/${treasury}`);
  const data: BlockscoutAddress = await res.json();
  const wei = BigInt(data.coin_balance);
  return { wei, formatted: formatEther(wei) };
}

export async function fetchMinedBlocks(
  chainId: number
): Promise<MinedBlocksData> {
  const { api, treasury, eraLength } = getChainConfig(chainId);
  let blockRewards = 0n;
  let txFees = 0n;
  let blockCount = 0;
  let url: string | null = `${api}/addresses/${treasury}/blocks-validated`;

  while (url) {
    const res = await fetch(url);
    if (!res.ok) break;
    const data: BlockscoutResponse<BlockscoutBlock> = await res.json();

    for (const block of data.items ?? []) {
      blockCount++;
      blockRewards += ecip1017Reward(block.height, eraLength);
      if (block.transaction_fees) {
        txFees += BigInt(block.transaction_fees);
      }
    }

    if (data.next_page_params) {
      const entries = Object.entries(data.next_page_params).map(
        ([k, v]) => [k, String(v)] as [string, string]
      );
      const params = new URLSearchParams(entries);
      url = `${api}/addresses/${treasury}/blocks-validated?${params}`;
    } else {
      url = null;
    }
  }

  return { blockRewards, txFees, blockCount };
}

export async function fetchTransactions(
  chainId: number
): Promise<TreasuryTransaction[]> {
  const { api, treasury, executor } = getChainConfig(chainId);
  const addr = treasury.toLowerCase();
  const executorAddr = executor.toLowerCase();

  const normalRes = await fetch(`${api}/addresses/${treasury}/transactions`);
  const normalData: BlockscoutResponse<BlockscoutTx> = await normalRes.json();

  const normal: TreasuryTransaction[] = (normalData.items ?? [])
    .filter((tx) => BigInt(tx.value) > 0n)
    .map((tx) => ({
      hash: tx.hash,
      blockNumber: tx.block_number,
      timestamp: tx.timestamp,
      from: tx.from.hash,
      to: tx.to?.hash ?? "",
      value: formatEther(BigInt(tx.value)),
      type: tx.from.hash.toLowerCase() === addr ? "outflow" : "inflow",
      governance: false,
    }));

  const internalRes = await fetch(
    `${api}/addresses/${treasury}/internal-transactions`
  );
  const internalData: BlockscoutResponse<BlockscoutInternalTx> =
    await internalRes.json();

  const internal: TreasuryTransaction[] = (internalData.items ?? [])
    .filter((tx) => tx.type === "call" && BigInt(tx.value) > 0n)
    .map((tx) => {
      const isOutflow = tx.from.hash.toLowerCase() === addr;
      const isGovernance =
        isOutflow || tx.from.hash.toLowerCase() === executorAddr;
      return {
        hash: tx.transaction_hash,
        blockNumber: tx.block_number,
        timestamp: tx.timestamp,
        from: tx.from.hash,
        to: tx.to?.hash ?? "",
        value: formatEther(BigInt(tx.value)),
        type: isOutflow ? ("outflow" as const) : ("inflow" as const),
        governance: isGovernance,
      };
    });

  // Dedupe by hash
  const map = new Map<string, TreasuryTransaction>();
  for (const tx of [...normal, ...internal]) {
    const existing = map.get(tx.hash);
    if (!existing) {
      map.set(tx.hash, tx);
    } else if (tx.type === "outflow" && existing.type !== "outflow") {
      map.set(tx.hash, tx);
    } else if (parseFloat(tx.value) > parseFloat(existing.value)) {
      map.set(tx.hash, tx);
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => b.blockNumber - a.blockNumber
  );
}

export async function fetchBalanceHistory(
  chainId: number
): Promise<BalanceEvent[]> {
  const [transactions, minedBlocksRaw] = await Promise.all([
    fetchTransactions(chainId),
    fetchMinedBlocksRaw(chainId),
  ]);

  const { eraLength } = getChainConfig(chainId);
  const events: BalanceEvent[] = [];

  for (const tx of transactions) {
    const val = parseFloat(tx.value);
    events.push({
      blockNumber: tx.blockNumber,
      timestamp: tx.timestamp,
      delta: tx.type === "inflow" ? val : -val,
      source: tx.type === "inflow" ? "donation" : "withdrawal",
    });
  }

  for (const block of minedBlocksRaw) {
    const reward =
      parseFloat(formatEther(ecip1017Reward(block.height, eraLength))) +
      parseFloat(formatEther(BigInt(block.transaction_fees || "0")));
    if (reward > 0) {
      events.push({
        blockNumber: block.height,
        timestamp: block.timestamp,
        delta: reward,
        source: "mining",
      });
    }
  }

  return events.sort((a, b) => a.blockNumber - b.blockNumber);
}

async function fetchMinedBlocksRaw(
  chainId: number
): Promise<BlockscoutBlock[]> {
  const { api, treasury } = getChainConfig(chainId);
  const blocks: BlockscoutBlock[] = [];
  let url: string | null = `${api}/addresses/${treasury}/blocks-validated`;

  while (url) {
    const res = await fetch(url);
    if (!res.ok) break;
    const data: BlockscoutResponse<BlockscoutBlock> = await res.json();
    blocks.push(...(data.items ?? []));

    if (data.next_page_params) {
      const entries = Object.entries(data.next_page_params).map(
        ([k, v]) => [k, String(v)] as [string, string]
      );
      const params = new URLSearchParams(entries);
      url = `${api}/addresses/${treasury}/blocks-validated?${params}`;
    } else {
      url = null;
    }
  }

  return blocks;
}

export async function fetchStats(chainId: number): Promise<TreasuryStats> {
  const [balance, transactions, minedBlocks] = await Promise.all([
    fetchBalance(chainId),
    fetchTransactions(chainId),
    fetchMinedBlocks(chainId),
  ]);

  let totalOutflow = 0n;
  let totalDonations = 0n;

  for (const tx of transactions) {
    const wei = BigInt(Math.round(parseFloat(tx.value) * 1e18));
    if (tx.type === "outflow") {
      totalOutflow += wei;
    } else {
      totalDonations += wei;
    }
  }

  const totalInflow = balance.wei + totalOutflow;

  return {
    balance,
    totalInflow: formatEther(totalInflow),
    totalOutflow: formatEther(totalOutflow),
    totalDonations: formatEther(totalDonations),
    minedIncome: formatEther(minedBlocks.blockRewards + minedBlocks.txFees),
    baseFeeIncome: "0",
    blockCount: minedBlocks.blockCount,
    txCount: transactions.length,
  };
}
