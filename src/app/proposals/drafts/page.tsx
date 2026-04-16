"use client";

import { useEffect, useState } from "react";
import { usePublicClient, useAccount } from "wagmi";
import { type Log, parseAbiItem, formatEther } from "viem";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getContracts } from "@/lib/contracts/addresses";
import { useActiveChainId, useExplorerUrl, useChainMeta } from "@/lib/hooks/use-chain";
import {
  useRegistryProposal,
  useWithdrawDraft,
  useMinReviewPeriod,
  useMaxDraftsPerAddress,
  useActiveDraftCount,
  usePendingRefund,
  useBondOf,
  useClaimRefund,
  ECFPStatus,
  ECFPStatusLabels,
  ECFPStatusColors,
} from "@/lib/hooks/use-ecfp-registry";
import { truncateAddress } from "@/lib/utils/format";
import { Clock, FileX, FileEdit, Info, Coins } from "lucide-react";
import Link from "next/link";

const proposalSubmittedEvent = parseAbiItem(
  "event ProposalSubmitted(bytes32 indexed hashId, bytes32 ecfpId, address recipient, uint256 amount, bytes32 metadataCID)"
);

interface SubmittedDraft {
  hashId: `0x${string}`;
  ecfpId: `0x${string}`;
  recipient: `0x${string}`;
  amount: bigint;
  metadataCID: `0x${string}`;
  blockNumber: bigint;
}

function useRegistryDrafts() {
  const client = usePublicClient();
  const chainId = useActiveChainId();
  const [drafts, setDrafts] = useState<SubmittedDraft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!client) return;
    const c = getContracts(chainId);

    async function fetchDrafts() {
      try {
        setIsLoading(true);
        const logs = await client!.getLogs({
          address: c.ecfpRegistry,
          event: proposalSubmittedEvent,
          fromBlock: 15_700_000n,
          toBlock: "latest",
        });

        const parsed = logs.map(
          (
            log: Log<
              bigint,
              number,
              false,
              typeof proposalSubmittedEvent
            >
          ) => ({
            hashId: log.args.hashId!,
            ecfpId: log.args.ecfpId!,
            recipient: log.args.recipient!,
            amount: log.args.amount!,
            metadataCID: log.args.metadataCID!,
            blockNumber: log.blockNumber,
          })
        );

        setDrafts(parsed.reverse());
      } catch (e) {
        setError(
          e instanceof Error ? e : new Error("Failed to fetch drafts")
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchDrafts();
    const interval = setInterval(fetchDrafts, 30_000);
    return () => clearInterval(interval);
  }, [client, chainId]);

  return { drafts, isLoading, error };
}

