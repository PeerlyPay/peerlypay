> ## Documentation Index
> Fetch the complete documentation index at: https://docs.crossmint.com/llms.txt
> Use this file to discover all available pages before exploring further.

# React

> Create user wallets from your frontend in under 5 minutes

<CardGroup cols={2}>
  <Snippet file="before-you-start.mdx" />

  <Card title="Wallets Quickstart" icon="github" iconType="duotone" href="https://github.com/Crossmint/wallets-quickstart">
    See a full working example.
  </Card>
</CardGroup>

<Steps>
  <Step title="Install the SDK">
    Run the following command to install the SDK:

    <Snippet file="client-sdk-react-ui-installation-cmd.mdx" />
  </Step>

  <Step title="Add the Crossmint providers to your app">
    Add the necessary Crossmint providers to your app. This example uses [Crossmint Auth](/authentication/introduction)
    but you can use [any authentication provider of your choice](/wallets/guides/bring-your-own-auth).

    With the current setup, a wallet will be created automatically on login.

    <CodeGroup>
      ```tsx next.js theme={null}
      "use client";

      import {
          CrossmintProvider,
          CrossmintAuthProvider,
          CrossmintWalletProvider,
      } from "@crossmint/client-sdk-react-ui";

      export function Providers({ children }: { children: React.ReactNode }) {
          return (
              <CrossmintProvider apiKey="<crossmint-client-api-key>">
                  <CrossmintAuthProvider>
                      <CrossmintWalletProvider
                          createOnLogin={{
                              chain: "base-sepolia",
                              signer: {
                                  type: "email",
                              },
                          }}
                      >
                          {children}
                      </CrossmintWalletProvider>
                  </CrossmintAuthProvider>
              </CrossmintProvider>
          );
      }
      ```

      ```tsx create-react-app theme={null}
      import ReactDOM from 'react-dom/client';

      import './index.css';

      import App from './App';

      import {
          CrossmintProvider,
          CrossmintAuthProvider,
          CrossmintWalletProvider,
      } from "@crossmint/client-sdk-react-ui";

      const root = ReactDOM.createRoot(document.getElementById('root'));

      root.render(
          <React.StrictMode>
              <CrossmintProvider apiKey="<crossmint-client-api-key>">
                      <CrossmintAuthProvider>
                          <CrossmintWalletProvider
                              createOnLogin={{
                                  chain: "base-sepolia",
                                  signer: {
                                      type: "email",
                                  },
                              }}
                          >
                              <App />
                          </CrossmintWalletProvider>
                      </CrossmintAuthProvider>
                  </CrossmintProvider>
          </React.StrictMode>
      );
      ```
    </CodeGroup>

    ### Configuring the Wallet Provider

    <ResponseField name="createOnLogin" type="object">
      If set creates a wallet on login using the specified configuration.

      <Expandable title="properties">
        <ResponseField name="chain" type="string" required>
          The chain to use the wallet on.

          See all [supported chains](/introduction/supported-chains) for more details. On [staging](/introduction/platform/staging-vs-production) only testnet chains are supported.

          Note: For EVM-compatible chains, wallets are created for all
          chains as part of the shared address space derived from the same private key. However, to
          interact with a specific chain using the SDK, you must instantiate a wallet object per chain.
          This allows the SDK to correctly route interactions to the appropriate network configuration.
        </ResponseField>

        <ResponseField name="signer" type="Signer" required>
          The [signer](/wallets/signers-and-custody) to use the wallet with.
        </ResponseField>

        <ResponseField name="alias" type="string">
          An optional identifier for the wallet, used to organize multiple wallets on the same chain.

          Aliases are:

          * Unique per wallet type and chain.
          * Must use only lowercase letters, numbers, underscores, or hyphens (`a-z`, `0-9`, `_`, `-`).
          * No spaces or empty strings allowed.

          Examples:
          `trading`, `long-term-holdings`, `treasury`
        </ResponseField>
      </Expandable>
    </ResponseField>

    <Snippet file="wallets-provider-callbacks.mdx" />

    <ResponseField name="showPasskeyHelpers" type="boolean">
      Only applies if you are using a [passkey](/wallets/signers-and-custody) as the signer.

      If true, modals explaining what passkeys are will be shown to the user when creating a wallet and signing a transaction, for a better user experience.
    </ResponseField>

    <Snippet file="appearance-field.mdx" />
  </Step>

  <Step title="Build a wallet component with basic functionality">
    Create a component that handles authentication and basic wallet actions.

    ```tsx wallet-app.tsx theme={null}
    import { useState } from "react";
    import { useAuth, useWallet } from "@crossmint/client-sdk-react-ui";

    export function WalletApp() {
        const { login, logout, jwt, status } = useAuth();
        const { wallet } = useWallet();
        const [usdxmBalance, setUsdxmBalance] = useState<string>("");

        const fundWallet = async () => {
            if (!wallet || !jwt) return;
            await wallet.stagingFund(10);
        };

        const transferTokens = async () => {
            if (!wallet) return;
            
            const recipient = "0xdf8b5f9c19e187f1ea00730a1e46180152244315";
            const token = "usdxm";
            const amount = "1";
            
            await wallet.send(recipient, token, amount);
        };

        const checkBalance = async () => {
            if (!wallet) return;
            const balances = await wallet.balances(["usdxm"]);
            const usdxmBalance = balances.tokens.find(
                (token) => token.symbol === "usdxm"
            )?.amount;
            setUsdxmBalance(usdxmBalance || "0");
        };

        if (status === "initializing") {
            return <div>Loading...</div>;
        }

        if (wallet == null || status === "logged-out") {
            return <button onClick={login}>Login</button>;
        }

        return (
            <div>
                <h2>💼 Wallet: {wallet?.address}</h2>
                <h3>👤 {wallet?.owner}</h3><br />
                <button onClick={fundWallet}>💰 Fund with 10 USDXM</button><br />
                <button onClick={transferTokens}>📤 Send 1 USDXM</button><br />
                <button onClick={checkBalance}>🔍 Check Balance</button><br />
                <button onClick={logout}>🚪 Logout</button>
                {usdxmBalance && <p>💳 USDXM Balance: {usdxmBalance}</p>}
            </div>
        );
    }

    ```
  </Step>

  <Step title="Render the wallet app">
    Render the wallet app in your application.

    ```tsx app.tsx theme={null}
    "use client";

    import { Providers } from './providers';
    import { WalletApp } from './wallet-app';

    export default function Home() {
        return (
            <Providers>
                <WalletApp />
            </Providers>
        );
    }
    ```
  </Step>
