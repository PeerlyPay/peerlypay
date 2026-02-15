---
name: stellar-skills
description: Stellar blockchain and Soroban smart contract development. SDKs, wallets, DeFi protocols, and ecosystem tools. Use when building dApps on Stellar, writing Soroban contracts, integrating wallets, or working with Horizon/Soroban RPC.
---

# Stellar & Soroban Development

## When to use this skill

Use this skill when you need to:
- Build, deploy, or invoke Soroban contracts via `stellar` CLI.
- Set up wallet identities and asset trustlines for test flows.
- Integrate frontend wallet signing with Stellar Wallets Kit.
- Debug transaction simulation failures and contract errors.

---

## Fast paths

### 1) Deploy a contract quickly (testnet)

```bash
stellar contract build

stellar contract upload \
  --wasm target/wasm32v1-none/release/my_contract.wasm \
  --source alice \
  --network testnet

stellar contract deploy \
  --wasm-hash <WASM_HASH> \
  --source alice \
  --network testnet
```

### 2) Create trustline for an issued asset

```bash
stellar tx new change-trust \
  --source-account creator \
  --line "USDC:GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5" \
  --network testnet
```

### 3) Resolve Soroban token contract id from classic asset

```bash
stellar contract id asset \
  --network testnet \
  --asset "USDC:G...ISSUER"
```

### 4) Invoke a contract method quickly

```bash
stellar contract invoke \
  --network testnet \
  --source alice \
  --id CXXXXX... \
  -- method_name \
  --arg_1 value
```

---

## Core workflows

### Workflow 1: Network and funding basics

| Network | Horizon | Soroban RPC | Explorer |
|---------|---------|-------------|----------|
| **Mainnet** | `horizon.stellar.org` | `soroban-rpc.mainnet.stellar.gateway.fm` | stellar.expert |
| **Testnet** | `horizon-testnet.stellar.org` | `soroban-testnet.stellar.org` | stellar.expert/explorer/testnet |
| **Futurenet** | `horizon-futurenet.stellar.org` | `rpc-futurenet.stellar.org` | stellarchain.io |

Testnet XLM faucet:

```bash
curl "https://friendbot.stellar.org?addr=YOUR_PUBLIC_KEY"
```

### Workflow 2: Deploy + bindings workflow

```bash
stellar contract build

stellar contract upload \
  --wasm target/wasm32v1-none/release/my_contract.wasm \
  --source alice \
  --network testnet

stellar contract deploy \
  --wasm-hash <WASM_HASH> \
  --source alice \
  --network testnet

stellar contract bindings typescript \
  --contract-id CXXXXX... \
  --output-dir ./src/contracts/my-contract \
  --network testnet
```

Notes:
- `stellar contract install` is deprecated; prefer `stellar contract upload`.
- Build output path can vary; use the path reported by `stellar contract build`.

### Workflow 3: Asset setup for token transfers

1. Create trustline for each participant account.
2. Ensure account receives asset balance from issuer/distributor.
3. Resolve and use the corresponding Soroban token contract id when needed.

Notes:
- Trustline is required before token `transfer` succeeds.
- Friendbot only funds XLM; it does not mint/send issued assets.

### Workflow 4: Invoke through SDK + wallet signing

```typescript
import * as StellarSdk from '@stellar/stellar-sdk';

const server = new StellarSdk.SorobanRpc.Server('https://soroban-testnet.stellar.org');
const contract = new StellarSdk.Contract('CXXXXX...');

const tx = new StellarSdk.TransactionBuilder(account, { fee: '100' })
  .addOperation(contract.call('method_name', ...args))
  .setTimeout(30)
  .build();

await server.simulateTransaction(tx);

const { signedTxXdr } = await kit.signTransaction(tx.toXDR(), {
  networkPassphrase: StellarSdk.Networks.TESTNET,
});

await server.sendTransaction(
  StellarSdk.TransactionBuilder.fromXDR(signedTxXdr, StellarSdk.Networks.TESTNET)
);
```

### Workflow 5: Wallet connect (Stellar Wallets Kit)

