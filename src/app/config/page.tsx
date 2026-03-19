"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useChainContracts, useExplorerUrl, useChainMeta } from "@/lib/hooks/use-chain";
import { truncateAddress } from "@/lib/utils/format";
import { useBlockStats } from "@/lib/hooks/use-block-stats";
import {
  Settings2,
  ExternalLink,
  Copy,
  Check,
  Vote,
  Shield,
  Timer,
  Link as LinkIcon,
  CheckSquare,
} from "lucide-react";

function getVotingParams(avgBlockTimeMs?: number) {
  const bt = avgBlockTimeMs ?? 13000;
  const fmt = (blocks: number) => {
    const ms = blocks * bt;
    const sec = Math.round(ms / 1000);
    if (sec < 120) return `~${sec}s`;
    return `~${Math.round(sec / 60)} min`;
  };

  return [
    {
      label: "Voting Delay",
      value: `1 block (${fmt(1)})`,
      description: "Time between proposal creation and voting start",
    },
    {
      label: "Voting Period",
      value: `100 blocks (${fmt(100)})`,
      description: "Duration of the voting window",
    },
    {
      label: "Quorum",
      value: "10% of NFT supply",
      description: "Minimum 'For' votes needed for proposal to pass",
    },
    {
      label: "Late Quorum Extension",
      value: `50 blocks (${fmt(50)})`,
      description: "If quorum reached late, voting extends by this amount",
    },
    {
      label: "Timelock Delay",
      value: "3600s (1 hour)",
      description: "Mandatory waiting period before execution",
    },
    {
      label: "Proposal Threshold",
      value: "0",
      description: "Any NFT holder can create a proposal",
    },
    {
      label: "Min Review Period",
      value: "300s (5 min)",
      description: "Minimum wait before ECFPRegistry draft activation",
    },
  ];
}

const contractGroups = [
  {
    title: "Governance",
    items: [
      { label: "OlympiaGovernor", key: "governor" as const },
      { label: "TimelockController", key: "timelock" as const },
    ],
  },
  {
    title: "Execution",
    items: [
      { label: "OlympiaExecutor", key: "executor" as const },
      { label: "OlympiaTreasury", key: "treasury" as const },
    ],
  },
  {
    title: "Identity",
    items: [
      { label: "OlympiaMemberNFT", key: "memberNFT" as const },
      { label: "SanctionsOracle", key: "sanctionsOracle" as const },
    ],
  },
  {
    title: "Proposals",
    items: [{ label: "ECFPRegistry", key: "ecfpRegistry" as const }],
  },
];

interface ChecklistItem {
  id: string;
  label: string;
}

interface ChecklistSection {
  title: string;
  items: ChecklistItem[];
}

const checklistSections: ChecklistSection[] = [
  {
    title: "Pre-Test Setup",
    items: [
      {
        id: "node",
        label: "Core-geth Mordor node running with mining to treasury",
      },
      {
        id: "wallet",
        label: "Deployer wallet connected (has maintainer roles + NFT)",
      },
      { id: "balance", label: "Treasury has balance from mining" },
      {
        id: "rpc",
        label: "App RPC configured (Mordor: etccooperative, ETC: rivet.link)",
      },
    ],
  },
  {
    title: "Member Management",
    items: [
      {
        id: "verify-nft",
        label: "Verify deployer has NFT (Members page shows 'Member' badge)",
      },
      {
        id: "mint-2nd",
        label: "Mint second NFT via Maintainer page to 0x66a3…0645",
      },
      { id: "total-2", label: "Verify total members = 2" },
    ],
  },
  {
    title: "Proposal Creation",
    items: [
      {
        id: "create-prop",
        label: "Create a treasury proposal (0.1 METC to second member)",
      },
      {
        id: "prop-pending",
        label: "Verify proposal appears in list with 'Pending' status",
      },
      {
        id: "prop-active",
        label: "Wait 1 block — status transitions to 'Active'",
      },
    ],
  },
  {
    title: "Voting",
    items: [
      { id: "vote-for", label: "Cast 'For' vote from deployer wallet" },
      {
        id: "vote-count",
        label: "Verify vote count updates in proposal detail",
      },
      {
        id: "vote-end",
        label: "Wait 100 blocks (~22 min) — status transitions to 'Succeeded'",
      },
    ],
  },
  {
    title: "Queue & Execute",
    items: [
      {
        id: "queue",
        label: "Queue the proposal — status transitions to 'Queued'",
      },
      { id: "timelock", label: "Wait for timelock (1 hour)" },
      {
        id: "execute",
        label: "Execute the proposal — status transitions to 'Executed'",
      },
    ],
  },
  {
    title: "Verification",
    items: [
      {
        id: "treasury-dec",
        label: "Treasury balance decreased by 0.1 METC",
      },
      { id: "recipient", label: "Second member received 0.1 METC" },
      {
        id: "dashboard",
        label: "Dashboard stats updated (proposal count, treasury balance)",
      },
    ],
  },
  {
    title: "Sanctions Test (optional)",
    items: [
      {
        id: "sanction-add",
        label: "Add an address to sanctions list via Maintainer page",
      },
      {
        id: "sanction-l1",
        label:
          "Attempt to create proposal to sanctioned address — should fail (Layer 1)",
      },
      {
        id: "sanction-l2",
        label:
          "Create clean proposal, sanction recipient mid-vote, use cancelIfSanctioned (Layer 2)",
      },
    ],
  },
];

