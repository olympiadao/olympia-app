"use client";

import { useState } from "react";
import { isAddress } from "viem";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useMintNFT,
  useAddSanction,
  useRemoveSanction,
  useCheckSanction,
  useAdminRoles,
} from "@/lib/hooks/use-admin";
import { useMemberBalance, useMembers } from "@/lib/hooks/use-member-nft";
import { useExplorerUrl } from "@/lib/hooks/use-chain";
import { truncateAddress } from "@/lib/utils/format";
import { useAccount } from "wagmi";
import {
  Shield,
  UserPlus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Info,
  Users,
} from "lucide-react";

export default function AdminPage() {
  const { address } = useAccount();
  const roles = useAdminRoles();

  if (!address) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <Card className="py-12 text-center">
          <p className="text-text-muted">
            Connect your wallet to access admin functions.
          </p>
        </Card>
      </div>
    );
  }

  if (!roles.hasAnyRole) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <Card className="py-12 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-semantic-warning" />
          <p className="mt-3 text-lg font-semibold text-text-primary">
            Not Authorized
          </p>
          <p className="mt-1 text-sm text-text-muted">
            Only admin wallets can perform these actions. The deployer wallet
            holds DEFAULT_ADMIN_ROLE on all contracts.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader />

      {/* Role Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Your Roles</CardTitle>
        </CardHeader>
        <div className="flex flex-wrap gap-2">
          <RoleBadge label="NFT Admin" active={roles.isNftAdmin} />
          <RoleBadge label="Minter" active={roles.isMinter} />
          <RoleBadge
            label="Sanctions Admin"
            active={roles.isSanctionsAdmin}
          />
          <RoleBadge
            label="Sanctions Manager"
            active={roles.isSanctionsManager}
          />
          <RoleBadge label="Registry Admin" active={roles.isRegistryAdmin} />
          <RoleBadge label="Governor" active={roles.isGovernor} />
        </div>
      </Card>

      {/* Mint NFT */}
      {(roles.isMinter || roles.isNftAdmin) && <MintSection />}

      {/* NFT Burn Limitation Notice */}
      {(roles.isMinter || roles.isNftAdmin) && <BurnLimitationNotice />}

      {/* Member List */}
      {(roles.isMinter || roles.isNftAdmin) && <MemberListSection />}

      {/* Sanctions Management */}
      {(roles.isSanctionsManager || roles.isSanctionsAdmin) && (
        <SanctionsSection />
      )}
    </div>
  );
}

function PageHeader() {
  return (
    <div>
      <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
        <Shield className="h-6 w-6 text-brand-green" />
        DAO Admin
      </h1>
      <p className="mt-1 text-sm text-text-muted">
        Manage membership NFTs, sanctions list, and contract roles
      </p>
    </div>
  );
}

function RoleBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <Badge
      className={
        active
          ? "bg-brand-green-subtle text-brand-green"
          : "bg-bg-elevated text-text-subtle"
      }
    >
      {active ? (
        <CheckCircle className="mr-1 h-3 w-3" />
      ) : (
        <XCircle className="mr-1 h-3 w-3" />
      )}
      {label}
    </Badge>
  );
}

