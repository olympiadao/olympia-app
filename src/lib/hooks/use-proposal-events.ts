"use client";

import { usePublicClient } from "wagmi";
import { useEffect, useState } from "react";
import { parseAbiItem } from "viem";
import { contracts } from "@/lib/contracts/addresses";

const proposalCreatedEvent = parseAbiItem(
  "event ProposalCreated(uint256 proposalId, address proposer, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, uint256 voteStart, uint256 voteEnd, string description)"
);

const proposalQueuedEvent = parseAbiItem(
  "event ProposalQueued(uint256 proposalId, uint256 etaSeconds)"
);

const proposalExecutedEvent = parseAbiItem(
  "event ProposalExecuted(uint256 proposalId)"
);

export interface ProposalTxHashes {
  createTxHash?: `0x${string}`;
  queueTxHash?: `0x${string}`;
  executeTxHash?: `0x${string}`;
}

export function useProposalTxHashes(proposalId: bigint) {
  const client = usePublicClient();
  const [hashes, setHashes] = useState<ProposalTxHashes>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!client) return;

    async function fetchHashes() {
      try {
        const [createLogs, queueLogs, executeLogs] = await Promise.all([
          client!.getLogs({
            address: contracts[63].governor,
            event: proposalCreatedEvent,
            fromBlock: 15_700_000n,
            toBlock: "latest",
          }),
          client!.getLogs({
            address: contracts[63].governor,
            event: proposalQueuedEvent,
            fromBlock: 15_700_000n,
            toBlock: "latest",
          }),
          client!.getLogs({
            address: contracts[63].governor,
            event: proposalExecutedEvent,
            fromBlock: 15_700_000n,
            toBlock: "latest",
          }),
        ]);

        const createLog = createLogs.find(
          (l) => l.args.proposalId === proposalId
        );
        const queueLog = queueLogs.find(
          (l) => l.args.proposalId === proposalId
        );
        const executeLog = executeLogs.find(
          (l) => l.args.proposalId === proposalId
        );

        setHashes({
          createTxHash: createLog?.transactionHash,
          queueTxHash: queueLog?.transactionHash,
          executeTxHash: executeLog?.transactionHash,
        });
      } catch {
        // Non-critical — tx links are supplementary
      } finally {
        setIsLoading(false);
      }
    }

    fetchHashes();
    const interval = setInterval(fetchHashes, 60_000);
    return () => clearInterval(interval);
  }, [client, proposalId]);

  return { ...hashes, isLoading };
}
