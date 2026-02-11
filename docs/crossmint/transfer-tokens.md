> ## Documentation Index
> Fetch the complete documentation index at: https://docs.crossmint.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Transfer Tokens

> Transfer tokens between wallets using Crossmint's APIs

## Prerequisites

* **Wallet**: [Create a wallet](/wallets/guides/create-wallet) to transfer from.
* **Test Tokens**: Fund your wallet with [USDXM testnet tokens](/wallets/guides/get-staging-tokens) before transferring.
* **API Key**: Get an API key with the `wallets:transactions.create` scope. In staging, all scopes are included by default.

## What is a token transfer?

A token transfer moves a token from one wallet address to another on-chain. This creates an on-chain transaction that costs gas, which Crossmint handles for you. Once the blockchain confirms the transaction, the transfer is final and cannot be reversed.

## Sending tokens

<Tabs>
  <Tab title="React">
    ```typescript  theme={null}
    import { useWallet } from '@crossmint/client-sdk-react-ui';

    const { wallet } = useWallet();

    const { hash, explorerLink } = await wallet.send("0x0D282906CDD8F6934d60E4dCAa79fa5B1c7a1925", "usdxm", "3.14");
    ```
  </Tab>

  <Tab title="Node.js">
    ```typescript  theme={null}
    import { CrossmintWallets, createCrossmint } from "@crossmint/wallets-sdk";

    const crossmint = createCrossmint({
        apiKey: "<your-server-api-key>",
    });

    const crossmintWallets = CrossmintWallets.from(crossmint);

    const wallet = await crossmintWallets.getWallet(
        "email:user@example.com:evm",
        { chain: "base-sepolia", signer: { type: "email" } }
    );

    const { hash, explorerLink } = await wallet.send("0x0D282906CDD8F6934d60E4dCAa79fa5B1c7a1925", "usdxm", "3.14");
    ```
  </Tab>

  <Tab title="React Native">
    ```typescript  theme={null}
    import { useWallet } from '@crossmint/client-sdk-react-native-ui';

    const { wallet } = useWallet();

    const { hash, explorerLink } = await wallet.send("0x0D282906CDD8F6934d60E4dCAa79fa5B1c7a1925", "usdxm", "3.14");
    ```
  </Tab>

  <Tab title="Swift">
    ```swift  theme={null}
    import CrossmintClient
    import Wallet

    let sdk = CrossmintSDK.shared

    let wallet = try await sdk.crossmintWallets.getOrCreateWallet(
        chain: .baseSepolia,
        signer: .email("user@example.com")
    )

    let result = try await wallet.send("0x0D282906CDD8F6934d60E4dCAa79fa5B1c7a1925", "usdxm", 3.14)
    ```
  </Tab>

  <Tab title="REST">
    Transfers must be approved by one of the wallet's [signers](/wallets/signers-and-custody).
    The SDK handles this automatically, but with the REST API you may need to craft, sign, and submit the approval manually.

    <Steps>
      <Step title="Create the transaction">
        Call the [transfer token](/api-reference/wallets/transfer-token) endpoint.

        <CodeGroup>
          ```bash Curl theme={null}
          curl --request POST \
              --url https://staging.crossmint.com/api/2025-06-09/wallets/<walletAddress>/tokens/base-sepolia:usdc/transfers \
              --header 'Content-Type: application/json' \
              --header 'X-API-KEY: <x-api-key>' \
              --data '{
                  "recipient": "<recipientAddress>",
                  "amount": "3.14",
                  "signer": "external-wallet:<externalWalletAddress>"
              }'
          ```

          ```js Node.js theme={null}
          const url = 'https://staging.crossmint.com/api/2025-06-09/wallets/<walletAddress>/tokens/base-sepolia:usdc/transfers';

          const payload = {
              recipient: "<recipientAddress>",
              amount: "3.14",
              signer: "external-wallet:<externalWalletAddress>"
          };

          const options = {
              method: 'POST',
              headers: {
                  'X-API-KEY': '<x-api-key>',
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(payload)
          };

          try {
              const response = await fetch(url, options);
              const data = await response.json();
              console.log(data);
          } catch (error) {
              console.error(error);
          }
          ```

          ```python Python theme={null}
          import requests

          url = "https://staging.crossmint.com/api/2025-06-09/wallets/<walletAddress>/tokens/base-sepolia:usdc/transfers"

          payload = {
              "recipient": "<recipientAddress>",
              "amount": "3.14",
              "signer": "external-wallet:<externalWalletAddress>"
          }
          headers = {
              "X-API-KEY": "<x-api-key>",
              "Content-Type": "application/json"
          }

          response = requests.post(url, json=payload, headers=headers)

          print(response.json())
          ```
        </CodeGroup>

        See the [API reference](/api-reference/wallets/transfer-token) for more details.
      </Step>

      <Step title="Choose your signer type">
        The next steps depend on which signer type you specified in the previous step.

        <Tabs>
          <Tab title="API Key">
            [API Key](/wallets/signers-and-custody#api-key) signers require no additional steps. Crossmint approves transactions automatically when using API key authentication, so the remaining steps in this guide do not apply.
          </Tab>

          <Tab title="External Wallet">
            For [External Wallet](/wallets/signers-and-custody#external-wallet) signers, you must manually sign the approval message and submit it via the API. The response from Step 1 includes a pending approval with a `message` field that must be signed exactly as returned.

            From the previous step's response, extract:

            * `id` - The transaction ID (used in the next step)
            * `approvals.pending[0].message` - The hex message to sign

            Sign the message using your external wallet. The message is a raw hex string and must be signed exactly as returned. Here's an example using an EVM wallet with [Viem](https://viem.sh/):

            ```typescript  theme={null}
            import { privateKeyToAccount } from "viem/accounts";

            // The message from tx.approvals.pending[0].message
            const messageToSign = "<messageFromResponse>";

            // Sign the message exactly as returned (raw hex)
            const account = privateKeyToAccount(`0x${"<privateKey>"}`);
            const signature = await account.signMessage({
                message: { raw: messageToSign },
            });
            ```
          </Tab>

          <Tab title="Email & Phone">
            [Email, phone number, and social login](/wallets/signers-and-custody#email%2C-phone-number%2C-and-social-login) signers require client-side OTP verification and key derivation, which the Crossmint SDK handles automatically. While REST API signing is technically possible, Crossmint does not recommend it because you would still need client-side SDK integration for the signing step.

            <Warning>
              Crossmint recommends using the React, React Native, Swift, or Node.js SDK examples instead. The SDK handles the full signing flow for email and phone signers.
            </Warning>
          </Tab>

          <Tab title="Passkey">
            [Passkey](/wallets/signers-and-custody#passkey) signers use WebAuthn for biometric or password manager authentication, which requires browser interaction. While REST API signing is technically possible, Crossmint does not recommend it because you would still need client-side SDK integration for the WebAuthn signing step.

            <Warning>
              Crossmint recommends using the React, React Native, Swift, or Node.js SDK examples instead. The SDK handles the full passkey signing flow automatically.
            </Warning>
          </Tab>
        </Tabs>
      </Step>

      <Step title="Submit the approval">
        <Note>
          Skip this step if using an `api-key` signer.
        </Note>

        Call the [approve transaction](/api-reference/wallets/approve-transaction) endpoint with the signature from Step 2 and the transaction ID from Step 1.

        <CodeGroup>
          ```bash cURL theme={null}
          curl --request POST \
              --url https://staging.crossmint.com/api/2025-06-09/wallets/<walletAddress>/transactions/<txId>/approvals \
              --header 'Content-Type: application/json' \
              --header 'X-API-KEY: <x-api-key>' \
              --data '{
                  "approvals": [{
                      "signer": "external-wallet:<externalWalletAddress>",
                      "signature": "<signature>"
                  }]
              }'
          ```

          ```js Node.js theme={null}
          const url = 'https://staging.crossmint.com/api/2025-06-09/wallets/<walletAddress>/transactions/<txId>/approvals';

          const payload = {
              approvals: [{
                  signer: "external-wallet:<externalWalletAddress>",
                  signature: "<signature>"
              }]
          };

          const options = {
              method: 'POST',
              headers: {
                  'X-API-KEY': '<x-api-key>',
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(payload)
          };

          try {
              const response = await fetch(url, options);
              const data = await response.json();
              console.log(data);
          } catch (error) {
              console.error(error);
          }
          ```

          ```python Python theme={null}
          import requests

          url = "https://staging.crossmint.com/api/2025-06-09/wallets/<walletAddress>/transactions/<txId>/approvals"

          payload = {
              "approvals": [{
                  "signer": "external-wallet:<externalWalletAddress>",
                  "signature": "<signature>"
              }]
          }
          headers = {
              "X-API-KEY": "<x-api-key>",
              "Content-Type": "application/json"
          }

          response = requests.post(url, json=payload, headers=headers)

          print(response.json())
          ```
        </CodeGroup>

        See the [API reference](/api-reference/wallets/approve-transaction) for more details.
      </Step>

      <Step title="(Optional) Check transaction status">
        You can poll the transaction status to confirm it completed successfully.

        <CodeGroup>
          ```bash cURL theme={null}
          curl --request GET \
              --url https://staging.crossmint.com/api/2025-06-09/wallets/<walletAddress>/transactions/<txId> \
              --header 'X-API-KEY: <x-api-key>'
          ```

          ```js Node.js theme={null}
          const url = 'https://staging.crossmint.com/api/2025-06-09/wallets/<walletAddress>/transactions/<txId>';

          const options = {
              method: 'GET',
              headers: {
                  'X-API-KEY': '<x-api-key>'
              }
          };

          try {
              const response = await fetch(url, options);
              const data = await response.json();
              console.log(data);
          } catch (error) {
              console.error(error);
          }
          ```

          ```python Python theme={null}
          import requests

          url = "https://staging.crossmint.com/api/2025-06-09/wallets/<walletAddress>/transactions/<txId>"

          headers = {
              "X-API-KEY": "<x-api-key>"
          }

          response = requests.get(url, headers=headers)

          print(response.json())
          ```
        </CodeGroup>
      </Step>
    </Steps>

    ### Complete example

    Here's a complete, copy-pastable example for the `external-wallet` signer flow using <Tooltip tip="A TypeScript library for interacting with EVM blockchains">Viem</Tooltip>:

    ```typescript  theme={null}
    import { privateKeyToAccount } from "viem/accounts";

    // ============================
    // Config (replace placeholders)
    // ============================
    const API_BASE_URL = "https://staging.crossmint.com";
    const API_VERSION = "2025-06-09";

    const API_KEY = "<x-api-key>";
    const WALLET_ADDRESS = "<walletAddress>";
    const CHAIN = "base-sepolia";
    const TOKEN = "usdc";

    // The externally-owned address that will sign the approval message:
    const EXTERNAL_WALLET_ADDRESS = "<externalWalletAddress>";

    const RECIPIENT_ADDRESS = "<recipientAddress>";

    const AMOUNT = "0.69";

    const headers = {
        "X-API-KEY": API_KEY,
        "Content-Type": "application/json",
    };

    // ============================
    // STEP 1: Create the transaction
    // ============================
    const createTransferUrl = `${API_BASE_URL}/api/${API_VERSION}/wallets/${WALLET_ADDRESS}/tokens/${CHAIN}:${TOKEN}/transfers`;

    const createTransferPayload = {
        recipient: RECIPIENT_ADDRESS,
        amount: AMOUNT,
        signer: `external-wallet:${EXTERNAL_WALLET_ADDRESS}`,
    };

    const createTransferRes = await fetch(createTransferUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(createTransferPayload),
    });

    if (!createTransferRes.ok) {
        throw new Error(
            `Failed to create transfer: ${createTransferRes.status} ${await createTransferRes.text()}`
        );
    }

    const tx = await createTransferRes.json();
    const txId = tx.id;
    const messageToSign = tx?.approvals?.pending?.[0]?.message;

    if (!messageToSign) {
        throw new Error(
            "No approval message found. Ensure signer is external-wallet and that an approval is pending."
        );
    }

    console.log("txId:", txId);
    console.log("messageToSign:", messageToSign);

    // ============================
    // STEP 2: Sign the approval message (Viem)
    // ============================
    // IMPORTANT: sign the message EXACTLY as returned (a raw hex string).
    const account = privateKeyToAccount(`0x${"<privateKey>"}`);

    const signature = await account.signMessage({
        message: { raw: messageToSign },
    });

    console.log("signature:", signature);

    // ============================
    // STEP 3: Submit the signature
    // ============================
    const submitApprovalUrl = `${API_BASE_URL}/api/${API_VERSION}/wallets/${WALLET_ADDRESS}/transactions/${txId}/approvals`;

    const submitApprovalPayload = {
        approvals: [
            {
                signer: `external-wallet:${EXTERNAL_WALLET_ADDRESS}`,
                signature,
            },
        ],
    };

    const submitApprovalRes = await fetch(submitApprovalUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(submitApprovalPayload),
    });

    if (!submitApprovalRes.ok) {
        throw new Error(
            `Failed to submit approval: ${submitApprovalRes.status} ${await submitApprovalRes.text()}`
        );
    }

    const approvalResult = await submitApprovalRes.json();
    console.log("approvalResult:", approvalResult);

    // ============================
    // STEP 4 (optional): Check transaction status
    // ============================
    const getTxUrl = `${API_BASE_URL}/api/${API_VERSION}/wallets/${WALLET_ADDRESS}/transactions/${txId}`;

    const getTxRes = await fetch(getTxUrl, { method: "GET", headers });

    if (!getTxRes.ok) {
        throw new Error(
            `Failed to fetch transaction: ${getTxRes.status} ${await getTxRes.text()}`
        );
    }

    const txStatus = await getTxRes.json();
    console.log("txStatus:", txStatus);
    ```
  </Tab>
</Tabs>

See the [API reference](/api-reference/wallets/transfer-token) for all supported locator formats.

## Verify your transfer

Once the transfer completes, you can verify it in two ways:

1. **View the on-chain transaction** using the `explorerLink` returned by the `send` method:

```typescript  theme={null}
console.log("View transaction:", explorerLink);
// Example: https://sepolia.basescan.org/tx/0xe5844116732d6cd21127bfc100ba29aee02b82cc4ab51e134d44e719ca8d0b48
```

2. **Check the recipient's balance** programmatically using the [check balances API](/wallets/guides/check-balances).

## Next steps

<CardGroup cols={3}>
  <Card title="Monitor transfers with webhooks" icon="bell" href="/wallets/guides/monitor-transfers-webhooks">
    Track transactions and receive completion notifications
  </Card>

  <Card title="How to check wallet balances" icon="wallet" href="/wallets/guides/check-balances">
    Query token balances across your wallets
  </Card>

  <Card title="Test the Transfer Tokens API" icon="code" href="/api-reference/wallets/transfer-token">
    Try out the API in the interactive playground
  </Card>
</CardGroup>
