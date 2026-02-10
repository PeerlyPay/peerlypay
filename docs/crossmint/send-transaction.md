> ## Documentation Index
> Fetch the complete documentation index at: https://docs.crossmint.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Stellar

> Send transactions from your wallet

## Prerequisites

* Ensure you have a wallet created.
* **API Key**: Ensure you have an API key with the scopes: `wallets:transactions.create`.

## What is sending a custom transaction?

Sending a custom transaction lets you interact with any smart contract on the blockchain beyond simple transfers. Common use cases include minting free tokens, claiming rewards, or registering for allowlists—all without needing to manage private keys yourself.

## Sending a contract call transaction

<Tabs>
  <Tab title="React">
    ```typescript  theme={null}
    import { useWallet, StellarWallet } from '@crossmint/client-sdk-react-ui';

    const { wallet } = useWallet();

    const stellarWallet = StellarWallet.from(wallet);

    const { hash, explorerLink } = await stellarWallet.sendTransaction({
        contractId: "GB3KQJ6N2YIE62YVO67X7W5TQK6Q5ZZ4P2LUVK2U6AU26CJQ626J",
        method: "transfer",
        args: {
            to: "GB3KQJ6N2YIE62YVO67X7W5TQK6Q5ZZ4P2LUVK2U6AU26CJQ626J",
            from: "GB3KQJ6N2YIE62YVO67X7W5TQK6Q5ZZ4P2LUVK2U6AU26CJQ626J",
            amount: "1000000000000000000"
        }
    });
    ```

    ### Parameters

    <ParamField path="contractId" type="string" required>
      The contract ID to send the transaction to.
    </ParamField>

    <ParamField path="method" type="string" required>
      The method to call on the contract.
    </ParamField>

    <ParamField path="args" type="Record<string, any>" required>
      The arguments to pass to the method.
    </ParamField>

    ### Returns

    <ParamField path="hash" type="string">
      The hash of the transaction.
    </ParamField>

    <ParamField path="explorerLink" type="string">
      The explorer link of the transaction.
    </ParamField>
  </Tab>

  <Tab title="Node.js">
    ```typescript  theme={null}
    import { CrossmintWallets, createCrossmint, StellarWallet } from "@crossmint/wallets-sdk";

    const crossmint = createCrossmint({
        apiKey: "<your-server-api-key>",
    });

    const crossmintWallets = CrossmintWallets.from(crossmint);

    const wallet = await crossmintWallets.getWallet(
        "email:user@example.com:stellar",
        { chain: "stellar", signer: { type: "email" } }
    );

    const stellarWallet = StellarWallet.from(wallet);

    const { hash, explorerLink } = await stellarWallet.sendTransaction({
        contractId: "GB3KQJ6N2YIE62YVO67X7W5TQK6Q5ZZ4P2LUVK2U6AU26CJQ626J",
        method: "transfer",
        args: {
            to: "GB3KQJ6N2YIE62YVO67X7W5TQK6Q5ZZ4P2LUVK2U6AU26CJQ626J",
            from: "GB3KQJ6N2YIE62YVO67X7W5TQK6Q5ZZ4P2LUVK2U6AU26CJQ626J",
            amount: "1000000000000000000"
        }
    });
    ```

    ### Parameters

    <ParamField path="contractId" type="string" required>
      The contract ID to send the transaction to.
    </ParamField>

    <ParamField path="method" type="string" required>
      The method to call on the contract.
    </ParamField>

    <ParamField path="args" type="Record<string, any>" required>
      The arguments to pass to the method.
    </ParamField>

    ### Returns

    <ParamField path="hash" type="string">
      The hash of the transaction.
    </ParamField>

    <ParamField path="explorerLink" type="string">
      The explorer link of the transaction.
    </ParamField>
  </Tab>

  <Tab title="React Native">
    ```typescript  theme={null}
    import { useWallet, StellarWallet } from '@crossmint/client-sdk-react-native-ui';

    const { wallet } = useWallet();

    const stellarWallet = StellarWallet.from(wallet);

    const { hash, explorerLink } = await stellarWallet.sendTransaction({
        contractId: "GB3KQJ6N2YIE62YVO67X7W5TQK6Q5ZZ4P2LUVK2U6AU26CJQ626J",
        method: "transfer",
        args: {
            to: "GB3KQJ6N2YIE62YVO67X7W5TQK6Q5ZZ4P2LUVK2U6AU26CJQ626J",
            from: "GB3KQJ6N2YIE62YVO67X7W5TQK6Q5ZZ4P2LUVK2U6AU26CJQ626J",
            amount: "1000000000000000000"
        }
    });
    ```

    ### Parameters

    <ParamField path="contractId" type="string" required>
      The contract ID to send the transaction to.
    </ParamField>

    <ParamField path="method" type="string" required>
      The method to call on the contract.
    </ParamField>

    <ParamField path="args" type="Record<string, any>" required>
      The arguments to pass to the method.
    </ParamField>

    ### Returns

    <ParamField path="hash" type="string">
      The hash of the transaction.
    </ParamField>

    <ParamField path="explorerLink" type="string">
      The explorer link of the transaction.
    </ParamField>
  </Tab>

  <Tab title="REST">
    Transactions must be approved by one of the wallet's [signers](/wallets/signers-and-custody).
    The SDK handles this automatically, but with the REST API you must [approve the transaction](/api-reference/wallets/approve-transaction) to complete it.

    <Steps>
      <Step title="Create the transaction">
        Call the [create transaction](/api-reference/wallets/create-transaction) endpoint.

        <CodeGroup>
          ```bash cURL theme={null}
          curl --request POST \
              --url https://staging.crossmint.com/api/2025-06-09/wallets/<walletAddress>/transactions \
              --header 'Content-Type: application/json' \
              --header 'X-API-KEY: <x-api-key>' \
              --data '{
                  "params": {
                      "transaction": {
                          "type": "contract-call",
                          "contractId": "GB3KQJ6N2YIE62YVO67X7W5TQK6Q5ZZ4P2LUVK2U6AU26CJQ626J",
                          "method": "transfer",
                          "args": {
                              "to": "GB3KQJ6N2YIE62YVO67X7W5TQK6Q5ZZ4P2LUVK2U6AU26CJQ626J",
                              "from": "GB3KQJ6N2YIE62YVO67X7W5TQK6Q5ZZ4P2LUVK2U6AU26CJQ626J",
                              "amount": "1000000000000000000"
                          }
                      }
                  }
              }'
          ```

          ```js Node.js theme={null}
          const url = 'https://staging.crossmint.com/api/2025-06-09/wallets/<walletAddress>/transactions';

          const payload = {
              params: {
                  transaction: {
                      type: "contract-call",
                      contractId: "GB3KQJ6N2YIE62YVO67X7W5TQK6Q5ZZ4P2LUVK2U6AU26CJQ626J",
                      method: "transfer",
                      args: {
                          to: "GB3KQJ6N2YIE62YVO67X7W5TQK6Q5ZZ4P2LUVK2U6AU26CJQ626J",
                          from: "GB3KQJ6N2YIE62YVO67X7W5TQK6Q5ZZ4P2LUVK2U6AU26CJQ626J",
                          amount: "1000000000000000000"
                      }
                  }
              }
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

          url = "https://staging.crossmint.com/api/2025-06-09/wallets/<walletAddress>/transactions"

          payload = {
              "params": {
                  "transaction": {
                      "type": "contract-call",
                      "contractId": "GB3KQJ6N2YIE62YVO67X7W5TQK6Q5ZZ4P2LUVK2U6AU26CJQ626J",
                      "method": "transfer",
                      "args": {
                          "to": "GB3KQJ6N2YIE62YVO67X7W5TQK6Q5ZZ4P2LUVK2U6AU26CJQ626J",
                          "from": "GB3KQJ6N2YIE62YVO67X7W5TQK6Q5ZZ4P2LUVK2U6AU26CJQ626J",
                          "amount": "1000000000000000000"
                      }
                  }
              }
          }
          headers = {
              "X-API-KEY": "<x-api-key>",
              "Content-Type": "application/json"
          }

          response = requests.post(url, json=payload, headers=headers)

          print(response.json())
          ```
        </CodeGroup>

        See the [API reference](/api-reference/wallets/create-transaction) for more details.
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
    </Steps>
  </Tab>
</Tabs>
