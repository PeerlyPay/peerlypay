# ARCHITECTURE.md

# PeerlyPay Architecture Documentation

## 1. Executive Summary

PeerlyPay is a decentralized, peer-to-peer fiat-to-crypto ramp designed for emerging markets. The platform enables users to trade USDC for local fiat currency (and vice versa) in a trust-minimized environment.

The system utilizes a hybrid blockchain architecture:

* **Settlement Layer:** **Stellar Soroban** (Rust) for high-speed, low-cost escrow management and payment settlement.
* **Arbitration Layer:** **Base** (EVM) utilizing the **Slice Protocol** for decentralized, jury-based dispute resolution.

---

## 2. System Overview

PeerlyPay functions as an orchestrator between the user interface, the Trustless Work escrow smart contracts, and the Slice arbitration protocol.

### High-Level Data Flow

1. **Order Creation:** Users initiate trades via the Next.js frontend.
2. **Escrow Deployment:** A unique Trustless Work escrow contract is spawned for each trade on Stellar Soroban.
3. **Fund Locking:** USDC is locked in the escrow contract.
4. **Dispute Trigger (Optional):** If a disagreement occurs, the escrow enters a "Disputed" state.
5. **Cross-Chain Arbitration:** The dispute is bridged to the Slice Protocol on Base.
6. **Resolution:** Jurors rule on the case, and the verdict is bridged back to Stellar to unlock funds.

---

## 3. Component Architecture

### 3.1 Frontend Layer

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Zustand, Shadcn UI.

* **Order Management:** Handles the creation, listing, and filtering of buy/sell orders.
* **Wallet Integration:** Manages connections to Stellar wallets (for payments) and EVM wallets (for dispute identity).
* **Communication:** Provides an encrypted chat interface for users to coordinate off-chain fiat transfers.
* **State Management:** Uses Zustand to manage user sessions, order states, and transaction flows locally.

### 3.2 Escrow Engine (Trustless Work)

**Tech Stack:** Rust (Stellar Soroban SDK).

The core logic resides in `contracts/contracts/escrow`, implementing the **Trustless Work** standard.

* **Factory Pattern:** The `EscrowContract` utilizes a factory method `tw_new_single_release_escrow` to deploy isolated contract instances for each engagement, ensuring fault isolation.
* **State Machine:** Managed by `EscrowManager`, transitioning through states: `Initialized` -> `Funded` -> `Released` OR `Disputed`.
* **Milestones:** Supports multi-step releases, though PeerlyPay primarily uses single-release flows.
* **Safety:** Implements `SafeMath` and `FeeCalculator` to prevent overflows and ensure accurate platform/juror fee deduction.

### 3.3 Dispute Resolution (Slice Protocol)

**Tech Stack:** Solidity (Base Mainnet), Cross-Chain Bridge.

When `dispute_escrow` is called on Stellar, the architecture pivots to a cross-chain flow:

1. **Stellar Proxy:** A specialized Soroban contract that acts as an interface between the Escrow and the external world. It emits `DisputeRequested` events containing the IPFS hash of evidence and the EVM addresses of the parties.
2. **Relayer Service:** An off-chain listener that observes Stellar events and calls `createDispute` on the Slice Protocol (Base).
3. **Slice Protocol (Arbitrator):** A decentralized court system where jurors stake assets to vote on disputes.
4. **Settlement:** Once a ruling is executed on Base, the Relayer invokes `resolve_dispute` on the Stellar Proxy, which instructs the Escrow contract to release funds to the winner.

---

## 4. Directory Structure Mapping

The architecture is mapped to the codebase as follows:

| Component | Path | Description |
| --- | --- | --- |
| **Frontend UI** | `app/` | Next.js pages for Orders, Profile, and Creation. |
| **UI Components** | `components/` | Reusable blocks like `OrderCard`, `ChatBox`, `EscrowStepper`. |
| **Escrow Core** | `contracts/contracts/escrow/src/core/` | Business logic for `escrow.rs`, `dispute.rs`, and `milestone.rs`. |
| **Validators** | `contracts/contracts/escrow/src/core/validators/` | Security checks for state transitions (e.g., `validate_dispute_flag_change_conditions`). |
| **Storage Types** | `contracts/contracts/escrow/src/storage/types.rs` | Data definitions for `Escrow`, `Roles`, and `Dispute` status. |
| **Events** | `contracts/contracts/escrow/src/events/` | Soroban events (`DisputeResolved`, `EscrowDisputed`) used by the Relayer. |

---

## 5. Security & Trust Assumptions

1. **Non-Custodial:** PeerlyPay never holds user funds. Funds are always held in the specific Soroban contract instance for that order.
2. **Trustless Work:** The platform cannot unilaterally move funds unless a dispute ruling is received from the Slice Protocol or both parties sign a release.
3. **Bridging Risk:** The integrity of the dispute resolution depends on the Relayer correctly transmitting the ruling from Base to Stellar. This risk is mitigated by allowing decentralized verification of the Relayer's actions against Base block headers.

---

*Document Version: 1.0*
*Last Updated: 2026-02-07*