export default function DraftsPage() {
  const { drafts, isLoading, error } = useRegistryDrafts();
  const { data: minReview } = useMinReviewPeriod();
  const { address } = useAccount();
  const { data: maxDrafts } = useMaxDraftsPerAddress();
  const { data: activeDrafts } = useActiveDraftCount(address);
  const { data: pendingRefund } = usePendingRefund(address);
  const { claimRefund, isPending: isClaimPending } = useClaimRefund();

  const hasPendingRefund = pendingRefund !== undefined && (pendingRefund as bigint) > 0n;
  const draftsUsed = activeDrafts !== undefined ? Number(activeDrafts as bigint) : null;
  const draftsMax = maxDrafts !== undefined ? Number(maxDrafts as bigint) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">ECFP Drafts</h1>
          <p className="mt-1 text-sm text-text-muted">
            Treasury funding proposals submitted to the ECFPRegistry
            {draftsUsed !== null && draftsMax !== null && (
              <span className={`ml-2 text-xs font-medium ${draftsUsed >= draftsMax ? "text-semantic-error" : "text-text-subtle"}`}>
                ({draftsUsed}/{draftsMax} draft slots used)
              </span>
            )}
          </p>
        </div>
        <Link href="/proposals/new">
          <Button size="md">
            <FileEdit className="h-4 w-4" />
            New Draft
          </Button>
        </Link>
      </div>

      {hasPendingRefund && (
        <Card className="border-brand-green/40 bg-brand-green/5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-2">
              <Coins className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
              <div className="text-sm">
                <p className="font-medium text-brand-green">Pending Bond Refund</p>
                <p className="mt-0.5 text-text-muted">
                  <span className="font-mono font-medium text-text-primary">
                    {formatEther(pendingRefund as bigint)} ETC
                  </span>{" "}
                  available to claim from an activated proposal.
                </p>
              </div>
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
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-semantic-info" />
          <div className="text-xs text-text-muted">
            <p>
              Treasury proposals are submitted as <strong>Drafts</strong> to the
              ECFPRegistry. After a{" "}
              <strong>
                {minReview ? `${Number(minReview)}s (${Math.round(Number(minReview) / 60)} min)` : "…"}{" "}
                review period
              </strong>
              , a maintainer activates the draft for a governance vote. You can edit
              or withdraw your own drafts while they remain in Draft status.
            </p>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <p className="text-sm text-text-muted">Loading drafts…</p>
      ) : error ? (
        <Card>
          <p className="text-sm text-semantic-error">
            Failed to load drafts: {error.message}
          </p>
        </Card>
      ) : drafts.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-text-muted">No drafts submitted yet</p>
          <Link href="/proposals/new">
            <Button variant="secondary" size="sm" className="mt-4">
              Submit the first ECFP draft
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {drafts.map((d) => (
            <DraftCard
              key={d.hashId}
              draft={d}
              minReviewPeriod={minReview ? Number(minReview) : 300}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DraftCard({
  draft,
  minReviewPeriod,
}: {
  draft: SubmittedDraft;
  minReviewPeriod: number;
}) {
  const { address } = useAccount();
  const explorerUrl = useExplorerUrl();
  const { symbol } = useChainMeta();
  const { data: rawProposal } = useRegistryProposal(draft.hashId);
  const { data: bond } = useBondOf(draft.hashId);
  const {
    withdrawDraft,
    isPending: isWithdrawPending,
    isConfirming: isWithdrawConfirming,
    isSuccess: isWithdrawSuccess,
  } = useWithdrawDraft();

  // The ABI returns a tuple struct — wagmi types it as readonly array with named fields
  const proposal = rawProposal as
    | { proposer: `0x${string}`; timestamp: bigint; status: number }
    | readonly [
        `0x${string}`, // ecfpId
        `0x${string}`, // recipient
        bigint, // amount
        `0x${string}`, // metadataCID
        `0x${string}`, // proposer
        bigint, // timestamp
        number, // status
      ]
    | undefined;

  const status = proposal
    ? "status" in proposal
      ? Number(proposal.status)
      : Number(proposal[6])
    : undefined;
  const timestamp = proposal
    ? "timestamp" in proposal
      ? Number(proposal.timestamp)
      : Number(proposal[5])
    : 0;
  const proposer = proposal
    ? "proposer" in proposal
      ? proposal.proposer
      : proposal[4]
    : undefined;
  const isOwner = address && proposer && address.toLowerCase() === proposer.toLowerCase();
  const isDraft = status === ECFPStatus.Draft;

  // Review period countdown
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  useEffect(() => {
    const interval = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(interval);
  }, []);

  const reviewEnds = timestamp + minReviewPeriod;
  const reviewRemaining = Math.max(0, reviewEnds - now);
  const reviewReady = isDraft && reviewRemaining === 0;

  return (
    <Card className={isWithdrawSuccess ? "opacity-50" : ""}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {status !== undefined && (
              <span
                className={`inline-flex shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${ECFPStatusColors[status as keyof typeof ECFPStatusColors] ?? "text-text-subtle bg-bg-elevated border-border-default"}`}
              >
                {ECFPStatusLabels[status as keyof typeof ECFPStatusLabels] ?? `Status ${status}`}
              </span>
            )}
            {isDraft && reviewReady && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-green-subtle px-2 py-0.5 text-xs font-medium text-brand-green">
                Ready for activation
              </span>
            )}
            {isDraft && !reviewReady && (
              <span className="inline-flex items-center gap-1 text-xs text-text-subtle">
                <Clock className="h-3 w-3" />
                Review: {formatSeconds(reviewRemaining)} remaining
              </span>
            )}
          </div>

          <div className="mt-2 space-y-1">
            <p className="text-sm">
              <span className="font-medium">{formatEther(draft.amount)} {symbol}</span>
              {" → "}
              <a
                href={explorerUrl("address", draft.recipient)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-brand-green hover:underline"
              >
                {truncateAddress(draft.recipient)}
              </a>
            </p>
            <p className="text-xs text-text-subtle">
              Hash:{" "}
              <span className="font-mono">
                {draft.hashId.slice(0, 10)}…{draft.hashId.slice(-8)}
              </span>
            </p>
            {proposer && (
              <p className="text-xs text-text-subtle">
                Submitted by{" "}
                <span className="font-mono">{truncateAddress(proposer)}</span>
                {" · Block #"}
                {draft.blockNumber.toString()}
              </p>
            )}
            {bond !== undefined && (
              <p className="text-xs">
                {isDraft ? (
                  <span className="text-text-subtle">
                    Bond at stake:{" "}
                    <span className="font-mono font-medium text-text-secondary">
                      {formatEther(bond as bigint)} {symbol}
                    </span>
                  </span>
                ) : (
                  <span className="text-text-subtle italic">Bond returned</span>
                )}
              </p>
            )}
          </div>
        </div>

        {isOwner && isDraft && !isWithdrawSuccess && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => withdrawDraft(draft.hashId)}
            disabled={isWithdrawPending || isWithdrawConfirming}
            className="shrink-0 text-text-muted hover:text-semantic-error"
          >
            <FileX className="h-4 w-4" />
            {isWithdrawPending || isWithdrawConfirming ? "Withdrawing…" : "Withdraw"}
          </Button>
        )}
      </div>
    </Card>
  );
}

function formatSeconds(s: number): string {
  if (s <= 0) return "0s";
  const min = Math.floor(s / 60);
  const sec = s % 60;
  if (min === 0) return `${sec}s`;
  return `${min}m ${sec}s`;
}
