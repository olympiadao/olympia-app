"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTotalMembers, useIsMember } from "@/lib/hooks/use-member-nft";
import { useAccount } from "wagmi";
import { contracts } from "@/lib/contracts/addresses";
import { explorerUrl, truncateAddress } from "@/lib/utils/format";
import { Users, Shield, ExternalLink } from "lucide-react";

export default function MembersPage() {
  const { data: totalMembers } = useTotalMembers();
  const { address } = useAccount();
  const { isMember, isLoading } = useIsMember();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Members</h1>
        <p className="mt-1 text-sm text-text-muted">
          OlympiaMemberNFT holders — one soulbound NFT, one vote
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-semantic-info/10">
              <Users className="h-6 w-6 text-semantic-info" />
            </div>
            <div>
              <p className="text-sm text-text-muted">Total Members</p>
              <p className="text-3xl font-bold tracking-tight">
                {totalMembers !== undefined
                  ? (totalMembers as bigint).toString()
                  : "…"}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-green-subtle">
              <Shield className="h-6 w-6 text-brand-green" />
            </div>
            <div>
              <p className="text-sm text-text-muted">Your Status</p>
              {!address ? (
                <p className="text-lg font-semibold text-text-subtle">
                  Not connected
                </p>
              ) : isLoading ? (
                <p className="text-lg font-semibold text-text-muted">…</p>
              ) : isMember ? (
                <Badge className="bg-brand-green-subtle text-brand-green">
                  Member
                </Badge>
              ) : (
                <Badge className="bg-bg-elevated text-text-muted">
                  Not a member
                </Badge>
              )}
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About Membership</CardTitle>
        </CardHeader>
        <div className="space-y-3 text-sm text-text-secondary">
          <p>
            Olympia uses soulbound (non-transferable) ERC-721 NFTs for
            governance voting. Each NFT represents exactly one vote.
          </p>
          <p>
            NFTs are minted by the DAO admin and automatically delegate
            voting power to the holder. No manual delegation is needed.
          </p>
          <p>
            Voting power snapshots are taken at proposal creation time,
            preventing flash-loan or last-minute transfers from affecting
            votes.
          </p>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>NFT Contract</CardTitle>
        </CardHeader>
        <a
          href={explorerUrl("address", contracts[63].memberNFT)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 font-mono text-sm text-brand-green hover:underline"
        >
          {truncateAddress(contracts[63].memberNFT, 8)}
          <ExternalLink className="h-3 w-3" />
        </a>
      </Card>
    </div>
  );
}
