---
name: crossmint
description: Crossmint wallets integration skill for SDK-first implementations in React and Node.js. Use when building or debugging wallet creation, signer configuration, token transfers, and Stellar wallet transactions with the local docs in docs/crossmint/.
---

# Crossmint SDK-First Workflow

Use this skill to implement Crossmint wallet flows without REST endpoints.

## Rules

- Use local docs in `docs/crossmint/` as the source of truth.
- Prefer SDK flows (React/React Native/Node.js/Swift examples) and avoid REST examples.
- Never use demo API keys shown in docs snippets.
- Confirm required API scopes before generating code.
- Pick signer model before coding transaction logic.
- For Stellar, do not implement message-signing flows (currently unsupported).

## Execution Flow

1. Read `docs/crossmint/overview.md` to align on product capabilities and terminology.
2. Read `docs/crossmint/signers-and-custody.md` and choose signer type based on custody and UX.
3. Choose SDK surface based on app context:
   - Frontend React: `@crossmint/client-sdk-react-ui`
   - Backend Node.js: `@crossmint/wallets-sdk`
4. Load the task-specific guide:
   - Wallet creation: `docs/crossmint/create-wallet.md`
   - Token transfer: `docs/crossmint/transfer-tokens.md`
   - Stellar custom transaction: `docs/crossmint/send-transaction.md`
   - Stellar message signing constraint: `docs/crossmint/sign-message.md`
5. Implement minimal code path first, then add validation, error handling, and status feedback.

## Task Routing

- For doc discovery and page selection, use `references/docs-map.md`.
- For SDK implementation patterns and snippets, use `references/sdk-workflows.md`.
- For signer and custody decisions, use `references/signer-guide.md`.

## Output Expectations

- Generate SDK-based code only unless the user explicitly requests otherwise.
- Include chain and signer choices explicitly in produced code.
- Include scope checklist in implementation notes when relevant:
  - `wallets.create`
  - `wallets.read`
  - `wallets:transactions.create`
  - `wallets:transactions.sign`
  - `wallets:balance.read`
  - `wallets.fund`
