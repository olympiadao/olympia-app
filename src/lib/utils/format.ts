import { formatEther } from "viem";

export function truncateAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`;
}

export function formatEtc(wei: bigint, decimals = 4): string {
  const value = Number(formatEther(wei));
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

export function explorerUrl(type: "tx" | "address" | "block", value: string): string {
  return `https://etc-mordor.blockscout.com/${type}/${value}`;
}
