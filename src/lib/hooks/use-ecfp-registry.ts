"use client";

import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
  useWatchContractEvent,
} from "wagmi";
import { abis } from "@/lib/contracts/config";
import { getContracts } from "@/lib/contracts/addresses";
import { useActiveChainId } from "./use-chain";
import { useState, useCallback } from "react";

// ECFPRegistry proposal statuses (matches contract enum)
export const ECFPStatus = {
  Draft: 0,
  Active: 1,
  Approved: 2,
  Rejected: 3,
  Executed: 4,
  Expired: 5,
  Withdrawn: 6,
} as const;

export type ECFPStatusValue = (typeof ECFPStatus)[keyof typeof ECFPStatus];

export const ECFPStatusLabels: Record<ECFPStatusValue, string> = {
  [ECFPStatus.Draft]: "Draft",
  [ECFPStatus.Active]: "Active",
  [ECFPStatus.Approved]: "Approved",
  [ECFPStatus.Rejected]: "Rejected",
  [ECFPStatus.Executed]: "Executed",
  [ECFPStatus.Expired]: "Expired",
  [ECFPStatus.Withdrawn]: "Withdrawn",
};

export const ECFPStatusColors: Record<ECFPStatusValue, string> = {
  [ECFPStatus.Draft]: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  [ECFPStatus.Active]: "text-brand-green bg-brand-green-subtle border-border-brand",
  [ECFPStatus.Approved]: "text-brand-green bg-brand-green-subtle border-border-brand",
  [ECFPStatus.Rejected]: "text-orange-400 bg-orange-400/10 border-orange-400/30",
  [ECFPStatus.Executed]: "text-brand-green bg-brand-green-subtle border-border-brand",
  [ECFPStatus.Expired]: "text-text-subtle bg-bg-elevated border-border-default",
  [ECFPStatus.Withdrawn]: "text-text-subtle bg-bg-elevated border-border-default",
};

// --- Submit Draft ---

export function useSubmitDraft() {
  const chainId = useActiveChainId();
  const c = getContracts(chainId);
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash });

  function submit(
    ecfpId: `0x${string}`,
    recipient: `0x${string}`,
    amount: bigint,
    metadataCID: `0x${string}`
  ) {
    writeContract({
      address: c.ecfpRegistry,
      abi: abis.ecfpRegistry,
      functionName: "submit",
      args: [ecfpId, recipient, amount, metadataCID],
    });
  }

  return { submit, hash, isPending, isConfirming, isSuccess, error };
}

// --- Update Draft ---

export function useUpdateDraft() {
  const chainId = useActiveChainId();
  const c = getContracts(chainId);
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash });

  function updateDraft(
    hashId: `0x${string}`,
    recipient: `0x${string}`,
    amount: bigint,
    metadataCID: `0x${string}`
  ) {
    writeContract({
      address: c.ecfpRegistry,
      abi: abis.ecfpRegistry,
      functionName: "updateDraft",
      args: [hashId, recipient, amount, metadataCID],
    });
  }

  return { updateDraft, hash, isPending, isConfirming, isSuccess, error };
}

// --- Withdraw Draft ---

export function useWithdrawDraft() {
  const chainId = useActiveChainId();
  const c = getContracts(chainId);
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash });

  function withdrawDraft(hashId: `0x${string}`) {
    writeContract({
      address: c.ecfpRegistry,
      abi: abis.ecfpRegistry,
      functionName: "withdrawDraft",
      args: [hashId],
    });
  }

  return { withdrawDraft, hash, isPending, isConfirming, isSuccess, error };
}

// --- Read Proposal ---

export function useRegistryProposal(hashId?: `0x${string}`) {
  const chainId = useActiveChainId();
  const c = getContracts(chainId);
  return useReadContract({
    address: c.ecfpRegistry,
    abi: abis.ecfpRegistry,
    functionName: "getProposal",
    args: hashId ? [hashId] : undefined,
    query: { enabled: !!hashId },
  });
}

// --- Min Review Period ---

export function useMinReviewPeriod() {
  const chainId = useActiveChainId();
  const c = getContracts(chainId);
  return useReadContract({
    address: c.ecfpRegistry,
    abi: abis.ecfpRegistry,
    functionName: "minReviewPeriod",
  });
}

// --- Compute Hash ID ---

export function useComputeHashId(
  ecfpId?: `0x${string}`,
  recipient?: `0x${string}`,
  amount?: bigint,
  metadataCID?: `0x${string}`
) {
  const chainId = useActiveChainId();
  const c = getContracts(chainId);
  const enabled = !!ecfpId && !!recipient && amount !== undefined && !!metadataCID;
  return useReadContract({
    address: c.ecfpRegistry,
    abi: abis.ecfpRegistry,
    functionName: "computeHashId",
    args: enabled ? [ecfpId!, recipient!, amount!, metadataCID!] : undefined,
    query: { enabled },
  });
}

// --- Watch ProposalSubmitted Events ---

export interface RegistrySubmittedEvent {
  hashId: `0x${string}`;
  ecfpId: `0x${string}`;
  recipient: `0x${string}`;
  amount: bigint;
  metadataCID: `0x${string}`;
}

export function useWatchRegistrySubmissions() {
  const chainId = useActiveChainId();
  const c = getContracts(chainId);
  const [events, setEvents] = useState<RegistrySubmittedEvent[]>([]);

  useWatchContractEvent({
    address: c.ecfpRegistry,
    abi: abis.ecfpRegistry,
    eventName: "ProposalSubmitted",
    onLogs(logs) {
      const newEvents = logs
        .filter(
          (log): log is typeof log & {
            args: {
              hashId: `0x${string}`;
              ecfpId: `0x${string}`;
              recipient: `0x${string}`;
              amount: bigint;
              metadataCID: `0x${string}`;
            };
          } => "args" in log && !!log.args
        )
        .map((log) => ({
          hashId: log.args.hashId,
          ecfpId: log.args.ecfpId,
          recipient: log.args.recipient,
          amount: log.args.amount,
          metadataCID: log.args.metadataCID,
        }));
      setEvents((prev) => [...prev, ...newEvents]);
    },
  });

  const reset = useCallback(() => setEvents([]), []);

  return { events, reset };
}
