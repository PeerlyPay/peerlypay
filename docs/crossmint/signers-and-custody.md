> ## Documentation Index
> Fetch the complete documentation index at: https://docs.crossmint.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Signers and custody

> Crossmint Wallets Signers and custody

A **signer** is a digital identity authorized to approve actions on the wallet's behalf.
When a transaction is initiated, the signer digitally signs it, thereby authorizing and enabling its execution.

Crossmint supports the following **signer types**:

* [**Email**, **phone number**, or **social login**](#email,-phone-number,-and-social-login)
* [**Passkey**](#passkey)
* [**External wallet**](#external-wallet)
* [**API key**](#api-key)
* [**AWS KMS signer**](/stablecoin-orchestration/treasury-wallet/guides/signer-aws-kms)

## Choosing a signer type

Signer types will define the custody and user experience of a wallet.

| Signer type                                                                       | Custody                                                               | User experience                                                                                                                                |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Email, phone number, social login                                                 | Non-custodial                                                         | Users authenticate once per device the first time they are going to transact. Future transactions can happen without needing user interaction. |
| Passkey                                                                           | Non-custodial                                                         | Transactions need to be signed every time with the device biometrics or password manager.                                                      |
| External Wallet                                                                   | Non-custodial or custodial depending on who has access to the wallet. | Transactions need to be signed every time with the external wallet.                                                                            |
| API Key                                                                           | Custodial                                                             | All transactions can happen without needing user interaction.                                                                                  |
| [AWS KMS signer](/stablecoin-orchestration/treasury-wallet/guides/signer-aws-kms) | Non-custodial                                                         | Transactions are signed server-side using AWS KMS. No user interaction required.                                                               |

<Note>
  If you use a non-custodial signer and a custodial signer at the same time, the wallet will be considered custodial.
</Note>

**Choose custodial signers if:**

* You are licensed for custody
* You are building use cases that don't require custody, such as collectibles or utility token management
* You want to handle asset management and transactions on behalf of users
* You need a simple, server-side solution without user interaction for blockchain operations

**Choose non-custodial signers if:**

* You are building use cases that require license (e.g. holding stablecoins) and you don't have it
* Self custody is important to your users

## Signer types

### Email, phone number, and social login

Email, phone number, and social login signers enable users to access their wallets and perform transactions seamlessly using their email address, phone number, or social account.

Users just need to verify their email address, phone number, or social account once per device to access their wallet.

<AccordionGroup>
  <Accordion title="How does it work?">
    This signer type uses a master secret that is deterministically derived inside a Trusted Execution Environment (TEE) running open-source, verifiable code. The master secret is never stored anywhere—it only exists ephemerally during derivation and is immediately encrypted for secure distribution.

    **Key Components:**

    * **TEE (Trusted Execution Environment)**: A hardware-attested secure enclave (Intel TDX) that derives master secrets using HKDF from a TEE-protected root key combined with the user's signerId and authId (email/phone). The TEE's authenticity is cryptographically verifiable via Intel TDX attestation.

    * **Device Identity Keys**: Each user device generates a P-256 ECDH keypair stored securely in the browser's IndexedDB. These keys are non-extractable and used to decrypt the encrypted master secret. The device identity keys never leave the device.

    * **Encrypted Master Secret**: After authentication, the TEE encrypts the master secret directly to the device's public key using HPKE (Hybrid Public Key Encryption). This encrypted master secret is stored by Crossmint's relay service but can only be decrypted by the device holding the corresponding private key.

    **Authentication and Onboarding Flow:**

    When a user first onboards a device, they authenticate via email or phone using a one-time password (OTP):

    1. The device generates identity keys and requests onboarding from the TEE
    2. The TEE generates a 9-digit OTP and encrypts it using Format Preserving Encryption (FPE) to the device's public key
    3. The encrypted OTP is sent to the user's email or phone—neither Crossmint nor the host application can read it
    4. The user enters the encrypted OTP, which the device decrypts locally
    5. The device sends the decrypted OTP to the TEE via an HPKE-encrypted channel
    6. The TEE verifies the OTP, confirming the user controls the email/phone
    7. The TEE derives the master secret and encrypts it to the device's public key using HPKE authenticated encryption
    8. The encrypted master secret is stored by Crossmint's relay for future access

    **Signing Flow:**

    When a user wants to sign a transaction:

    1. The host application sends a signing request to a secure iframe isolated from the host
    2. The iframe fetches the encrypted master secret from its local cache (5-minute TTL) or from Crossmint's relay
    3. The iframe decrypts the master secret using its device identity private key (via HPKE)
    4. The iframe derives the blockchain-specific keypair (Ed25519 for Solana and Stellar, secp256k1 for Ethereum) from the master secret
    5. The iframe signs the transaction and returns the signature to the host application
    6. The master secret and derived private keys are immediately wiped from memory using secure memory clearing

    **Communication Security:**

    All communication between the iframe and TEE uses HPKE encryption with authenticated encryption mode. The TEE's public key is verified through Intel TDX hardware attestation before any sensitive data is transmitted, ensuring the iframe is communicating with genuine, unmodified TEE code.

    At no point do the host application or Crossmint have access to the unencrypted master secret or private keys. The signing process is fully isolated within the secure iframe context, and all cryptographic operations are performed locally on the user's device.
  </Accordion>

  <Accordion title="Is this signer type non-custodial?">
    Yes, this system is fully non-custodial because neither the host application nor Crossmint can unilaterally access or control the user's keys.

    **Why it's non-custodial:**

    * **Master Secret Derivation**: The master secret is cryptographically bound to the user's email or phone (authId) through HKDF derivation. Only someone who can authenticate with that email/phone can trigger the TEE to derive and distribute the master secret.

    * **Device-Only Decryption**: Crossmint stores only the encrypted master secret, which is encrypted using HPKE directly to the device's public key. Without the device's private identity key (which never leaves the device and is non-extractable), the encrypted master secret cannot be decrypted.

    * **TEE Attestation**: The TEE code is open-source and its execution is verifiable through Intel TDX hardware attestation. Anyone can verify that the deployed TEE code matches the audited source code and that it only derives master secrets after proper authentication.

    * **Authentication Requirement**: Every device must complete TEE-attested authentication (OTP verification) before receiving an encrypted master secret. The OTP is encrypted to the device and cannot be intercepted by Crossmint or the host application.

    * **Isolated Signing**: All signing operations occur within a sandboxed iframe with strict Content Security Policy (CSP) and Subresource Integrity (SRI) protections. The host application never sees private keys or the master secret.

    **What Crossmint cannot do:**

    * Crossmint cannot decrypt the encrypted master secret without the device's private key
    * Crossmint cannot derive the master secret without the TEE's protected root key
    * Crossmint cannot bypass the OTP authentication flow enforced by the TEE
    * Crossmint cannot sign transactions on behalf of users without their device and authentication

    This architecture ensures that only the user, through their authenticated device, can authorize transactions and access their cryptographic keys, maintaining true self-custody while providing a seamless user experience.
  </Accordion>
</AccordionGroup>

#### Configuration

<Tabs>
  <Tab title="React">
    ```typescript  theme={null}
    import { useWallet } from '@crossmint/client-sdk-react-ui';

    const { getOrCreateWallet } = useWallet();

    const wallet = await getOrCreateWallet({
        chain: "base",
        signer: {
            type: "email",
            email: "user@example.com"
        },
    });
    ```
  </Tab>

  <Tab title="Node.js">
    ```typescript  theme={null}
    import { CrossmintWallets, createCrossmint } from "@crossmint/wallets-sdk";

    const crossmint = createCrossmint({
        apiKey: "<your-server-api-key>",
    });
    const crossmintWallets = CrossmintWallets.from(crossmint);

    const wallet = await crossmintWallets.createWallet({
        chain: "base",
        signer: {
            type: "email",
            email: "user@example.com"
        },
    });
    ```
  </Tab>

  <Tab title="React Native">
    ```typescript  theme={null}
    import { useWallet } from '@crossmint/client-sdk-react-native-ui';

    const { getOrCreateWallet } = useWallet();

    const wallet = await getOrCreateWallet({
        chain: "base",
        signer: {
            type: "email",
            email: "user@example.com"
        },
    });
    ```
  </Tab>

  <Tab title="REST">
    <CodeGroup>
      ```bash Curl theme={null}
      curl --request POST \
          --url https://staging.crossmint.com/api/2025-06-09/wallets \
          --header 'Content-Type: application/json' \
          --header 'X-API-KEY: <x-api-key>' \
          --data '{
              "chainType": "evm",
              "config": {
                  "adminSigner": {
                      "type": "email",
                      "email": "user@example.com"
                  }
              }
          }'
      ```

      ```js Node.js theme={null}
      const url = 'https://staging.crossmint.com/api/2025-06-09/wallets';

      const payload = {
          chainType: "evm",
          config: {
              adminSigner: {
                  type: "email",
                  email: "user@example.com"
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

      url = "https://staging.crossmint.com/api/2025-06-09/wallets"

      payload = {
          "chainType": "evm",
          "config": {
              "adminSigner": {
                  "type": "email",
                  "email": "user@example.com"
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
  </Tab>
</Tabs>

### Passkey

Passkeys enable users to access their wallets and perform transactions using their device biometrics or password manager.
They are built on top of the WebAuthn standard and are supported by most modern browsers. Passkeys need to be created in client-side SDKs.

#### Configuration

<Tabs>
  <Tab title="React">
    ```typescript  theme={null}
    import { useWallet } from '@crossmint/client-sdk-react-ui';

    const { getOrCreateWallet } = useWallet();

    const wallet = await getOrCreateWallet({
        chain: "base",
        signer: {
            type: "passkey",
        },
    });
    ```
  </Tab>

  <Tab title="REST">
    When using a passkey as the admin signer via REST, you must provide the credential details from your passkey registration flow (WebAuthn). The `id` is the credential identifier, `name` is a human-readable label for the passkey, and `publicKey.x` / `publicKey.y` are the public key coordinates from the registration response. In the browser, you can implement this registration flow using a WebAuthn helper library such as [`@simplewebauthn/browser`](https://www.npmjs.com/package/@simplewebauthn/browser).

    <CodeGroup>
      ```bash Curl theme={null}
      curl --request POST \
          --url https://staging.crossmint.com/api/2025-06-09/wallets \
          --header 'Content-Type: application/json' \
          --header 'X-API-KEY: <x-api-key>' \
          --data '{
              "chainType": "evm",
              "config": {
                  "adminSigner": {
                      "type": "passkey",
                      "id": "cWtP7gmZbd98HbKUuGXx5Q",
                      "name": "hgranger",
                      "publicKey": {
                          "x": "38035223810536273945556366218149112558607829411547667975304293530457502824247",
                          "y": "91117823763706733837104303008228095481082989039135234750508288790583476078729"
                      }
                  }
              }
          }'
      ```

      ```js Node.js theme={null}
      const url = 'https://staging.crossmint.com/api/2025-06-09/wallets';

      const payload = {
          chainType: "evm",
          config: {
              adminSigner: {
                  type: "passkey",
                  id: "cWtP7gmZbd98HbKUuGXx5Q",
                  name: "hgranger",
                  publicKey: {
                      x: "38035223810536273945556366218149112558607829411547667975304293530457502824247",
                      y: "91117823763706733837104303008228095481082989039135234750508288790583476078729"
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

      url = "https://staging.crossmint.com/api/2025-06-09/wallets"

      payload = {
          "chainType": "evm",
          "config": {
              "adminSigner": {
                  "type": "passkey",
                  "id": "cWtP7gmZbd98HbKUuGXx5Q",
                  "name": "hgranger",
                  "publicKey": {
                      "x": "38035223810536273945556366218149112558607829411547667975304293530457502824247",
                      "y": "91117823763706733837104303008228095481082989039135234750508288790583476078729"
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
  </Tab>
</Tabs>

### External wallet

External wallets (or keypairs) can be used as signers to access and transact with a wallet.

#### Configuration

<Tabs>
  <Tab title="React">
    ```typescript  theme={null}
    import { useWallet } from '@crossmint/client-sdk-react-ui';

    const { getOrCreateWallet } = useWallet();

    const wallet = await getOrCreateWallet({
        chain: "solana",
        signer: {
            type: "external-wallet",
            address: "WUyB2nCgAFhcf9vJ34s7vUK4KJc77bgoeM3swMcwfWn",
        },
    });
    ```
  </Tab>

  <Tab title="Node.js">
    ```typescript  theme={null}
    import { CrossmintWallets, createCrossmint } from "@crossmint/wallets-sdk";

    const crossmint = createCrossmint({
        apiKey: "<your-server-api-key>",
    });
    const crossmintWallets = CrossmintWallets.from(crossmint);

    const wallet = await crossmintWallets.createWallet({
        chain: "solana",
        signer: {
            type: "external-wallet",
            address: "WUyB2nCgAFhcf9vJ34s7vUK4KJc77bgoeM3swMcwfWn",
        },
    });
    ```
  </Tab>

  <Tab title="React Native">
    ```typescript  theme={null}
    import { useWallet } from '@crossmint/client-sdk-react-native-ui';

    const { getOrCreateWallet } = useWallet();

    const wallet = await getOrCreateWallet({
        chain: "solana",
        signer: {
            type: "external-wallet",
            address: "WUyB2nCgAFhcf9vJ34s7vUK4KJc77bgoeM3swMcwfWn",
        },
    });
    ```
  </Tab>

  <Tab title="REST">
    <CodeGroup>
      ```bash Curl theme={null}
      curl --request POST \
          --url https://staging.crossmint.com/api/2025-06-09/wallets \
          --header 'Content-Type: application/json' \
          --header 'X-API-KEY: <x-api-key>' \
          --data '{
              "chainType": "solana",
              "config": {
                  "adminSigner": {
                      "type": "external-wallet",
                      "address": "WUyB2nCgAFhcf9vJ34s7vUK4KJc77bgoeM3swMcwfWn"
                  }
              }
          }'
      ```

      ```js Node.js theme={null}
      const url = 'https://staging.crossmint.com/api/2025-06-09/wallets';

      const payload = {
          chainType: "solana",
          config: {
              adminSigner: {
                  type: "external-wallet",
                  address: "WUyB2nCgAFhcf9vJ34s7vUK4KJc77bgoeM3swMcwfWn"
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

      url = "https://staging.crossmint.com/api/2025-06-09/wallets"

      payload = {
          "chainType": "solana",
          "config": {
              "adminSigner": {
                  "type": "external-wallet",
                  "address": "WUyB2nCgAFhcf9vJ34s7vUK4KJc77bgoeM3swMcwfWn"
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
  </Tab>
</Tabs>

### API key

A project's API key can also be used as a signer for your wallet. This allows transacting with a wallet without needing the user to sign at any point.

#### Configuration

<Tabs>
  <Tab title="React">
    ```typescript  theme={null}
    import { useWallet } from '@crossmint/client-sdk-react-ui';

    const { getOrCreateWallet } = useWallet();

    const wallet = await getOrCreateWallet({
        chain: "evm",
        signer: {
            type: "api-key",
        },
    });
    ```
  </Tab>

  <Tab title="Node.js">
    ```typescript  theme={null}
    import { CrossmintWallets, createCrossmint } from "@crossmint/wallets-sdk";

    const crossmint = createCrossmint({
        apiKey: "<your-server-api-key>",
    });
    const crossmintWallets = CrossmintWallets.from(crossmint);

    const wallet = await crossmintWallets.createWallet({
        chain: "evm",
        signer: {
            type: "api-key",
        },
    });
    ```
  </Tab>

  <Tab title="React Native">
    ```typescript  theme={null}
    import { useWallet } from '@crossmint/client-sdk-react-native-ui';

    const { getOrCreateWallet } = useWallet();

    const wallet = await getOrCreateWallet({
        chain: "evm",
        signer: {
            type: "api-key",
        },
    });
    ```
  </Tab>

  <Tab title="REST">
    <CodeGroup>
      ```bash Curl theme={null}
      curl --request POST \
          --url https://staging.crossmint.com/api/2025-06-09/wallets \
          --header 'Content-Type: application/json' \
          --header 'X-API-KEY: <x-api-key>' \
          --data '{
              "chainType": "evm",
              "config": {
                  "adminSigner": {
                      "type": "api-key"
                  }
              }
          }'
      ```

      ```js Node.js theme={null}
      const url = 'https://staging.crossmint.com/api/2025-06-09/wallets';

      const payload = {
          chainType: "evm",
          config: {
              adminSigner: {
                  type: "api-key"
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

      url = "https://staging.crossmint.com/api/2025-06-09/wallets"

      payload = {
          "chainType": "evm",
          "config": {
              "adminSigner": {
                  "type": "api-key"
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
  </Tab>
</Tabs>