</Steps>

## Launching in Production

For production, the steps are almost identical, but some changes are required:

1. Create a developer account on the [production console](https://www.crossmint.com/console)
2. Create a production client API key on the [API Keys](https://www.crossmint.com/console/projects/apiKeys) page with the API scopes `users.create`, `users.read`, `wallets.read`, `wallets.create`, `wallets:transactions.create`, `wallets:transactions.sign`, `wallets:balance.read`, `wallets.fund`
3. Replace your test API key with the production key

## Learn More

<CardGroup cols={3}>
  <Card title="Check Balances" icon="money-bill-transfer" iconType="duotone" href="/wallets/guides/check-balances">
    Check the balance of a wallet.
  </Card>

  <Card title="Transfer Tokens" icon="coins" iconType="duotone" color="#1A5785" href="/wallets/guides/transfer-tokens">
    Send tokens between wallets.
  </Card>

  <Card title="Delegated Signers" icon="key" iconType="duotone" color="#2156B9" href="/wallets/guides/delegated-signers">
    Add delegated signers to a wallet.
  </Card>
</CardGroup>

## Other Links

<CardGroup cols={2}>
  <Card title="API Reference" icon="terminal" color="#B56710" href="/api-reference/wallets/create-wallet">
    Deep dive into API reference docs.
  </Card>

  <Card title="Talk to an expert" icon="message" iconType="duotone" color="#ADD8E6" href="https://www.crossmint.com/contact/sales">
    Contact our sales team for support.
  </Card>
</CardGroup>
