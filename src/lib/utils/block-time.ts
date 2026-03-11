export function blocksRemaining(
  targetBlock: bigint,
  currentBlock: number
): number {
  const diff = Number(targetBlock) - currentBlock;
  return diff > 0 ? diff : 0;
}

export function estimateTimeMs(
  blocksLeft: number,
  avgBlockTimeMs: number
): number {
  return blocksLeft * avgBlockTimeMs;
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return "now";

  const totalSeconds = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}
