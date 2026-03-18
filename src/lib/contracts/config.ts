import { http, createConfig } from "wagmi";
import { mordor, classic } from "@/lib/utils/chains";

import GovernorABI from "./abis/OlympiaGovernor.json";
import ExecutorABI from "./abis/OlympiaExecutor.json";
import ECFPRegistryABI from "./abis/ECFPRegistry.json";
import SanctionsOracleABI from "./abis/SanctionsOracle.json";
import MemberNFTABI from "./abis/OlympiaMemberNFT.json";
import TimelockABI from "./abis/TimelockController.json";

export const wagmiConfig = createConfig({
  chains: [mordor, classic],
  transports: {
    [mordor.id]: http("https://rpc.mordor.etccooperative.org"),
    [classic.id]: http("https://etc.rivet.link"),
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
