"use client";

import { ReactNode, useSyncExternalStore } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { useTheme } from "next-themes";
import { wagmiConfig } from "@/lib/contracts/config";

import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

const olympiaDark = darkTheme({
  accentColor: "#00ffae",
  accentColorForeground: "#0a0f10",
  borderRadius: "medium",
  fontStack: "system",
});

const olympiaLight = lightTheme({
  accentColor: "#00a872",
  accentColorForeground: "#ffffff",
  borderRadius: "medium",
  fontStack: "system",
});

const subscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

function RainbowKitWrapper({ children }: { children: ReactNode }) {
  const mounted = useMounted();
  const { resolvedTheme } = useTheme();

  // Default to dark during SSR to avoid hydration mismatch
  const rkTheme = mounted && resolvedTheme === "light" ? olympiaLight : olympiaDark;

  return (
    <RainbowKitProvider theme={rkTheme}>
      {children}
    </RainbowKitProvider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitWrapper>
          {children}
        </RainbowKitWrapper>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
