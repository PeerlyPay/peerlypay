# PeerlyPay 🌍💸

## Tagline

**"Earn Global, Spend Local - Trustless ramp for the borderless economy."**

## Overview

PeerlyPay is a decentralized P2P fiat-to-crypto marketplace that lets users trade USDC for local fiat (and vice versa) without relying on centralized exchanges. Orders are matched peer-to-peer, and funds are secured in non-custodial escrow until both parties confirm the off-chain payment.

We built PeerlyPay for **remote workers, freelancers, and digital nomads** in Latin America and other emerging markets who earn in crypto but need to pay rent, bills, and daily expenses in local currency. Today, cashing out often means KYC-heavy CEXs, high fees, or risky OTC deals with strangers.

PeerlyPay solves this by providing a **trustless ramp**: connect your wallet, create or take an order, lock funds in escrow, complete the fiat transfer (bank or MercadoPago), and release USDC on confirmation. No CEX account required—just your wallet and a counterparty.

## Features

- ✅ **P2P Marketplace** for USDC ↔ Fiat trades  
- ✅ **Non-custodial Escrow** (ready for smart contract integration)  
- ✅ **On-chain Reputation System** (ready for Unibase integration)  
- ✅ **Real-time Order Management**  
- ✅ **In-app Chat** for payment coordination  
- ✅ **Mobile-first responsive design**  
- ✅ **Multiple payment methods** (Bank Transfer, MercadoPago)  

## Tech Stack

### Frontend

- **Next.js 15** (App Router)  
- **TypeScript**  
- **Tailwind CSS v4**  
- **shadcn/ui** components  
- **Zustand** (state management)  
- **Sonner** (toast notifications)  

### Blockchain (Ready for integration)

- Escrow Smart Contracts (Solidity)  
- Unibase Identity & Memory (AIP 2.0)  
- ERC-8004 On-chain Identity  

## How It Works

1. **Connect Wallet** – Link your wallet to the app.  
2. **Create Buy/Sell order** – Set amount, rate, currency, and payment method.  
3. **Browse marketplace** – Filter by Buy USDC / Sell USDC and view open orders.  
4. **Accept order** → Funds locked in escrow.  
5. **Off-chain fiat transfer** – Buyer sends payment via bank or MercadoPago.  
6. **Seller confirms** → USDC released from escrow to buyer.  
7. **Reputation updated** on-chain (Unibase-ready).  

## Project Structure

```
peerlypay/
├── app/                    # Next.js pages
│   ├── page.tsx           # Dashboard
│   ├── orders/            # Marketplace & order details
│   ├── create-order/      # Order creation
│   └── my-orders/         # User's order history
├── components/            # React components
├── lib/                   # Utilities & state management
└── types/                 # TypeScript interfaces
```

## Getting Started

### Prerequisites

- Node.js 18+  
- npm or yarn  

### Installation

```bash
git clone [repo-url]
cd peerlypay
npm install
npm run dev
```

Open **http://localhost:3000**

## Future Roadmap

- [ ] Unibase integration for portable reputation  
- [ ] AI dispute resolution agent  
- [ ] Multi-currency support (USD, EUR, BRL)  
- [ ] Mobile app (React Native)  
- [ ] Integration with DeFi protocols  

## Screenshots

*Screenshots coming soon*

## Team

- **Alexis**  
- **Steven**  
- **Stefano**  
- **Barb**  

## License

MIT  

---

*Built with ❤️ for Stellar 2026*
