"use client";

import { ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { wagmiConfig } from "@/lib/contracts/config";

import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

const olympiaTheme = darkTheme({
  accentColor: "#00ffae",
  accentColorForeground: "#0a0f10",
  borderRadius: "medium",
  fontStack: "system",
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={olympiaTheme}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
