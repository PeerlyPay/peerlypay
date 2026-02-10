> ## Documentation Index
> Fetch the complete documentation index at: https://docs.crossmint.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Architecture

> Crossmint Wallets Architecture

The Crossmint wallets architecture is designed to solve the most critical limitations in traditional wallet infrastructure:

1. **Vendor lock-in**: avoid ever needing to export private keys or abandon your existing wallet addresses.
2. **Single point of failure**: eliminate reliance on fragile, single keypairs for access and control.
3. **Permissions you can trust**: enforced **onchain**, not via opaque TEEs or off-chain middleware.

## Smart Contract Wallets

Crossmint uses **smart contract wallets** to unlock support for having **multiple signers** and **onchain programmable logic**.

<Note>
  A **[signer](/wallets/signers-and-custody)** is a digital identity (such as an email, passkey, or external wallet)
  authorized to approve actions on the wallet's behalf.
</Note>

This enables:

* **Seamless provider migration**: update just the admin signer, without changing the wallet address.
* **Built-in security**: use multiple signers for MFA and recovery flows enforced onchain.
* **Granular control**: assign delegated signers with scoped, onchain permissions to act on behalf of the wallet.
* **Shared access** between users or roles, without compromising wallet integrity.

All permissions are enforced **onchain and fully auditable** and remove the need to trust opaque infrastructure or Crossmint's backend.

The wallet logic stays visible, enforceable, and portable.
