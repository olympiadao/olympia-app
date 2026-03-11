"use client";

import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { encodeFunctionData } from "viem";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { abis } from "@/lib/contracts/config";
import { contracts } from "@/lib/contracts/addresses";
import { Info } from "lucide-react";
import { PROPOSAL_CATEGORIES } from "@/lib/utils/proposal-categories";

export default function NewProposalPage() {
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetAddress, setTargetAddress] = useState("");
  const [etcAmount, setEtcAmount] = useState("");

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const prefixedTitle = category ? `[${category}] ${title}` : title;
    const fullDescription = description
      ? `${prefixedTitle}\n${description}`
      : prefixedTitle;

    // If target + amount provided, encode an executeTreasury call
    if (targetAddress && etcAmount) {
      const calldata = encodeFunctionData({
        abi: abis.executor,
        functionName: "executeTreasury",
        args: [
          targetAddress as `0x${string}`,
          BigInt(Math.floor(parseFloat(etcAmount) * 1e18)),
        ],
      });

      writeContract({
        address: contracts[63].governor,
        abi: abis.governor,
        functionName: "propose",
        args: [
          [contracts[63].executor],
          [0n],
          [calldata],
          fullDescription,
        ],
      });
    } else {
      // Signaling proposal (no-op)
      writeContract({
        address: contracts[63].governor,
        abi: abis.governor,
        functionName: "propose",
        args: [
          [contracts[63].governor],
          [0n],
          ["0x" as `0x${string}`],
          fullDescription,
        ],
      });
    }
  }

  if (isSuccess) {
    return (
      <Card className="py-12 text-center">
        <p className="text-lg font-semibold text-brand-green">
          Proposal submitted
        </p>
        <p className="mt-2 text-sm text-text-muted">
          Your proposal has been created on-chain.
        </p>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Proposal</h1>
        <p className="mt-1 text-sm text-text-muted">
          Create a governance proposal for the Olympia CoreDAO
        </p>
      </div>

      <Card>
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-semantic-info" />
          <div className="space-y-2 text-xs text-text-muted">
            <p>
              Proposals require a title and optional description. To request
              treasury funds, fill in the Treasury Action section with a
              recipient address and ETC amount.
            </p>
            <p>
              Your proposal will enter a <strong>1-block voting delay</strong>,
              then a <strong>100-block voting period</strong> (~22 minutes on
              Mordor). It needs 10% quorum to pass.
            </p>
            <p>
              <strong>Signaling proposals</strong> (no treasury action) are also
              supported — they record community sentiment on-chain without
              moving funds.
            </p>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Proposal Details</CardTitle>
          </CardHeader>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="category"
                className="mb-1 block text-sm font-medium text-text-secondary"
              >
                Category
              </label>
              <select
                id="category"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-border-default bg-bg-elevated px-3 py-2 text-sm text-text-primary focus:border-brand-green focus:outline-none"
              >
                <option value="">Select a category…</option>
                {PROPOSAL_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label} — {c.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="title"
                className="mb-1 block text-sm font-medium text-text-secondary"
              >
                Title
              </label>
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ECFP-001: Fund development of…"
                className="w-full rounded-lg border border-border-default bg-bg-elevated px-3 py-2 text-sm text-text-primary placeholder:text-text-subtle focus:border-brand-green focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-1 block text-sm font-medium text-text-secondary"
              >
                Description (markdown)
              </label>
              <textarea
                id="description"
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the proposal, budget, milestones…"
                className="w-full rounded-lg border border-border-default bg-bg-elevated px-3 py-2 text-sm text-text-primary placeholder:text-text-subtle focus:border-brand-green focus:outline-none"
              />
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Treasury Action (optional)</CardTitle>
          </CardHeader>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="target"
                className="mb-1 block text-sm font-medium text-text-secondary"
              >
                Recipient Address
              </label>
              <input
                id="target"
                type="text"
                value={targetAddress}
                onChange={(e) => setTargetAddress(e.target.value)}
                placeholder="0x…"
                className="w-full rounded-lg border border-border-default bg-bg-elevated px-3 py-2 font-mono text-sm text-text-primary placeholder:text-text-subtle focus:border-brand-green focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="amount"
                className="mb-1 block text-sm font-medium text-text-secondary"
              >
                Amount (ETC)
              </label>
              <input
                id="amount"
                type="number"
                step="0.001"
                min="0"
                value={etcAmount}
                onChange={(e) => setEtcAmount(e.target.value)}
                placeholder="0.0"
                className="w-full rounded-lg border border-border-default bg-bg-elevated px-3 py-2 font-mono text-sm text-text-primary placeholder:text-text-subtle focus:border-brand-green focus:outline-none"
              />
            </div>
          </div>
        </Card>

        {targetAddress && (
          <p className="text-xs text-text-subtle">
            The Executor contract checks the recipient against the sanctions
            oracle before releasing funds (Layer 3 defense).
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={!category || !title || isPending || isConfirming}
        >
          {isPending || isConfirming ? "Submitting…" : "Submit Proposal"}
        </Button>
      </form>
    </div>
  );
}
