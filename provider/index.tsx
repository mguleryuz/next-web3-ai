"use client";

import { getCsrfToken, getSession } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, WagmiProvider } from "wagmi";
import { http } from "viem";
import { mainnet, sepolia, optimism, arbitrum, base, polygon } from "viem/chains";

import {
  DynamicContextProvider,
  getAuthToken,
  DynamicUserProfile
} from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";

// Configure wagmi with supported chains
const wagmiConfig = createConfig({
  chains: [mainnet, sepolia, optimism, arbitrum, base, polygon],
  multiInjectedProviderDiscovery: false,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
    [polygon.id]: http(),
  },
});

const queryClient = new QueryClient();

export default function Provider({ children }: React.PropsWithChildren) {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID || "",
        walletConnectors: [EthereumWalletConnectors],
        events: {
          onAuthSuccess: async () => {
            const authToken = getAuthToken();

            if (!authToken) {
              console.error("No auth token found");
              return;
            }

            const csrfToken = await getCsrfToken();

            if (!csrfToken) {
              console.error("No CSRF token found");
              return;
            }

            fetch("/api/auth/callback/credentials", {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: `csrfToken=${encodeURIComponent(
                csrfToken
              )}&token=${encodeURIComponent(authToken)}`,
            })
              .then((res) => {
                if (res.ok) {
                  getSession();
                } else {
                  console.error("Failed to log in");
                }
              })
              .catch((error) => {
                console.error("Error logging in", error);
              });
          },
        },
      }}
    >
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <DynamicWagmiConnector>{children}
          <DynamicUserProfile />
          </DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  );
}
