# Crossmint SDK Workflows (No REST)

This reference contains SDK-first patterns only.

## 1) React App Bootstrap

Use `@crossmint/client-sdk-react-ui` providers and create wallet on login when desired.

```tsx
"use client";

import {
  CrossmintProvider,
  CrossmintAuthProvider,
  CrossmintWalletProvider,
} from "@crossmint/client-sdk-react-ui";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CrossmintProvider apiKey={process.env.NEXT_PUBLIC_CROSSMINT_CLIENT_KEY ?? ""}>
      <CrossmintAuthProvider>
        <CrossmintWalletProvider
          createOnLogin={{
            chain: "base-sepolia",
            signer: { type: "email" },
          }}
        >
          {children}
        </CrossmintWalletProvider>
      </CrossmintAuthProvider>
    </CrossmintProvider>
  );
}
```

Notes:
- Keep client key in env vars, never hardcode.
- Choose chain per environment (staging uses testnets).

## 2) Create or Resolve Wallet

Use React hook `getOrCreateWallet`.

```ts
import { useWallet } from "@crossmint/client-sdk-react-ui";

const { getOrCreateWallet } = useWallet();

const wallet = await getOrCreateWallet({
  chain: "base-sepolia",
  signer: {
    type: "email",
    email: "user@example.com",
  },
  alias: "trading",
});
```

Use Node.js SDK when wallet orchestration belongs on backend services.

## 3) Transfer Tokens

Use wallet send API:

```ts
const { hash, explorerLink } = await wallet.send(
  "0x0D282906CDD8F6934d60E4dCAa79fa5B1c7a1925",
  "usdxm",
  "3.14"
);
```

Implementation expectations:
- Validate recipient format and amount before sending.
- Handle pending/loading/error UI state.
- Surface `explorerLink` in success state.

## 4) Stellar Custom Transaction (Contract Call)

For non-transfer Stellar actions, adapt wallet to `StellarWallet` and call `sendTransaction`.

```ts
import { useWallet, StellarWallet } from "@crossmint/client-sdk-react-ui";

const { wallet } = useWallet();
if (!wallet) throw new Error("Wallet not available");

const stellarWallet = StellarWallet.from(wallet);

const { hash, explorerLink } = await stellarWallet.sendTransaction({
  contractId: "<contract-id>",
  method: "transfer",
  args: {
    from: "<source-address>",
    to: "<destination-address>",
    amount: "1000000000000000000",
  },
});
```

## 5) Message Signing Constraint (Stellar)

From docs: message signing is not yet supported in Stellar smart wallets.

Required behavior:
- Do not generate Stellar message-signing code through Crossmint.
- Suggest transaction-based alternatives where possible.
