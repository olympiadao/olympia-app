import { decodeFunctionData, formatEther } from "viem";
import ExecutorABI from "@/lib/contracts/abis/OlympiaExecutor.json";
import { contracts } from "@/lib/contracts/addresses";

export interface DecodedAction {
  type: "Treasury Withdrawal" | "Signaling" | "Unknown";
  target: `0x${string}`;
  targetLabel: string;
  recipient?: `0x${string}`;
  amount?: bigint;
  amountFormatted?: string;
  rawCalldata: `0x${string}`;
}

export function decodeProposalActions(
  targets: readonly `0x${string}`[],
  values: readonly bigint[],
  calldatas: readonly `0x${string}`[]
): DecodedAction[] {
  return targets.map((target, i) => {
    const calldata = calldatas[i] ?? ("0x" as `0x${string}`);
    const targetLabel = resolveTargetLabel(target);

    // Signaling proposal — empty calldata
    if (calldata === "0x" || calldata.length <= 2) {
      return {
        type: "Signaling",
        target,
        targetLabel,
        rawCalldata: calldata,
      };
    }

    // Try to decode executeTreasury(address, uint256)
    try {
      const decoded = decodeFunctionData({
        abi: ExecutorABI,
        data: calldata,
      });

      if (decoded.functionName === "executeTreasury") {
        const [recipient, amount] = decoded.args as [`0x${string}`, bigint];
        return {
          type: "Treasury Withdrawal",
          target,
          targetLabel,
          recipient,
          amount,
          amountFormatted: formatEther(amount),
          rawCalldata: calldata,
        };
      }
    } catch {
      // Not an executor call — fall through
    }

    return {
      type: "Unknown",
      target,
      targetLabel,
      rawCalldata: calldata,
    };
  });
}

function resolveTargetLabel(address: `0x${string}`): string {
  const c = contracts[63];
  const labels: Record<string, string> = {
    [c.executor.toLowerCase()]: "OlympiaExecutor",
    [c.governor.toLowerCase()]: "OlympiaGovernor",
    [c.timelock.toLowerCase()]: "TimelockController",
    [c.treasury.toLowerCase()]: "OlympiaTreasury",
    [c.ecfpRegistry.toLowerCase()]: "ECFPRegistry",
    [c.sanctionsOracle.toLowerCase()]: "SanctionsOracle",
    [c.memberNFT.toLowerCase()]: "OlympiaMemberNFT",
  };
  return labels[address.toLowerCase()] ?? "Unknown Contract";
}
