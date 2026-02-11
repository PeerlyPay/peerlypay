# Signer and Custody Decision Guide

Base this decision on `docs/crossmint/signers-and-custody.md`.

## Signer Types

- Email / phone / social
  - Non-custodial.
  - Good default for user-facing apps with low-friction onboarding.

- Passkey
  - Non-custodial.
  - Strong UX for biometric-based approvals and device-level security.

- External wallet
  - Non-custodial or custodial depending on who controls the external keys.
  - Useful for advanced users or pre-existing wallets.

- API key
  - Custodial.
  - Best for server-managed automation where user interaction is not required.

## Selection Heuristics

1. Need user self-custody and simple UX -> choose email/phone/social.
2. Need biometric-first signing experience -> choose passkey.
3. Need compatibility with existing wallets -> choose external-wallet.
4. Need server-side autonomous operations -> choose api-key.

## Implementation Notes

- Decide signer before choosing exact wallet creation API shape.
- Keep signer config explicit in code snippets.
- For mixed signer setups, explain resulting custody implications.
- Avoid deep cryptography explanations unless user asks; focus on integration behavior.

## Scope Checklist

Before implementation, confirm project key permissions for the planned flow:

- `wallets.create`
- `wallets.read`
- `wallets:transactions.create`
- `wallets:transactions.sign`
- `wallets:balance.read`
- `wallets.fund`
