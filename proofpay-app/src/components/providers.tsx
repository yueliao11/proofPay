"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  SuiClientProvider,
  WalletProvider,
  createNetworkConfig,
} from "@mysten/dapp-kit";
import { useState } from "react";

const RPC_URLS: Record<string, string> = {
  testnet: "https://fullnode.testnet.sui.io:443",
  mainnet: "https://fullnode.mainnet.sui.io:443",
  devnet: "https://fullnode.devnet.sui.io:443",
  localnet: "http://127.0.0.1:9000",
};

const { networkConfig } = createNetworkConfig({
  testnet: { url: RPC_URLS.testnet, network: "testnet" },
  mainnet: { url: RPC_URLS.mainnet, network: "mainnet" },
  devnet: { url: RPC_URLS.devnet, network: "devnet" },
  localnet: { url: RPC_URLS.localnet, network: "localnet" },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect>{children}</WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
