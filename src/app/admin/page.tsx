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
import { useAccount } from "wagmi";
import {
  Shield,
  UserPlus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Info,
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
          <AlertTriangle className="mx-auto h-8 w-8 text-brand-amber" />
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
            delegation needed. NFTs cannot be transferred.
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
            className="w-full rounded-lg border border-border-default bg-bg-elevated px-3 py-2 font-mono text-sm text-text-primary placeholder:text-text-subtle focus:border-brand-green focus:outline-none"
          />
        </div>
        <Button
          type="submit"
          size="md"
          disabled={!isAddress(mintAddress) || isPending || isConfirming}
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
          <AlertTriangle className="h-4 w-4 text-brand-amber" />
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
