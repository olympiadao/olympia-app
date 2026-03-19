"use client";

import { useState } from "react";
import Link from "next/link";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { BaseError, ContractFunctionRevertedError, keccak256, toBytes } from "viem";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { abis } from "@/lib/contracts/config";
import { useChainContracts } from "@/lib/hooks/use-chain";
import { useCheckSanction } from "@/lib/hooks/use-admin";
import { useSubmitDraft } from "@/lib/hooks/use-ecfp-registry";
import { ShieldAlert, FileText, Landmark } from "lucide-react";
import { PROPOSAL_CATEGORIES } from "@/lib/utils/proposal-categories";

function parseContractError(error: Error): string {
  if (error instanceof BaseError) {
    const revertError = error.walk(
      (e) => e instanceof ContractFunctionRevertedError
    );
    if (revertError instanceof ContractFunctionRevertedError) {
      const name = revertError.data?.errorName;
      if (name === "SanctionedRecipient" || name === "NoSanctionedRecipients") {
        return "This recipient address is on the sanctions list. Proposals targeting sanctioned addresses are blocked by the Governor contract.";
      }
      return name ?? "Transaction reverted";
    }
    // User rejected in wallet
    if (error.shortMessage?.includes("User rejected")) {
      return "Transaction was rejected in your wallet.";
    }
    return error.shortMessage ?? error.message;
  }
  return error.message;
}

export default function NewProposalPage() {
  const contracts = useChainContracts();
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetAddress, setTargetAddress] = useState("");
  const [etcAmount, setEtcAmount] = useState("");

  const hasTreasuryAction = !!(targetAddress && etcAmount && parseFloat(etcAmount) > 0);
  const isValidAddress = /^0x[0-9a-fA-F]{40}$/.test(targetAddress);
  const { data: isSanctioned } = useCheckSanction(
    isValidAddress ? (targetAddress as `0x${string}`) : undefined
  );

  // ECFPRegistry path (treasury proposals)
  const {
    submit: submitDraft,
    isPending: isDraftPending,
    isConfirming: isDraftConfirming,
    isSuccess: isDraftSuccess,
    error: draftError,
  } = useSubmitDraft();

  // Governor path (signaling proposals)
  const {
    writeContract,
    data: signalingHash,
    isPending: isSignalingPending,
    error: signalingWriteError,
  } = useWriteContract();
  const {
    isLoading: isSignalingConfirming,
    isSuccess: isSignalingSuccess,
    error: signalingReceiptError,
  } = useWaitForTransactionReceipt({ hash: signalingHash });

  const isPending = isDraftPending || isSignalingPending;
  const isConfirming = isDraftConfirming || isSignalingConfirming;
  const isSuccess = isDraftSuccess || isSignalingSuccess;
  const error = draftError ?? signalingWriteError ?? signalingReceiptError;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const prefixedTitle = category ? `[${category}] ${title}` : title;
    const fullDescription = description
      ? `${prefixedTitle}\n${description}`
      : prefixedTitle;

    if (hasTreasuryAction) {
      // Treasury proposals go through ECFPRegistry
      const ecfpId = keccak256(toBytes(prefixedTitle));
      const metadataCID = keccak256(toBytes(fullDescription));
      const amount = BigInt(Math.floor(parseFloat(etcAmount) * 1e18));

      submitDraft(ecfpId, targetAddress as `0x${string}`, amount, metadataCID);
    } else {
      // Signaling proposals go directly to Governor
      writeContract({
        address: contracts.governor,
        abi: abis.governor,
        functionName: "propose",
        args: [
          [contracts.governor],
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
          {isDraftSuccess ? "Draft submitted to ECFPRegistry" : "Proposal submitted"}
        </p>
        <p className="mt-2 text-sm text-text-muted">
          {isDraftSuccess
            ? "Your funding proposal is now in Draft status. It must wait the 5-minute review period before an admin can activate it for governance voting."
            : "Your signaling proposal has been created on-chain."}
        </p>
        {isDraftSuccess && (
          <p className="mt-3 text-xs text-text-subtle">
            Track your draft on the{" "}
            <Link href="/proposals/drafts" className="text-brand-green hover:underline">
              Drafts page
            </Link>
          </p>
        )}
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
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Landmark className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
            <div className="space-y-1 text-xs text-text-muted">
              <p className="font-medium text-text-secondary">Treasury Proposals (ECFP)</p>
              <p>
                Fill in the Treasury Action section to submit a funding proposal
                to the <strong>ECFPRegistry</strong>. Your draft enters a{" "}
                <strong>5-minute review period</strong>, then an admin activates
                it for a <strong>100-block governance vote</strong> (~22 min on
                Mordor). Requires 10% quorum.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-semantic-info" />
            <div className="space-y-1 text-xs text-text-muted">
              <p className="font-medium text-text-secondary">Signaling Proposals</p>
              <p>
                Leave the Treasury Action empty to submit directly to the{" "}
                <strong>Governor</strong>. Records community sentiment on-chain
                without moving funds.
              </p>
            </div>
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
                className={`w-full rounded-lg border bg-bg-elevated px-3 py-2 font-mono text-sm text-text-primary placeholder:text-text-subtle focus:outline-none ${
                  isSanctioned === true
                    ? "border-semantic-error focus:border-semantic-error"
                    : "border-border-default focus:border-brand-green"
                }`}
              />
              {isSanctioned === true && (
                <div className="mt-1.5 flex items-start gap-1.5 text-semantic-error">
                  <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <p className="text-xs">
                    This address is on the sanctions list. Proposals targeting
                    sanctioned addresses will be rejected by the Governor
                    contract.
                  </p>
                </div>
              )}
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

        {error && (
          <Card className="border-semantic-error/40 bg-semantic-error/10">
            <div className="flex items-start gap-2">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-semantic-error" />
              <div className="text-xs text-semantic-error">
                <p className="font-medium">Transaction failed</p>
                <p className="mt-1">{parseContractError(error)}</p>
              </div>
            </div>
          </Card>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={
            !category || !title || isPending || isConfirming || isSanctioned === true
          }
        >
          {isPending || isConfirming ? "Submitting…" : "Submit Proposal"}
        </Button>
      </form>
    </div>
  );
}
