# Crossmint Docs Map (Local)

Use this map to select the right local document quickly.

## Core Pages

- `docs/crossmint/overview.md`
  - Product overview and capabilities.
  - Mentions architecture and quickstart entry points.

- `docs/crossmint/architecture.md`
  - Smart contract wallet architecture rationale.
  - Onchain permissioning and migration properties.

- `docs/crossmint/signers-and-custody.md`
  - Signer types and custody implications.
  - Choose signer before implementing transaction flows.

## Build Flows

- `docs/crossmint/react-quickstart.md`
  - End-to-end React setup with providers and `createOnLogin`.
  - Best entry point for frontend app integrations.

- `docs/crossmint/create-wallet.md`
  - Wallet creation patterns across SDKs.
  - Use for `getOrCreateWallet` and create parameters (`chain`, `signer`, `alias`, optional `owner`).

- `docs/crossmint/transfer-tokens.md`
  - `wallet.send(recipient, token, amount)` examples.
  - Transaction result handling (`hash`, `explorerLink`).

- `docs/crossmint/send-transaction.md`
  - Stellar custom contract call transaction pattern via SDK.
  - Use for contract calls beyond simple token transfers.

- `docs/crossmint/sign-message.md`
  - Constraint page: message signing not supported for Stellar smart wallets.

## Retrieval Strategy

1. Start with overview.
2. Lock signer model with signers-and-custody.
3. Select guide by task intent (create, transfer, custom tx).
4. Validate chain constraints and signer compatibility.
5. Generate SDK code with explicit error handling and user feedback.
