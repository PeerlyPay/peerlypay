<p align="center"> <img src="https://github.com/user-attachments/assets/5b182044-dceb-41f5-acf0-da22dea7c98a" alt="CLR-S (2)"> </p>

# Trustless Work | [API Documentation](https://docs.trustlesswork.com/trustless-work)
It enables trustless payments via smart contracts, securing funds in escrow until milestones are approved by clients. Stablecoins like USDC are used to ensure stability and ease of use.

# Maintainers | [Telegram](https://t.me/+kmr8tGegxLU0NTA5)

<table align="center">
  <tr>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/6b97e15f-9954-47d0-81b5-49f83bed5e4b" alt="Owner 1" width="150" />
      <br /><br />
      <strong>Tech Rebel | Product Manager</strong>
      <br /><br />
      <a href="https://github.com/techrebelgit" target="_blank">techrebelgit</a>
      <br />
      <a href="https://t.me/Tech_Rebel" target="_blank">Telegram</a>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/e245e8af-6f6f-4a0a-a37f-df132e9b4986" alt="Owner 2" width="150" />
      <br /><br />
      <strong>Joel Vargas | Frontend Developer</strong>
      <br /><br />
      <a href="https://github.com/JoelVR17" target="_blank">JoelVR17</a>
      <br />
      <a href="https://t.me/joelvr20" target="_blank">Telegram</a>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/53d65ea1-007e-40aa-b9b5-e7a10d7bea84" alt="Owner 3" width="150" />
      <br /><br />
      <strong>Armando Murillo | Full Stack Developer</strong>
      <br /><br />
      <a href="https://github.com/armandocodecr" target="_blank">armandocodecr</a>
      <br />
      <a href="https://t.me/armandocode" target="_blank">Telegram</a>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/851273f6-2f91-413d-bd2d-d8dc1f3c2d28" alt="Owner 4" width="150" />
      <br /><br />
      <strong>Caleb Loría | Smart Contract Developer</strong>
      <br /><br />
      <a href="https://github.com/zkCaleb-dev" target="_blank">zkCaleb-dev</a>
      <br />
      <a href="https://t.me/zkCaleb_dev" target="_blank">Telegram</a>
    </td>
  </tr>
</table>

## Contents

