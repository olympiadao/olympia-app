"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useTotalMembers,
  useIsMember,
  useMembers,
} from "@/lib/hooks/use-member-nft";
import { useAccount } from "wagmi";
import { contracts } from "@/lib/contracts/addresses";
import { explorerUrl, truncateAddress } from "@/lib/utils/format";
import { Users, Shield, ExternalLink, Info } from "lucide-react";

export default function MembersPage() {
  const { data: totalMembers } = useTotalMembers();
  const { address } = useAccount();
  const { isMember, isLoading } = useIsMember();
  const { members, isLoading: membersLoading } = useMembers();

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

      {/* Member List */}
      <Card>
        <CardHeader>
          <CardTitle>Member Registry</CardTitle>
        </CardHeader>
        {membersLoading ? (
          <p className="text-sm text-text-muted">Loading members…</p>
        ) : members.length === 0 ? (
          <p className="text-sm text-text-muted">No members found</p>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_80px_100px] gap-2 border-b border-border-subtle pb-2 text-xs font-medium text-text-muted">
              <span>Address</span>
              <span>Token ID</span>
              <span>Mint Block</span>
            </div>
            {members.map((member) => {
              const isYou =
                address?.toLowerCase() === member.address.toLowerCase();
              return (
                <div
                  key={member.tokenId.toString()}
                  className={`grid grid-cols-[1fr_80px_100px] items-center gap-2 rounded-lg px-2 py-1.5 ${
                    isYou
                      ? "border border-brand-green/20 bg-brand-green/5"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <a
                      href={explorerUrl("address", member.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 font-mono text-sm text-brand-green hover:underline"
                    >
                      {truncateAddress(member.address, 6)}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    {isYou && (
                      <Badge className="bg-brand-green-subtle text-brand-green text-xs">
                        You
                      </Badge>
                    )}
                  </div>
                  <span className="font-mono text-sm text-text-secondary">
                    #{member.tokenId.toString()}
                  </span>
                  <span className="font-mono text-sm text-text-subtle">
                    {member.blockNumber.toString()}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Voting Power Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-4 w-4 text-semantic-info" />
            Voting Power
          </CardTitle>
        </CardHeader>
        <div className="space-y-3 text-sm text-text-secondary">
          <p>
            Voting power is{" "}
            <strong className="text-text-primary">
              locked at proposal creation time
            </strong>
            . New members minted after a proposal is created cannot vote on that
            proposal.
          </p>
          <p>
            This snapshot mechanism prevents flash-minting attacks — an
            adversary cannot mint NFTs right before a vote to swing the outcome.
          </p>
        </div>
      </Card>

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
            NFTs are minted by the DAO admin and automatically delegate voting
            power to the holder. No manual delegation is needed.
          </p>
          <p>
            Identity verification happens at the application layer (e.g.,
            BrightID, Gitcoin Passport). The MINTER_ROLE holder is responsible
            for KYC before minting.
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