```typescript
import { StellarWalletsKit, WalletNetwork, allowAllModules } from '@creit.tech/stellar-wallets-kit';

const kit = new StellarWalletsKit({
  network: WalletNetwork.TESTNET,
  selectedWalletId: 'freighter',
  modules: allowAllModules(),
});

await kit.openModal({
  onWalletSelected: async (option) => {
    kit.setWallet(option.id);
    const { address } = await kit.getAddress();
    console.log('Connected:', address);
  }
});
```

---

## Known pitfalls and safe patterns

### CLI argument encoding

- For large integers in UDT JSON payloads, prefer strings (for example `"10000000"`).
- For optional/complex args, use valid JSON literals (`null`, quoted strings, arrays, objects).
- For large objects, prefer file-based payloads.

```bash
stellar contract invoke \
  --network testnet \
  --source alice \
  --id CXXXXX... \
  -- some_method \
  --payload '{"amount":"10000000","memo":"0"}'
```

### CLI enum limitation and internal mapping

- Some `stellar contract invoke` versions do not reliably handle Rust UDT enum args.
- Symptom: invoke fails before submission or panics in spec tooling.
- Safe pattern: keep typed domain methods for SDK/tests and add CLI-facing primitive wrappers.

```rust
pub fn submit_request(
    e: Env,
    caller: Address,
    category: RequestCategory,
    urgency: UrgencyLevel,
    quantity: i128,
    ttl_secs: u64,
) -> Result<u64, ContractError> { /* ... */ }

pub fn submit_request_cli(
    e: Env,
    caller: Address,
    category_code: u32,
    urgency_code: u32,
    quantity: i128,
    ttl_secs: u64,
) -> Result<u64, ContractError> {
    let category = RequestCategory::from_code(category_code);
    let urgency = UrgencyLevel::from_code(urgency_code);
    /* ... */
}
```

```bash
stellar contract invoke \
  --network testnet \
  --source alice \
  --id CXXXXX... \
  -- submit_request_cli \
  --caller G... \
  --category_code 0 \
  --urgency_code 1 \
  --quantity 1000 \
  --ttl_secs 600
```

Mapping convention example:
- Category enum: `0=Basic`, `1=Premium`, fallback `Custom(code)`.
- Urgency enum: `0=Low`, `1=Normal`, `2=High`, fallback `Other(code)`.

---

## Troubleshooting checklist

- Simulate first and inspect diagnostic events.
- If you see `Error(Contract, #N)`, map `#N` to your contract error enum.
- If invoke fails before simulation/submission with enum args, test primitive wrapper args.
- Confirm signer identity for methods that call `require_auth()`.
- Confirm both trustline existence and token balance before transfers.

---

## Tools and references

### CLIs and scaffolds

| Tool | Use |
|------|-----|
| **stellar CLI** | Build, deploy, invoke contracts, generate TS bindings |
| **Scaffold Stellar** | Full project template and local network tools |
| **Stellar Lab** | Web tool for network experiments |

### SDKs

| Library | Purpose |
|---------|---------|
| `@stellar/stellar-sdk` | Official JS/TS SDK (classic + Soroban) |
| `soroban-sdk` (Rust) | Write Soroban smart contracts |
| `@stellar/freighter-api` | Direct Freighter wallet integration |
| `@creit.tech/stellar-wallets-kit` | Multi-wallet abstraction |

### Security

| Tool | Use |
|------|-----|
| **Scout Audit** | Static analysis for Soroban |
| **scout-actions** | GitHub Action for PR checks |

```bash
cargo install scout-audit
scout-audit --path ./contracts
```

### Protocols, infra, and docs

- OpenZeppelin Stellar contracts: https://docs.openzeppelin.com/stellar-contracts
- SEP index: https://github.com/stellar/stellar-protocol/tree/master/ecosystem
- Core docs: https://developers.stellar.org
- Soroban docs: https://soroban.stellar.org/docs
- Wallet kit docs: https://stellarwalletskit.dev

**Principle**: Prefer existing protocols/tools before building custom infrastructure.
