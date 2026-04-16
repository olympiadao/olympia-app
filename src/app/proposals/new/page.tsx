"use client";

import { useState } from "react";
import Link from "next/link";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { BaseError, ContractFunctionRevertedError, formatEther, keccak256, toBytes } from "viem";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { abis } from "@/lib/contracts/config";
import { useChainContracts } from "@/lib/hooks/use-chain";
import { useCheckSanction } from "@/lib/hooks/use-admin";
import {
  useSubmitDraft,
  useSubmissionBond,
  useActiveDraftCount,
  usePendingRefund,
  useClaimRefund,
  useMaxDraftsPerAddress,
} from "@/lib/hooks/use-ecfp-registry";
import { ShieldAlert, FileText, Landmark, AlertCircle } from "lucide-react";
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
  const [bondAcknowledged, setBondAcknowledged] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  const hasTreasuryAction = !!(targetAddress && etcAmount && parseFloat(etcAmount) > 0);
  const isValidAddress = /^0x[0-9a-fA-F]{40}$/.test(targetAddress);
  const { data: isSanctioned } = useCheckSanction(
    isValidAddress ? (targetAddress as `0x${string}`) : undefined
  );

  const { address: connectedAddress } = useAccount();

  // ECFPRegistry path (treasury proposals)
  const { data: submissionBond } = useSubmissionBond();
  const { data: maxDrafts } = useMaxDraftsPerAddress();
  const { data: activeDrafts } = useActiveDraftCount(connectedAddress);
  const { data: pendingRefund } = usePendingRefund(connectedAddress);
  const { claimRefund, isPending: isClaimPending } = useClaimRefund();
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

    // Honeypot: bots fill this field, humans never see it
    if (honeypot) return;

    const prefixedTitle = category ? `[${category}] ${title}` : title;
    const fullDescription = description
      ? `${prefixedTitle}\n${description}`
      : prefixedTitle;

    if (hasTreasuryAction) {
      // Treasury proposals go through ECFPRegistry
      const ecfpId = keccak256(toBytes(prefixedTitle));
      const metadataCID = keccak256(toBytes(fullDescription));
      const amount = BigInt(Math.floor(parseFloat(etcAmount) * 1e18));

      submitDraft(ecfpId, targetAddress as `0x${string}`, amount, metadataCID, (submissionBond as bigint | undefined) ?? 0n);
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
            ? "Your funding proposal is now in Draft status. It must wait the 5-minute review period before a maintainer can activate it for governance voting."
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

  const hasPendingRefund = pendingRefund !== undefined && (pendingRefund as bigint) > 0n;
  const bondEtc = submissionBond ? formatEther(submissionBond as bigint) : null;
  const draftsUsed = activeDrafts !== undefined ? Number(activeDrafts as bigint) : null;
  const draftsMax = maxDrafts !== undefined ? Number(maxDrafts as bigint) : null;
  const atDraftCap = draftsUsed !== null && draftsMax !== null && draftsUsed >= draftsMax;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Proposal</h1>
        <p className="mt-1 text-sm text-text-muted">
          Create a governance proposal for Olympia DAO
        </p>
      </div>

      {hasPendingRefund && (
        <Card className="border-brand-green/40 bg-brand-green/5">
          <div className="flex items-start justify-between gap-4">
            <div className="text-sm">
              <p className="font-medium text-brand-green">Pending Bond Refund</p>
              <p className="mt-0.5 text-text-muted">
                You have{" "}
                <span className="font-mono font-medium text-text-primary">
                  {formatEther(pendingRefund as bigint)} ETC
                </span>{" "}
                available to claim from a previously activated proposal.
              </p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="shrink-0 border-brand-green/40 text-brand-green hover:bg-brand-green/10"
              onClick={() => claimRefund()}
              disabled={isClaimPending}
            >
              {isClaimPending ? "Claiming…" : "Claim Refund"}
            </Button>
          </div>
        </Card>
      )}

      <Card>
        <div className="flex items-start gap-2">
          <Landmark className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
          <div className="space-y-1 text-xs text-text-muted">
            <p className="font-medium text-text-secondary">Funding Proposal (ECFP)</p>
            <p>
              Add a <strong>recipient address</strong> and{" "}
              <strong>ETC amount</strong> below to request treasury funding.
              Your proposal enters a{" "}
              <strong>5-minute review period</strong> as a draft, then a
              maintainer activates it for a{" "}
              <strong>100-block governance vote</strong> (~22 min on Mordor).
              Requires 10% quorum.
            </p>
            {bondEtc && (
              <p className="mt-1 text-text-secondary">
                <strong>Submission bond: {bondEtc} ETC.</strong> Returned in full
                when activated. Forfeited to the treasury if expired as spam or
                low quality.
              </p>
            )}
            {draftsUsed !== null && draftsMax !== null && (
              <p className={atDraftCap ? "font-medium text-semantic-error" : ""}>
                Draft slots: {draftsUsed} / {draftsMax} used
                {atDraftCap && " — cap reached, withdraw or wait for activation"}
              </p>
            )}
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Honeypot: invisible to humans, filled by bots. Field name is intentionally generic. */}
        <input
          name="url"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0 }}
        />

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
                    {c.label} : {c.description}
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
          <div className="flex items-start gap-2">
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-semantic-info" />
            <div className="space-y-1 text-xs text-text-muted">
              <p className="font-medium text-text-secondary">Signaling Proposal</p>
              <p>
                Skip the recipient and amount fields to submit a vote-only
                proposal. Records community sentiment on-chain without moving
                funds.
              </p>
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

        {hasTreasuryAction && bondEtc && (
          <Card className="border-border-default bg-bg-elevated">
            <div className="flex items-start gap-3">
              <input
                id="bond-ack"
                type="checkbox"
                checked={bondAcknowledged}
                onChange={(e) => setBondAcknowledged(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 accent-brand-green"
              />
              <label htmlFor="bond-ack" className="text-xs text-text-muted">
                <span className="block font-medium text-text-secondary">Bond Agreement</span>
                I understand that submitting this proposal requires a{" "}
                <strong className="text-text-primary">{bondEtc} ETC bond</strong> held by
                the ECFPRegistry contract. This bond will be{" "}
                <strong>returned in full</strong> if my proposal is activated by the
                council, or <strong>forfeited to the treasury</strong> if my proposal
                is marked as spam, low quality, out of scope, or otherwise fails the
                intake review. I confirm this proposal represents genuine work with
                verifiable deliverables.
              </label>
            </div>
          </Card>
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

        {atDraftCap && (
          <div className="flex items-start gap-2 text-xs text-semantic-error">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p>
              Draft cap reached ({draftsUsed}/{draftsMax}). Withdraw an existing
              draft or wait for one to be activated before submitting another
              funding proposal.
            </p>
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={
            !category ||
            !title ||
            isPending ||
            isConfirming ||
            isSanctioned === true ||
            atDraftCap ||
            (hasTreasuryAction && bondEtc !== null && !bondAcknowledged)
          }
        >
          {isPending || isConfirming ? "Submitting…" : "Submit Proposal"}
        </Button>
      </form>
    </div>
  );
}