function MintSection() {
  const [mintAddress, setMintAddress] = useState("");
  const { mint, isPending, isConfirming, isSuccess, error } = useMintNFT();

  const validAddress = isAddress(mintAddress) ? (mintAddress as `0x${string}`) : undefined;
  const { data: existingBalance } = useMemberBalance(validAddress);
  const hasExistingNFT = existingBalance !== undefined && (existingBalance as bigint) > 0n;

  function handleMint(e: React.FormEvent) {
    e.preventDefault();
    if (!isAddress(mintAddress)) return;
    mint(mintAddress as `0x${string}`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-brand-green" />
          Mint Member NFT
        </CardTitle>
      </CardHeader>

      <div className="mb-4 rounded-lg border border-border-subtle bg-bg-elevated p-3">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-semantic-info" />
          <p className="text-xs text-text-muted">
            Minting a soulbound NFT grants one governance vote. The NFT
            automatically delegates voting power to the holder — no manual
            delegation needed. NFTs cannot be transferred. One address = one
            NFT = one vote.
          </p>
        </div>
      </div>

      <form onSubmit={handleMint} className="space-y-3">
        <div>
          <label
            htmlFor="mint-address"
            className="mb-1 block text-sm font-medium text-text-secondary"
          >
            Recipient Address
          </label>
          <input
            id="mint-address"
            type="text"
            value={mintAddress}
            onChange={(e) => setMintAddress(e.target.value)}
            placeholder="0x…"
            className={`w-full rounded-lg border bg-bg-elevated px-3 py-2 font-mono text-sm text-text-primary placeholder:text-text-subtle focus:outline-none ${
              hasExistingNFT
                ? "border-semantic-warning focus:border-semantic-warning"
                : "border-border-default focus:border-brand-green"
            }`}
          />
          {hasExistingNFT && (
            <div className="mt-1.5 flex items-start gap-1.5 text-semantic-warning">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <p className="text-xs">
                This address already holds a member NFT (balance:{" "}
                {(existingBalance as bigint).toString()}). Minting a second NFT
                violates the one-address-one-vote principle.
              </p>
            </div>
          )}
        </div>
        <Button
          type="submit"
          size="md"
          disabled={!isAddress(mintAddress) || isPending || isConfirming || hasExistingNFT}
        >
          {isPending || isConfirming ? "Minting…" : "Mint NFT"}
        </Button>
      </form>

      {isSuccess && (
        <p className="mt-3 text-sm text-brand-green">
          NFT minted successfully.
        </p>
      )}
      {error && (
        <p className="mt-3 text-sm text-semantic-error">
          {error.message.slice(0, 200)}
        </p>
      )}
    </Card>
  );
}

function BurnLimitationNotice() {
  return (
    <Card className="border-semantic-warning/30">
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-semantic-warning" />
        <div className="text-xs text-text-muted">
          <p className="font-medium text-text-secondary">
            NFT Burn Not Available (v0.2 Limitation)
          </p>
          <p className="mt-1">
            The OlympiaMemberNFT contract does not expose a public{" "}
            <code className="font-mono text-text-primary">burn()</code>{" "}
            function. If a member&apos;s wallet is compromised, the attacker retains
            voting power indefinitely. This security gap is tracked for v0.3 —
            a <code className="font-mono text-text-primary">burn(uint256 tokenId)</code>{" "}
            function with MINTER_ROLE guard will be added.
          </p>
        </div>
      </div>
    </Card>
  );
}

function MemberListSection() {
  const { members, isLoading } = useMembers();
  const explorerUrl = useExplorerUrl();

  // Count NFTs per address to flag duplicates
  const addressCounts = new Map<string, number>();
  for (const m of members) {
    const key = m.address.toLowerCase();
    addressCounts.set(key, (addressCounts.get(key) ?? 0) + 1);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-4 w-4 text-brand-green" />
          Current Members ({members.length})
        </CardTitle>
      </CardHeader>

      {isLoading ? (
        <p className="text-sm text-text-muted">Loading members…</p>
      ) : members.length === 0 ? (
        <p className="text-sm text-text-muted">No members found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-default text-left text-xs text-text-subtle">
                <th className="pb-2 pr-4">Address</th>
                <th className="pb-2 pr-4">Token ID</th>
                <th className="pb-2">Minted Block</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {members.map((m) => {
                const isDuplicate =
                  (addressCounts.get(m.address.toLowerCase()) ?? 0) > 1;
                return (
                  <tr
                    key={m.tokenId.toString()}
                    className={isDuplicate ? "bg-semantic-warning/5" : ""}
                  >
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        <a
                          href={explorerUrl("address", m.address)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-brand-green hover:underline"
                        >
                          {truncateAddress(m.address)}
                        </a>
                        {isDuplicate && (
                          <span className="rounded bg-semantic-warning/10 px-1.5 py-0.5 text-[10px] font-medium text-semantic-warning">
                            DUPLICATE
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 pr-4 font-mono text-xs text-text-muted">
                      #{m.tokenId.toString()}
                    </td>
                    <td className="py-2 font-mono text-xs text-text-subtle">
                      {m.blockNumber.toString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function SanctionsSection() {
  const [checkAddress, setCheckAddress] = useState("");
  const [addAddress, setAddAddress] = useState("");
  const [removeAddress, setRemoveAddress] = useState("");

  const { data: isSanctioned } = useCheckSanction(
    isAddress(checkAddress) ? (checkAddress as `0x${string}`) : undefined
  );
  const {
    addSanction,
    isPending: addPending,
    isConfirming: addConfirming,
    isSuccess: addSuccess,
    error: addError,
  } = useAddSanction();
  const {
    removeSanction,
    isPending: removePending,
    isConfirming: removeConfirming,
    isSuccess: removeSuccess,
    error: removeError,
  } = useRemoveSanction();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-semantic-warning" />
          Sanctions Management
        </CardTitle>
      </CardHeader>

      <div className="mb-4 rounded-lg border border-border-subtle bg-bg-elevated p-3">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-semantic-info" />
          <div className="text-xs text-text-muted">
            <p>
              The SanctionsOracle enforces a 3-layer defense against sanctioned
              addresses:
            </p>
            <ul className="mt-1 list-inside list-disc space-y-0.5">
              <li>
                <strong>Layer 1:</strong> Proposal blocked if recipient is
                sanctioned
              </li>
              <li>
                <strong>Layer 2:</strong> Anyone can cancel a proposal if
                recipient becomes sanctioned mid-vote
              </li>
              <li>
                <strong>Layer 3:</strong> Executor checks sanctions before
                releasing treasury funds
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Check */}
        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">
            Check Address
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={checkAddress}
              onChange={(e) => setCheckAddress(e.target.value)}
              placeholder="0x…"
              className="flex-1 rounded-lg border border-border-default bg-bg-elevated px-3 py-2 font-mono text-sm text-text-primary placeholder:text-text-subtle focus:border-brand-green focus:outline-none"
            />
            <div className="flex items-center">
              {isAddress(checkAddress) && isSanctioned !== undefined && (
                <Badge
                  className={
                    isSanctioned
                      ? "bg-semantic-error/10 text-semantic-error"
                      : "bg-brand-green-subtle text-brand-green"
                  }
                >
                  {isSanctioned ? (
                    <>
                      <XCircle className="mr-1 h-3 w-3" /> Sanctioned
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-1 h-3 w-3" /> Clean
                    </>
                  )}
                </Badge>
              )}
              {!isAddress(checkAddress) && checkAddress.length > 0 && (
                <Search className="h-4 w-4 text-text-subtle" />
              )}
            </div>
          </div>
        </div>

        {/* Add */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (isAddress(addAddress))
              addSanction(addAddress as `0x${string}`);
          }}
        >
          <label className="mb-1 block text-sm font-medium text-text-secondary">
            Add to Sanctions List
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={addAddress}
              onChange={(e) => setAddAddress(e.target.value)}
              placeholder="0x…"
              className="flex-1 rounded-lg border border-border-default bg-bg-elevated px-3 py-2 font-mono text-sm text-text-primary placeholder:text-text-subtle focus:border-brand-green focus:outline-none"
            />
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              disabled={!isAddress(addAddress) || addPending || addConfirming}
            >
              {addPending || addConfirming ? "Adding…" : "Add"}
            </Button>
          </div>
          {addSuccess && (
            <p className="mt-1 text-xs text-brand-green">
              Address added to sanctions list.
            </p>
          )}
          {addError && (
            <p className="mt-1 text-xs text-semantic-error">
              {addError.message.slice(0, 200)}
            </p>
          )}
        </form>

        {/* Remove */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (isAddress(removeAddress))
              removeSanction(removeAddress as `0x${string}`);
          }}
        >
          <label className="mb-1 block text-sm font-medium text-text-secondary">
            Remove from Sanctions List
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={removeAddress}
              onChange={(e) => setRemoveAddress(e.target.value)}
              placeholder="0x…"
              className="flex-1 rounded-lg border border-border-default bg-bg-elevated px-3 py-2 font-mono text-sm text-text-primary placeholder:text-text-subtle focus:border-brand-green focus:outline-none"
            />
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              disabled={
                !isAddress(removeAddress) || removePending || removeConfirming
              }
            >
              {removePending || removeConfirming ? "Removing…" : "Remove"}
            </Button>
          </div>
          {removeSuccess && (
            <p className="mt-1 text-xs text-brand-green">
              Address removed from sanctions list.
            </p>
          )}
          {removeError && (
            <p className="mt-1 text-xs text-semantic-error">
              {removeError.message.slice(0, 200)}
            </p>
          )}
        </form>
      </div>
    </Card>
  );
}
