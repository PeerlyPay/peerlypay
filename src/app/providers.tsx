"use client";

import {
  CrossmintProvider,
  CrossmintAuthProvider,
  CrossmintWalletProvider,
} from "@crossmint/client-sdk-react-ui";
import { UserProvider } from "@/contexts/UserContext";
import { BalanceProvider } from "@/contexts/BalanceContext";
import { TradeHistoryProvider } from "@/contexts/TradeHistoryContext";

const apiKey = process.env.NEXT_PUBLIC_CROSSMINT_API_KEY!;

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
            <BalanceProvider>
              <TradeHistoryProvider>{children}</TradeHistoryProvider>
            </BalanceProvider>
          </UserProvider>
        </CrossmintWalletProvider>
      </CrossmintAuthProvider>
    </CrossmintProvider>
  );
}
