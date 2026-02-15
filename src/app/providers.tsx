"use client";

import { useEffect } from 'react';

import {
  CrossmintProvider,
  CrossmintAuthProvider,
  CrossmintWalletProvider,
} from "@crossmint/client-sdk-react-ui";
import { UserProvider } from "@/contexts/UserContext";
import { TradeHistoryProvider } from "@/contexts/TradeHistoryContext";
import { useStore } from '@/lib/store';

const apiKey = process.env.NEXT_PUBLIC_CROSSMINT_API_KEY!;

function ChainOrdersBootstrap() {
  const refreshOrdersFromChain = useStore((state) => state.refreshOrdersFromChain);

  useEffect(() => {
    void refreshOrdersFromChain();
  }, [refreshOrdersFromChain]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CrossmintProvider apiKey={apiKey}>
      <CrossmintAuthProvider>
        <CrossmintWalletProvider
          createOnLogin={{
            chain: "stellar",
            signer: {
              type: "email",
            },
          }}
        >
          <UserProvider>
            <TradeHistoryProvider>
              <ChainOrdersBootstrap />
              {children}
            </TradeHistoryProvider>
          </UserProvider>
        </CrossmintWalletProvider>
      </CrossmintAuthProvider>
    </CrossmintProvider>
  );
}