- [Installing Rust](#installing-rust)
- [Install the Stellar CLI](#install-stellar-cli)
- [Configuring the CLI for Testnet](#configuring-the-cli-for-testnet)
- [Configure an idenity](#configure-an-identity)
- [Deploy project on Testenet](#deploy-project-on-testnet)
- [Contracts Overview](#contracts-overview)
- [P2P Contract](#p2p-contract)

## Installing Rust

### Linux, macOS, or Unix-like Systems

If you're using macOS, Linux, or any other Unix-like system, the simplest method to install Rust is by using `rustup`. Install it with the following command:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Windows

On Windows, download and run `rustup-init.exe`. You can proceed with the default setup by pressing `Enter`.

You can also follow the official Rust guide [here](https://www.rust-lang.org/tools/install).

### Install the wasm32 target.

After installing Rust, add the `wasm32-unknown-unknown` target:

```bash
rustup target add wasm32-unknown-unknown
```



## Install Stellar CLI

There are a few ways to install the [latest released version](https://github.com/stellar/stellar-cli/releases) of Stellar CLI.

The toolset installed with Rust allows you to use the `cargo` command in the terminal to install the Stellar CLI.

### Install with cargo from source:

```sh
cargo install --locked stellar-cli --features opt
```

### Install with cargo-binstall:

```sh
cargo install --locked cargo-binstall
cargo binstall -y stellar-cli
```

### Install with Homebrew (macOS, Linux):

```sh
brew install stellar-cli
```



## Configuring the CLI for Testnet

Stellar has a test network called Testnet that you can use to deploy  and test your smart contracts. It's a live network, but it's not the  same as the Stellar public network. It's a separate network that is used for development and testing, so you can't use it for production apps.  But it's a great place to test your contracts before you deploy them to  the public network.

To configure your CLI to interact with Testnet, run the following command:

### macOS/Linux

```sh
stellar network add \
  --global testnet \
  --rpc-url https://soroban-testnet.stellar.org:443 \
  --network-passphrase "Test SDF Network ; September 2015"
```

### Windows (PowerShell)

```sh
stellar network add `
  --global testnet `
  --rpc-url https://soroban-testnet.stellar.org:443 `
  --network-passphrase "Test SDF Network ; September 2015"
```

Note the `--global` flag. This creates a file in your home folder's `~/.config/soroban/network/testnet.toml` with the settings you specified. This means that you can use the `--network testnet` flag in any Stellar CLI command to use this network from any directory or filepath on your system.

If you want project-specific network configurations, you can omit the `--global` flag, and the networks will be added to your working directory's `.soroban/network` folder instead.

###  Configure an Identity

When you deploy a smart contract to a network, you need to specify an identity that will be used to sign the transactions.

Let's configure an identity called `alice`. You can use any name you want, but it might be nice to have some named identities that you can use for testing, such as [`alice`, `bob`, and `carol`](https://en.wikipedia.org/wiki/Alice_and_Bob). 

```sh
stellar keys generate --global alice --network testnet
```

You can see the public key of `alice` with:

```sh
stellar keys address alice
```

You can use this [link](https://stellar.expert/explorer/testnet) to verify the identity you create for the testnet.



## Deploy Project on Testnet


## Quickstart via Makefiles

The root `contracts/Makefile` forwards contract targets and includes wallet bootstrap helpers.
Contract-specific logic lives in:

- `contracts/contracts/escrow/Makefile`
- `contracts/contracts/p2p/Makefile`

### Root forwarding targets

```bash
make help

# Wallet bootstrap (testnet only)
make wallets-bootstrap NETWORK=testnet
make wallets-bootstrap-escrow NETWORK=testnet
make wallets-bootstrap-p2p NETWORK=testnet
make wallets-trustline NETWORK=testnet

# Escrow
make escrow-build
make escrow-install NETWORK=testnet SOURCE=alice
make escrow-deploy NETWORK=testnet SOURCE=alice
make escrow-build-payload NETWORK=testnet ...
make escrow-init NETWORK=testnet SOURCE=alice
make escrow-get NETWORK=testnet SOURCE=alice
make escrow-flow

# P2P
make p2p-build
make p2p-install NETWORK=testnet SOURCE=admin
make p2p-deploy NETWORK=testnet SOURCE=admin
make p2p-init NETWORK=testnet SOURCE=admin ADMIN=G... DISPUTE_RESOLVER=G... PAUSER=G... TOKEN_CONTRACT_ID=C...
make p2p-config NETWORK=testnet SOURCE=admin
make p2p-flow
```

### Wallet bootstrap and fail-fast behavior

- Flow targets (`make escrow-flow`, `make p2p-flow`) now fail fast if required key aliases are missing.
- Use one of the bootstrap commands above to create aliases and fund them through Friendbot.
- Bootstrap also creates a USDC trustline by default for the required aliases.
- Friendbot bootstrap is intentionally restricted to `NETWORK=testnet`.

Trustline defaults:
- `ASSET_CODE=USDC`
- `ASSET_ISSUER=GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5`

Example (set up only P2P aliases plus trustlines):

```bash
make wallets-bootstrap-p2p NETWORK=testnet
```

Manual trustline command used by the Makefile:

```bash
stellar tx new change-trust \
  --source-account creator \
  --line "USDC:GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5" \
  --network testnet
```

Required aliases by flow:
- Escrow flow: `admin`, `contractor`, `freelancer`
- P2P flow: `admin`, `creator`, `filler`

### Escrow one-command happy path

If you do not have aliases yet, bootstrap first:

```bash
make wallets-bootstrap-escrow NETWORK=testnet
```

Then run:

```bash
make escrow-flow
```

Defaults used by the script:
- `NETWORK=testnet`
- `TOKEN_CONTRACT_ID=CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA`
- `ADMIN_ALIAS=admin`
- `CONTRACTOR_ALIAS=contractor`
- `FREELANCER_ALIAS=freelancer`

You can override any of these:

```bash
NETWORK=testnet TOKEN_CONTRACT_ID=C... make escrow-flow
```

### P2P one-command happy path

If you do not have aliases yet, bootstrap first:

```bash
make wallets-bootstrap-p2p NETWORK=testnet
```

Then run:

```bash
make p2p-flow
```

Defaults used by the script:
- `NETWORK=testnet`
- `TOKEN_CONTRACT_ID=CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA`
- `ADMIN_ALIAS=admin`
- `CREATOR_ALIAS=creator`
- `FILLER_ALIAS=filler`
- `FIAT_CURRENCY_CODE=0` (`Usd`)
- `PAYMENT_METHOD_CODE=0` (`BankTransfer`)

You can override any of these:

```bash
NETWORK=testnet TOKEN_CONTRACT_ID=C... FIAT_CURRENCY_CODE=1 PAYMENT_METHOD_CODE=2 AMOUNT=10000000 make p2p-flow
```

Notes:
- Generated deployment artifacts are stored in `.artifacts/<network>/`.
- You can override `ESCROW_WASM_HASH`, `ESCROW_CONTRACT_ID`, `P2P_WASM_HASH`, and `P2P_CONTRACT_ID` directly from env.
- `MILESTONES_JSON` is optional for escrow; if omitted, one default `Pending` milestone is generated.
- The escrow payload builder serializes Soroban `i128` fields (for example `amount`, `receiver_memo`) as strings for CLI compatibility.


## Contracts Overview

This workspace currently contains two Soroban contract crates under `contracts/contracts/`:

- `escrow`: milestone-based Trustless Work escrow contract.
- `p2p`: peer-to-peer order contract for fiat/crypto swaps.

Build and test commands from the `contracts/` directory:

```bash
cargo build
cargo test
cargo test -p escrow
cargo test -p p2p
```


## P2P Contract

The `p2p` contract implements an order lifecycle inspired by the Solidity counterpart, with winner-based dispute resolution.

### Main lifecycle

`Created -> AwaitingFiller -> AwaitingPayment -> AwaitingConfirmation -> Completed`

Additional terminal/branch states:

- `Cancelled`
- `Disputed`
- `Refunded`

### Entrypoints

- `initialize`
- `pause` / `unpause`
- `create_order`
- `create_order_cli` (CLI-friendly numeric codes for fiat currency and payment method)
- `cancel_order`
- `take_order`
- `submit_fiat_payment`
- `execute_fiat_transfer_timeout`
- `confirm_fiat_payment`
- `dispute_fiat_payment`
- `resolve_dispute` (winner-based boolean: `fiat_transfer_confirmed`)
- `get_order`, `get_order_count`, `get_config`

### Test coverage

The `p2p` crate includes both happy-path and negative-path tests for:

- auth and role checks
- pause guards
- input validation
- timeout behavior
- dispute and resolution branches

Run only P2P tests:

```bash
cargo test -p p2p
```

Note: P2P now has Makefile automation in `contracts/contracts/p2p/Makefile`, and root forwarding targets in `contracts/Makefile`.



### Build contract

Once you have fully set up the contract in your local environment, installed all the necessary tools, and properly configured your user for the testnet, you will be ready to perform the initial deployment to the Testnet and run tests directly on the contract.

The first step is to compile the contract and generate the `.wasm` file, which can be done using the following command:

```bash
stellar contract build
```

### Install contract

Before deploying the contract, you must first install it. This means uploading a version of your code to the Stellar network, which you can later use for deployment.

When you execute the following command with the parameters specific to your local environment, it will return a hash. You will need to save this hash, as it will be required in the next step.

### macOS/Linux

```bash
stellar contract install \
   --network <network> \
   --source <source_account> \
   --wasm <path_to_wasm_file>
```

### Windows (PowerShell)

```bash
stellar contract install `
   --network <network> `
   --source <source_account> `
   --wasm <path_to_wasm_file>
```

Where:

- `<network>` is the name of the network you are working on (e.g., testnet).
- `<source_account>` is the account from which the installation will be made (you need to provide your own account).
- `<path_to_wasm_file>` is the path to the `.wasm` file generated when compiling the contract."

Response:

```
d36cd70c3b9c999e172ecc4648e616d9a49fd5dbbae8c28bef0b90bbb32fc762
```



### Deploy contract

Finally, to deploy the contract, you will need to use the output from the previous command as the input parameter for this command.

Once you execute this command, you will receive another hash, which will be the contract ID. With this ID, you can query platforms such as https://stellar.expert/explorer/testnet and continuously monitor the interactions made with the deployed contract.

### macOS/Linux

```bash
stellar contract deploy \
   --wasm-hash <wasm_hash> \
   --source <source_account> \
   --network <network>
```

### Windows (PowerShell)

```bash
stellar contract deploy `
   --wasm-hash <wasm_hash> `
   --source <source_account> `
   --network <network>
```

Where:

- `<wasm_hash>` is the hash of the `.wasm` file generated during the contract installation.
- `<source_account>` is the account from which the deployment will be made.
- `<network>` is the network you are working on (e.g., testnet).


## **Thanks to all the contributors who have made this project possible!**

[![Contributors](https://contrib.rocks/image?repo=Trustless-Work/Trustless-Work-Smart-Escrow)](https://github.com/Trustless-Work/Trustless-Work-Smart-Escrow/graphs/contributors)
