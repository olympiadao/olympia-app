"use client";

import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
  useAccount,
} from "wagmi";
import { abis } from "@/lib/contracts/config";
import { getContracts } from "@/lib/contracts/addresses";
import { useActiveChainId } from "./use-chain";

// Role constants (keccak256 hashes)
export const ROLES = {
  DEFAULT_ADMIN_ROLE:
    "0x0000000000000000000000000000000000000000000000000000000000000000" as const,
  MINTER_ROLE:
    "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6" as const,
  MANAGER_ROLE:
    "0x241ecf16d79d0f8dbfb92cbc07fe17840425976cf0667f022fe9877caa831b08" as const,
  GOVERNOR_ROLE:
    "0x7935bd0ae54bc31f548c14dba4d37c5c64b3f8ca900cb468fb8abd54d5894f55" as const,
} as const;

// --- Mint NFT ---

export function useMintNFT() {
  const chainId = useActiveChainId();
  const c = getContracts(chainId);
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash });

  function mint(to: `0x${string}`) {
    writeContract({
      address: c.memberNFT,
      abi: abis.memberNFT,
      functionName: "safeMint",
      args: [to],
    });
  }

  return { mint, hash, isPending, isConfirming, isSuccess, error };
}

// --- Sanctions ---

export function useAddSanction() {
  const chainId = useActiveChainId();
  const c = getContracts(chainId);
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash });

  function addSanction(address: `0x${string}`) {
    writeContract({
      address: c.sanctionsOracle,
      abi: abis.sanctionsOracle,
      functionName: "addAddress",
      args: [address],
    });
  }

  return { addSanction, hash, isPending, isConfirming, isSuccess, error };
}

export function useRemoveSanction() {
  const chainId = useActiveChainId();
  const c = getContracts(chainId);
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash });

  function removeSanction(address: `0x${string}`) {
    writeContract({
      address: c.sanctionsOracle,
      abi: abis.sanctionsOracle,
      functionName: "removeAddress",
      args: [address],
    });
  }

  return { removeSanction, hash, isPending, isConfirming, isSuccess, error };
}

export function useCheckSanction(address?: `0x${string}`) {
  const chainId = useActiveChainId();
  const c = getContracts(chainId);
  return useReadContract({
    address: c.sanctionsOracle,
    abi: abis.sanctionsOracle,
    functionName: "isSanctioned",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

// --- Role Checks ---

export function useHasRole(
  contract: "memberNFT" | "sanctionsOracle" | "ecfpRegistry",
  role: `0x${string}`,
  account?: `0x${string}`
) {
  const chainId = useActiveChainId();
  const c = getContracts(chainId);
  const abiMap = {
    memberNFT: abis.memberNFT,
    sanctionsOracle: abis.sanctionsOracle,
    ecfpRegistry: abis.ecfpRegistry,
  };

  return useReadContract({
    address: c[contract],
    abi: abiMap[contract],
    functionName: "hasRole",
    args: account ? [role, account] : undefined,
    query: { enabled: !!account },
  });
}

export function useAdminRoles() {
  const { address } = useAccount();

  const { data: isNftAdmin } = useHasRole(
    "memberNFT",
    ROLES.DEFAULT_ADMIN_ROLE,
    address
  );
  const { data: isMinter } = useHasRole(
    "memberNFT",
    ROLES.MINTER_ROLE,
    address
  );
  const { data: isSanctionsAdmin } = useHasRole(
    "sanctionsOracle",
    ROLES.DEFAULT_ADMIN_ROLE,
    address
  );
  const { data: isSanctionsManager } = useHasRole(
    "sanctionsOracle",
    ROLES.MANAGER_ROLE,
    address
  );
  const { data: isRegistryAdmin } = useHasRole(
    "ecfpRegistry",
    ROLES.DEFAULT_ADMIN_ROLE,
    address
  );
  const { data: isGovernor } = useHasRole(
    "ecfpRegistry",
    ROLES.GOVERNOR_ROLE,
    address
  );

  const hasAnyRole =
    isNftAdmin ||
    isMinter ||
    isSanctionsAdmin ||
    isSanctionsManager ||
    isRegistryAdmin ||
    isGovernor;

  return {
    isNftAdmin: !!isNftAdmin,
    isMinter: !!isMinter,
    isSanctionsAdmin: !!isSanctionsAdmin,
    isSanctionsManager: !!isSanctionsManager,
    isRegistryAdmin: !!isRegistryAdmin,
    isGovernor: !!isGovernor,
    hasAnyRole: !!hasAnyRole,
  };
}
