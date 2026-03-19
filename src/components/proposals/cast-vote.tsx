"use client";

import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Button } from "@/components/ui/button";
import { abis } from "@/lib/contracts/config";
import { useChainContracts } from "@/lib/hooks/use-chain";

const REASON_MAX_LENGTH = 256;

interface CastVoteProps {
  proposalId: bigint;
}

export function CastVote({ proposalId }: CastVoteProps) {
  const contracts = useChainContracts();
  const [reason, setReason] = useState("");
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  function vote(support: number) {
    const trimmed = reason.trim();
    if (trimmed) {
      writeContract({
        address: contracts.governor,
        abi: abis.governor,
        functionName: "castVoteWithReason",
        args: [proposalId, support, trimmed],
      });
    } else {
      writeContract({
        address: contracts.governor,
        abi: abis.governor,
        functionName: "castVote",
        args: [proposalId, support],
      });
    }
  }

  if (isSuccess) {
    return (
      <p className="text-sm text-brand-green">Vote cast successfully</p>
    );
  }

  const loading = isPending || isConfirming;

  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={reason}
        onChange={(e) =>
          setReason(e.target.value.slice(0, REASON_MAX_LENGTH))
        }
        placeholder="Reason (optional)"
        maxLength={REASON_MAX_LENGTH}
        rows={2}
        disabled={loading}
        className="w-full resize-none rounded-lg border border-border-subtle bg-bg-elevated px-3 py-2 text-xs text-text-primary placeholder:text-text-subtle focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green disabled:opacity-50"
      />
      <p className="text-right text-xs text-text-subtle">
        {reason.length}/{REASON_MAX_LENGTH}
      </p>
      <Button
        variant="primary"
        size="sm"
        onClick={() => vote(1)}
        disabled={loading}
      >
        {loading ? "Submitting…" : "For"}
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => vote(0)}
        disabled={loading}
      >
        Against
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => vote(2)}
        disabled={loading}
      >
        Abstain
      </Button>
    </div>
  );
}
