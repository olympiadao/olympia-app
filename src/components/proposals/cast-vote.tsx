"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Button } from "@/components/ui/button";
import { abis } from "@/lib/contracts/config";
import { contracts } from "@/lib/contracts/addresses";

interface CastVoteProps {
  proposalId: bigint;
}

export function CastVote({ proposalId }: CastVoteProps) {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  function vote(support: number) {
    writeContract({
      address: contracts[63].governor,
      abi: abis.governor,
      functionName: "castVote",
      args: [proposalId, support],
    });
  }

  if (isSuccess) {
    return (
      <p className="text-sm text-brand-green">Vote cast successfully</p>
    );
  }

  const loading = isPending || isConfirming;

  return (
    <div className="flex flex-col gap-2">
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