function getTimingSteps(avgBlockTimeMs?: number) {
  const bt = avgBlockTimeMs ?? 13000;
  const delayMin = Math.round((1 * bt) / 1000 / 60 * 10) / 10;
  const voteMin = Math.round((100 * bt) / 1000 / 60);
  const totalMin = voteMin + 60;

  return [
    { step: "Propose → Active", wait: `~${Math.round(bt / 1000)}s (1 block)`, cumulative: "0 min" },
    { step: "Vote", wait: "immediate", cumulative: `${delayMin < 1 ? "< 1" : Math.round(delayMin)} min` },
    { step: "Active → Succeeded", wait: `~${voteMin} min (100 blocks)`, cumulative: `${voteMin} min` },
    { step: "Queue", wait: "immediate", cumulative: `${voteMin} min` },
    { step: "Queued → Executable", wait: "60 min (timelock)", cumulative: `${totalMin} min` },
    { step: "Execute", wait: "immediate", cumulative: `${totalMin} min` },
  ];
}

export default function ConfigPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const { data: blockStats } = useBlockStats();
  const contracts = useChainContracts();
  const explorerUrl = useExplorerUrl();
  const { chainId, isTestnet, symbol } = useChainMeta();

  function copyAddress(address: string) {
    navigator.clipboard.writeText(address);
    setCopied(address);
    setTimeout(() => setCopied(null), 2000);
  }

  function toggleCheck(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const totalChecks = checklistSections.reduce(
    (acc, s) => acc + s.items.length,
    0
  );
  const completedChecks = checked.size;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Settings2 className="h-6 w-6 text-text-muted" />
          Demo Configuration
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Governance parameters, contract addresses, and E2E testing checklist
          for the Olympia Demo v0.2 on {isTestnet ? "Mordor testnet" : "ETC mainnet"}.
        </p>
      </div>

      {/* Governance Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Vote className="h-4 w-4 text-brand-green" />
            Governance Parameters
          </CardTitle>
        </CardHeader>
        <div className="space-y-3">
          {getVotingParams(blockStats?.avgBlockTimeMs).map((param) => (
            <div
              key={param.label}
              className="flex items-start justify-between gap-4 rounded-lg border border-border-subtle bg-bg-elevated px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {param.label}
                </p>
                <p className="mt-0.5 text-xs text-text-subtle">
                  {param.description}
                </p>
              </div>
              <span className="shrink-0 font-mono text-sm text-brand-green">
                {param.value}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Contract Addresses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4 text-brand-green" />
            Contract Addresses
          </CardTitle>
        </CardHeader>
        <div className="space-y-4">
          {contractGroups.map((group) => (
            <div key={group.title}>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-text-subtle">
                {group.title}
              </p>
              <div className="space-y-2">
                {group.items.map((item) => {
                  const addr = contracts[item.key];
                  return (
                    <div
                      key={item.key}
                      className="flex items-center justify-between gap-2 rounded-lg border border-border-subtle bg-bg-elevated px-3 py-2"
                    >
                      <span className="text-sm text-text-muted">
                        {item.label}
                      </span>
                      <div className="flex items-center gap-2">
                        <a
                          href={explorerUrl("address", addr)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 font-mono text-xs text-brand-green hover:underline"
                        >
                          {truncateAddress(addr, 6)}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                        <button
                          onClick={() => copyAddress(addr)}
                          className="rounded p-1 text-text-subtle hover:text-text-muted"
                          title="Copy address"
                        >
                          {copied === addr ? (
                            <Check className="h-3 w-3 text-brand-green" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Chain Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-brand-green" />
            Chain Info
          </CardTitle>
        </CardHeader>
        <div className="space-y-2">
          <InfoRow label="Chain ID" value={`${chainId} (${isTestnet ? "Mordor Testnet" : "ETC Mainnet"})`} />
          <InfoRow label="Native Currency" value={symbol} />
          <InfoRow
            label="Block Explorer"
            value={isTestnet ? "etc-mordor.blockscout.com" : "etc.blockscout.com"}
            href={isTestnet ? "https://etc-mordor.blockscout.com" : "https://etc.blockscout.com"}
          />
          <InfoRow
            label="Public RPC"
            value={isTestnet ? "rpc.mordor.etccooperative.org" : "etc.rivet.link"}
            mono
          />
          <InfoRow
            label="Block Time"
            value={
              blockStats
                ? `~${(blockStats.avgBlockTimeMs / 1000).toFixed(1)}s (live)`
                : "~13 seconds"
            }
          />
          {blockStats && (
            <InfoRow
              label="Current Block"
              value={`#${blockStats.currentBlock.toLocaleString()}`}
              mono
            />
          )}
        </div>
      </Card>

      {/* E2E Testing Checklist */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-brand-green" />
              E2E Testing Checklist
            </CardTitle>
            <Badge className="bg-bg-elevated text-text-muted">
              {completedChecks}/{totalChecks}
            </Badge>
          </div>
        </CardHeader>
        <div className="space-y-5">
          {checklistSections.map((section) => (
            <div key={section.title}>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-text-subtle">
                {section.title}
              </p>
              <div className="space-y-1.5">
                {section.items.map((item) => {
                  const isChecked = checked.has(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleCheck(item.id)}
                      className={`flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        isChecked
                          ? "bg-brand-green/5 text-text-muted line-through"
                          : "text-text-secondary hover:bg-bg-elevated"
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                          isChecked
                            ? "border-brand-green bg-brand-green"
                            : "border-border-default"
                        }`}
                      >
                        {isChecked && (
                          <Check className="h-3 w-3 text-background" />
                        )}
                      </div>
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Timing Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-brand-green" />
            Timing Reference
          </CardTitle>
        </CardHeader>
        <div className="space-y-1">
          <div className="grid grid-cols-3 gap-2 border-b border-border-subtle pb-2 text-xs font-medium text-text-muted">
            <span>Step</span>
            <span>Wait</span>
            <span>Cumulative</span>
          </div>
          {getTimingSteps(blockStats?.avgBlockTimeMs).map((row) => (
            <div
              key={row.step}
              className="grid grid-cols-3 gap-2 py-1.5 text-sm"
            >
              <span className="text-text-secondary">{row.step}</span>
              <span className="font-mono text-text-muted">{row.wait}</span>
              <span className="font-mono text-brand-green">
                {row.cumulative}
              </span>
            </div>
          ))}
          <p className="mt-3 text-xs text-text-subtle">
            Total: ~{Math.round((100 * (blockStats?.avgBlockTimeMs ?? 13000)) / 1000 / 60) + 60} minutes from proposal creation to execution.
          </p>
        </div>
      </Card>

      {/* 3-Layer Sanctions Defense */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-semantic-error" />
            3-Layer Sanctions Defense
          </CardTitle>
        </CardHeader>
        <div className="space-y-3 text-sm text-text-secondary">
          <div className="rounded-lg border border-border-subtle bg-bg-elevated p-3">
            <p className="font-medium text-text-primary">
              Layer 1 — Propose Gate
            </p>
            <p className="mt-1 text-xs">
              Governor scans calldata during propose(). If the recipient is
              sanctioned, the proposal reverts immediately.
            </p>
          </div>
          <div className="rounded-lg border border-border-subtle bg-bg-elevated p-3">
            <p className="font-medium text-text-primary">
              Layer 2 — Mid-Vote Cancel
            </p>
            <p className="mt-1 text-xs">
              Anyone can call cancelIfSanctioned(proposalId) at any time. If
              the oracle is updated to sanction a recipient mid-vote, the
              proposal is canceled.
            </p>
          </div>
          <div className="rounded-lg border border-border-subtle bg-bg-elevated p-3">
            <p className="font-medium text-text-primary">
              Layer 3 — Executor Gate
            </p>
            <p className="mt-1 text-xs">
              OlympiaExecutor checks isSanctioned(recipient) as the final step
              before calling Treasury.withdraw(). Even if Layers 1 and 2 are
              bypassed, funds cannot reach a sanctioned address.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function InfoRow({
  label,
  value,
  href,
  mono,
}: {
  label: string;
  value: string;
  href?: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-elevated px-3 py-2">
      <span className="text-sm text-text-muted">{label}</span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm text-brand-green hover:underline"
        >
          {value}
          <ExternalLink className="h-3 w-3" />
        </a>
      ) : (
        <span
          className={`text-sm text-text-secondary ${mono ? "font-mono" : ""}`}
        >
          {value}
        </span>
      )}
    </div>
  );
}
