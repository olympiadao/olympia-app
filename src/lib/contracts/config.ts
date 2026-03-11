import { http, createConfig } from "wagmi";
import { mordor } from "@/lib/utils/mordor";

import GovernorABI from "./abis/OlympiaGovernor.json";
import ExecutorABI from "./abis/OlympiaExecutor.json";
import ECFPRegistryABI from "./abis/ECFPRegistry.json";
import SanctionsOracleABI from "./abis/SanctionsOracle.json";
import MemberNFTABI from "./abis/OlympiaMemberNFT.json";
import TimelockABI from "./abis/TimelockController.json";

export const wagmiConfig = createConfig({
  chains: [mordor],
  transports: {
    [mordor.id]: http(),
  },
  ssr: true,
});

export const abis = {
  governor: GovernorABI,
  executor: ExecutorABI,
  ecfpRegistry: ECFPRegistryABI,
  sanctionsOracle: SanctionsOracleABI,
  memberNFT: MemberNFTABI,
  timelock: TimelockABI,
} as const;
