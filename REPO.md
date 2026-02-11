# Directory Structure
```
app/
  api/
    match-order/
      route.ts
  marketplace/
    MarketplaceContent.tsx
    page.tsx
  orders/
    [id]/
      ChatBox.tsx
      EscrowStepper.tsx
      OrderDetailClient.tsx
      page.tsx
    create/
      CreateOrderClient.tsx
      CreateOrderForm.tsx
      OrderTypeSelector.tsx
      page.tsx
    mine/
      page.tsx
    page.tsx
  pro/
    page.tsx
  profile/
    page.tsx
  quick-trade/
    page.tsx
  trade/
    confirm/
      page.tsx
    enable-usdc/
      page.tsx
    payment/
      page.tsx
    success/
      page.tsx
    waiting/
      page.tsx
    page.tsx
  favicon.ico
  globals.css
  layout.tsx
  page.tsx
  providers.tsx
components/
  BalanceCard.tsx
  BottomCTA.tsx
  BottomNav.tsx
  CompactEscrowStepper.tsx
  DepositModal.tsx
  EmptyState.tsx
  FadeIn.tsx
  FilterTabs.tsx
  Header.tsx
  HowItWorks.tsx
  LayoutShell.tsx
  MiniProgressBar.tsx
  OrderCard.tsx
  OrderCardSkeleton.tsx
  OrderDetailCard.tsx
  OrderHistoryCard.tsx
  QuickActions.tsx
  QuickTradeInput.tsx
  RecentActivity.tsx
  RoleSelection.tsx
  StatsCards.tsx
  WalletButton.tsx
  WalletConnection.tsx
  WalletModal.tsx
contexts/
  UserContext.tsx
contracts/
  contracts/
    p2p/
      src/
        core/
          validators/
            admin.rs
            dispute.rs
            order.rs
          admin.rs
          dispute.rs
          order.rs
        events/
          handler.rs
        storage/
          types.rs
        contract.rs
        error.rs
        lib.rs
      Cargo.toml
  Cargo.toml
  Makefile
  README.md
types/
  index.ts
  user.ts
AGENTS.md
package.json
README.md
```

# Files

## File: app/api/match-order/route.ts
````typescript
import { NextRequest, NextResponse } from 'next/server';
import { findBestMatch } from '@/lib/match-order';
import type { Order, MatchOrderInput } from '@/types';

/**
 * Mock order book — in production this comes from the Stellar ledger / database.
 * Using the same mock data as the Zustand store for consistency.
 */
const MOCK_ORDER_BOOK: Order[] = [
  {
    id: 'order_1',
    type: 'sell',
    amount: 100,
    rate: 950,
    currency: 'ARS',
    paymentMethod: 'Bank Transfer',
    paymentMethods: ['Bank Transfer', 'MercadoPago'],
    duration: '30 minutes',
    status: 'open',
    createdAt: new Date(),
    createdBy: 'GBXK...7RQP',
    displayName: 'CryptoMarta',
    isVerified: true,
    reputation_score: 47,
    completionRate: 98,
  },
  {
    id: 'order_2',
    type: 'sell',
    amount: 500,
    rate: 945,
    currency: 'ARS',
    paymentMethod: 'MercadoPago',
    paymentMethods: ['MercadoPago', 'Brubank'],
    duration: '15 minutes',
    status: 'open',
    createdAt: new Date(),
    createdBy: 'GCDE...4FGH',
    displayName: 'FastTrader_AR',
    isVerified: true,
    reputation_score: 124,
    completionRate: 99,
  },
  {
    id: 'order_3',
    type: 'sell',
    amount: 50,
    rate: 955,
    currency: 'ARS',
    paymentMethod: 'MercadoPago',
    duration: '1 hour',
    status: 'open',
    createdAt: new Date(),
    createdBy: 'GHIJ...8KLM',
    reputation_score: 3,
    completionRate: 85,
  },
  {
    id: 'order_4',
    type: 'buy',
    amount: 200,
    rate: 940,
    currency: 'ARS',
    paymentMethod: 'Bank Transfer',
    paymentMethods: ['Bank Transfer', 'Wise'],
    duration: '30 minutes',
    status: 'open',
    createdAt: new Date(),
    createdBy: 'GNOP...2QRS',
    displayName: 'PesoKing',
    isVerified: true,
    reputation_score: 89,
    completionRate: 97,
  },
  {
    id: 'order_5',
    type: 'buy',
    amount: 75,
    rate: 935,
    currency: 'ARS',
    paymentMethod: 'MercadoPago',
    duration: '30 minutes',
    status: 'open',
    createdAt: new Date(),
    createdBy: 'GTUV...6WXY',
    displayName: 'ArgenSwap',
    reputation_score: 56,
    completionRate: 94,
  },
];

export async function POST(request: NextRequest) {
  try {
    const body: MatchOrderInput = await request.json();

    if (!body.amount || body.amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    if (!['buy', 'sell'].includes(body.type)) {
      return NextResponse.json(
        { error: 'Type must be "buy" or "sell"' },
        { status: 400 }
      );
    }

    if (!body.userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 300));

    const result = findBestMatch(MOCK_ORDER_BOOK, body.amount, body.type, body.userId);

    if (!result) {
      return NextResponse.json(
        { error: 'No orders available for this amount' },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
````

## File: app/orders/[id]/page.tsx
````typescript
import OrderDetailClient from './OrderDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <OrderDetailClient orderId={resolvedParams.id} />;
}
````

## File: app/orders/create/OrderTypeSelector.tsx
````typescript
'use client';

import { Wallet, ArrowLeftRight } from 'lucide-react';

export interface OrderTypeSelectorProps {
  selected: 'buy' | 'sell';
  onSelect: (type: 'buy' | 'sell') => void;
}

const options: { type: 'buy' | 'sell'; label: string; Icon: typeof Wallet }[] = [
  { type: 'sell', label: 'Sell USDC', Icon: Wallet },
  { type: 'buy', label: 'Buy USDC', Icon: ArrowLeftRight },
];

export default function OrderTypeSelector({ selected, onSelect }: OrderTypeSelectorProps) {
  return (
    <div className="flex gap-6 border-b border-gray-200 mb-6">
      {options.map(({ type, label, Icon }) => {
        const isSelected = selected === type;
        return (
          <button
            key={type}
            type="button"
            onClick={() => onSelect(type)}
            className={`flex items-center gap-2 text-body pb-3 -mb-px transition-colors ${
              isSelected
                ? 'text-primary-600 font-semibold border-b-2 border-primary-500'
                : 'text-gray-500 font-medium hover:text-primary-500'
            }`}
          >
            <Icon className="w-5 h-5 shrink-0" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
````

## File: app/orders/create/page.tsx
````typescript
import { Suspense } from 'react';
import CreateOrderClient from './CreateOrderClient';

export default function CreateOrderPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-gray-500">Loading...</div>}>
      <CreateOrderClient />
    </Suspense>
  );
}
````

## File: app/trade/confirm/page.tsx
````typescript
'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import {
  ArrowLeft,
  Star,
  BadgeCheck,
  Clock,
  AlertTriangle,
  Banknote,
  Smartphone,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Mock: check if user wallet has USDC trustline.
 * Always returns false for now (user needs to enable).
 * Later: check Freighter wallet for USDC trustline on Stellar.
 */
async function checkUSDCTrustline(): Promise<boolean> {
  // Mock: simulate async check
  await new Promise((resolve) => setTimeout(resolve, 300));
  return false;
}

// Mock matched maker data
const MOCK_MAKER = {
  displayName: 'crypto_trader_ar',
  completionRate: 98,
  totalTrades: 247,
  isVerified: true,
  paymentMethods: ['Banco Galicia', 'Mercado Pago'],
  estimatedMinutes: 5,
};

// Mock trade constants
const MOCK_RATE = 1_485;
const FEE_RATE = 0.005;

function formatFiat(value: number): string {
  return value.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatFiatCompact(value: number): string {
  return value.toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatUsdc(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function ConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isChecking, setIsChecking] = useState(false);

  const amount = parseFloat(searchParams.get('amount') || '100');
  const rate = MOCK_RATE;
  const fiatAmount = amount * rate;
  const feeUsdc = amount * FEE_RATE;
  const feeArs = feeUsdc * rate;
  const totalAfterFee = fiatAmount - feeArs;

  const handleConfirm = useCallback(async () => {
    setIsChecking(true);
    const hasTrustline = await checkUSDCTrustline();
    setIsChecking(false);

    if (hasTrustline) {
      router.push(`/trade/payment?amount=${amount}`);
    } else {
      router.push(`/trade/enable-usdc?amount=${amount}`);
    }
  }, [router, amount]);

  return (
    <div className="flex flex-col min-h-[calc(100dvh-64px)] bg-white">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center justify-center size-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="size-5 text-gray-900" />
        </button>
        <h2 className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold text-gray-900">
          Confirmar Trade
        </h2>
      </div>

      <div className="flex-1 px-4 pb-4 space-y-4 overflow-y-auto">
        {/* Trade Summary Card */}
        <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-body-sm text-gray-500">Monto</span>
            <span className="font-[family-name:var(--font-jetbrains-mono)] text-base font-semibold text-gray-900 tabular-nums">
              {formatUsdc(amount)} USDC
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-body-sm text-gray-500">Recibirás</span>
            <span className="font-[family-name:var(--font-jetbrains-mono)] text-base font-semibold text-gray-900 tabular-nums">
              ~{formatFiatCompact(fiatAmount)} ARS
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-body-sm text-gray-500">Tasa de cambio</span>
            <span className="font-[family-name:var(--font-jetbrains-mono)] text-sm text-gray-900 tabular-nums">
              1 USDC = {formatFiatCompact(rate)} ARS
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-body-sm text-gray-500">Comisión (0.5%)</span>
            <span className="font-[family-name:var(--font-jetbrains-mono)] text-sm text-gray-400 tabular-nums">
              {formatUsdc(feeUsdc)} USDC
            </span>
          </div>
          <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
            <span className="text-body font-bold text-gray-900">Total después de comisión</span>
            <span className="font-[family-name:var(--font-jetbrains-mono)] text-xl font-bold text-gray-900 tabular-nums">
              {formatFiat(totalAfterFee)} ARS
            </span>
          </div>
        </div>

        {/* Matched Order Details */}
        <div className="bg-gray-50 rounded-2xl p-5">
          <p className="text-body-sm text-gray-500 mb-3">Trading con:</p>

          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="relative">
              <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600">
                <span className="text-white font-[family-name:var(--font-space-grotesk)] text-lg font-bold">
                  C
                </span>
              </div>
              {MOCK_MAKER.isVerified && (
                <BadgeCheck className="absolute -bottom-0.5 -right-0.5 size-5 fill-indigo-500 text-white" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <span className="font-[family-name:var(--font-space-grotesk)] text-base font-bold text-gray-900 truncate block">
                @{MOCK_MAKER.displayName}
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                <span className="text-body-sm text-gray-600">
                  {MOCK_MAKER.completionRate}% positivo
                </span>
                <span className="text-gray-300">|</span>
                <span className="text-body-sm text-gray-600">
                  {MOCK_MAKER.totalTrades} trades
                </span>
              </div>
            </div>
          </div>

          {/* Payment methods */}
          <div className="mt-4 flex flex-wrap gap-2">
            {MOCK_MAKER.paymentMethods.map((method) => (
              <div
                key={method}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg"
              >
                {method.includes('Mercado') ? (
                  <Smartphone className="size-3.5 text-indigo-500" />
                ) : (
                  <Banknote className="size-3.5 text-green-600" />
                )}
                <span className="text-body-sm font-medium text-gray-900">{method}</span>
              </div>
            ))}
          </div>

          {/* Estimated time */}
          <div className="flex items-center gap-2 mt-3 px-3 py-2.5 bg-white rounded-xl">
            <Clock className="size-4 text-gray-400" />
            <span className="text-body-sm text-gray-500">Tiempo estimado:</span>
            <span className="text-body-sm font-semibold text-gray-900">
              ~{MOCK_MAKER.estimatedMinutes} minutos
            </span>
          </div>
        </div>

        {/* Important Info Box */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="size-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <p className="text-body-sm font-medium text-amber-800">
                Tu USDC irá a escrow hasta que el vendedor confirme el pago
              </p>
              <p className="text-body-sm text-amber-700">
                Solo transfiere a la cuenta indicada
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Action Buttons */}
      <div className="p-4 pb-6 border-t border-gray-100 space-y-3">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isChecking}
          className={cn(
            'w-full h-14 rounded-2xl font-[family-name:var(--font-space-grotesk)] text-base font-bold text-white transition-all active:scale-[0.98]',
            isChecking
              ? 'bg-fuchsia-400 cursor-wait'
              : 'bg-gradient-to-r from-fuchsia-500 to-purple-600 shadow-lg shadow-fuchsia-500/25 hover:opacity-90'
          )}
        >
          {isChecking ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="size-5 animate-spin" />
              Verificando wallet...
            </span>
          ) : (
            'Confirmar Trade'
          )}
        </button>
        <button
          type="button"
          onClick={() => router.push('/trade')}
          className="w-full h-12 rounded-2xl font-[family-name:var(--font-space-grotesk)] text-base font-semibold text-gray-500 border border-gray-200 bg-white hover:bg-gray-50 transition-all active:scale-[0.98]"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

export default function TradeConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">Cargando...</div>
      }
    >
      <ConfirmContent />
    </Suspense>
  );
}
````

## File: app/trade/enable-usdc/page.tsx
````typescript
'use client';

import { useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  Shield,
  Loader2,
  ChevronDown,
  ArrowLeft,
  Info,
  Wallet,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';

// ============================================
// CANCEL MODAL
// ============================================

function CancelModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-120 bg-white rounded-t-3xl p-6 pb-8 animate-fadeIn">
        <div className="flex flex-col items-center text-center pt-2">
          <div className="flex items-center justify-center size-14 rounded-full bg-red-50 mb-4">
            <ArrowLeft className="size-7 text-red-500" />
          </div>
          <h3 className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold text-gray-900 mb-2">
            Cancelar este trade?
          </h3>
          <p className="text-body-sm text-gray-500 mb-6 max-w-[280px]">
            Volverás a la pantalla de trade y tendrás que empezar de nuevo.
          </p>

          <button
            type="button"
            onClick={onConfirm}
            className="w-full h-12 rounded-2xl font-[family-name:var(--font-space-grotesk)] text-base font-bold text-white bg-red-500 hover:bg-red-600 transition-colors active:scale-[0.98] mb-3"
          >
            Sí, cancelar trade
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full h-12 rounded-2xl font-[family-name:var(--font-space-grotesk)] text-base font-semibold text-gray-500 hover:bg-gray-50 transition-colors active:scale-[0.98]"
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// TRUSTLINE INFO ACCORDION
// ============================================

function TrustlineInfo() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-100 transition-colors"
      >
        <Info className="size-4 text-gray-400 shrink-0" />
        <span className="text-body-sm font-medium text-gray-600 flex-1">
          ¿Qué es un trustline?
        </span>
        <ChevronDown
          className={cn(
            'size-4 text-gray-400 transition-transform duration-200',
            expanded && 'rotate-180'
          )}
        />
      </button>

      <div
        className={cn(
          'overflow-hidden transition-all duration-300',
          expanded ? 'max-h-60' : 'max-h-0'
        )}
      >
        <div className="px-4 pb-4 space-y-2">
          <p className="text-body-sm text-gray-500">
            En la red Stellar, un <strong className="text-gray-700">trustline</strong> es
            un permiso que le das a tu wallet para recibir un token específico (como USDC).
          </p>
          <p className="text-body-sm text-gray-500">
            Es como abrir una cuenta en una moneda nueva. Solo se hace una vez y no tiene costo adicional.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <Shield className="size-3.5 text-emerald-500 shrink-0" />
            <span className="text-caption text-emerald-600 font-medium">
              100% seguro y reversible
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// ENABLE USDC CONTENT
// ============================================

function EnableUsdcContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useStore();

  const amount = searchParams.get('amount') || '0';
  const [isEnabling, setIsEnabling] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  const handleEnable = useCallback(async () => {
    setIsEnabling(true);

    // Mock: simulate trustline creation (2s delay)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Navigate to payment
    router.push(`/trade/payment?amount=${amount}`);
  }, [router, amount]);

  const handleCancel = useCallback(() => {
    setShowCancel(false);
    router.push('/trade');
  }, [router]);

  // Shorten wallet address for display
  const walletDisplay = user.walletAddress
    ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
    : null;

  return (
    <div className="flex flex-col min-h-dvh bg-white">
      {/* Header — Logo + Wallet */}
      <header className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <Image
            src="/x_icon_black.png"
            alt="PeerlyPay"
            width={28}
            height={28}
            className="shrink-0 object-contain h-7 w-7"
          />
          <span className="font-display font-bold text-xl">PeerlyPay</span>
        </div>

        {walletDisplay && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full">
            <Wallet className="size-3.5 text-gray-500" />
            <span className="font-mono text-xs text-gray-600">
              {walletDisplay}
            </span>
          </div>
        )}
      </header>

      {/* Main content — centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Icon */}
        <div className="relative mb-8">
          <div className="flex items-center justify-center size-28 rounded-full bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500 shadow-xl shadow-purple-500/20">
            <div className="flex items-center justify-center size-20 rounded-full bg-white/20 backdrop-blur-sm">
              <Shield className="size-10 text-white" strokeWidth={1.5} />
            </div>
          </div>
          {/* Subtle glow ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-fuchsia-500/20 to-indigo-500/20 blur-xl -z-10 scale-125" />
        </div>

        {/* Text */}
        <h1 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold text-gray-900 mb-3 text-center">
          Enable USDC
        </h1>
        <p className="text-body text-gray-500 text-center mb-2 max-w-[300px]">
          Allow your wallet to receive USDC for this trade.
        </p>
        <p className="text-body-sm text-gray-400 text-center max-w-[280px]">
          This is a one-time setup on Stellar network
        </p>
      </div>

      {/* Bottom section */}
      <div className="px-4 pb-6 space-y-4">
        {/* Trustline explainer */}
        <TrustlineInfo />

        {/* Enable button */}
        <button
          type="button"
          onClick={handleEnable}
          disabled={isEnabling}
          className={cn(
            'w-full h-14 rounded-2xl font-[family-name:var(--font-space-grotesk)] text-base font-bold text-white transition-all active:scale-[0.98]',
            isEnabling
              ? 'bg-fuchsia-400 cursor-wait'
              : 'bg-gradient-to-r from-fuchsia-500 to-purple-600 shadow-lg shadow-fuchsia-500/25 hover:opacity-90'
          )}
        >
          {isEnabling ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="size-5 animate-spin" />
              Enabling USDC...
            </span>
          ) : (
            'Enable USDC'
          )}
        </button>

        {/* Cancel link */}
        <button
          type="button"
          onClick={() => setShowCancel(true)}
          disabled={isEnabling}
          className={cn(
            'w-full flex items-center justify-center gap-1.5 h-10 font-[family-name:var(--font-space-grotesk)] text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors',
            isEnabling && 'opacity-40 pointer-events-none'
          )}
        >
          <ArrowLeft className="size-3.5" />
          Cancel trade
        </button>
      </div>

      {/* Cancel confirmation modal */}
      <CancelModal
        open={showCancel}
        onClose={() => setShowCancel(false)}
        onConfirm={handleCancel}
      />
    </div>
  );
}

// ============================================
// MAIN EXPORT
// ============================================

export default function EnableUsdcPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-dvh">
          <Loader2 className="size-6 animate-spin text-gray-400" />
        </div>
      }
    >
      <EnableUsdcContent />
    </Suspense>
  );
}
````

## File: app/trade/payment/page.tsx
````typescript
'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Copy,
  Check,
  Clock,
  AlertTriangle,
  Shield,
  MessageCircle,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock payment details
const MOCK_PAYMENT = {
  bank: 'Banco Galicia',
  accountHolder: 'Juan Pérez',
  cbu: '0000003100010123456789',
  maker: '@crypto_trader_ar',
};

const MOCK_RATE = 1_485;
const FEE_RATE = 0.005;
const TIMER_SECONDS = 15 * 60; // 15 minutes

function formatFiat(value: number): string {
  return value.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// ============================================
// CANCEL MODAL
// ============================================
function CancelModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative w-full max-w-120 bg-white rounded-t-3xl p-6 pb-8 animate-fadeIn">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 flex items-center justify-center size-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <X className="size-4 text-gray-500" />
        </button>

        <div className="flex flex-col items-center text-center pt-2">
          <div className="flex items-center justify-center size-14 rounded-full bg-red-50 mb-4">
            <AlertTriangle className="size-7 text-red-500" />
          </div>
          <h3 className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold text-gray-900 mb-2">
            Cancelar trade?
          </h3>
          <p className="text-body-sm text-gray-500 mb-6 max-w-[280px]">
            Tu USDC será devuelto del escrow. Esta acción no se puede deshacer.
          </p>

          <button
            type="button"
            onClick={onConfirm}
            className="w-full h-12 rounded-2xl font-[family-name:var(--font-space-grotesk)] text-base font-bold text-white bg-red-500 hover:bg-red-600 transition-colors active:scale-[0.98] mb-3"
          >
            Sí, cancelar trade
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full h-12 rounded-2xl font-[family-name:var(--font-space-grotesk)] text-base font-semibold text-gray-500 hover:bg-gray-50 transition-colors active:scale-[0.98]"
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// PAYMENT CONTENT
// ============================================
function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const amount = parseFloat(searchParams.get('amount') || '100');
  const fiatAmount = amount * MOCK_RATE;
  const feeArs = amount * FEE_RATE * MOCK_RATE;
  const totalToPay = fiatAmount - feeArs;

  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [copied, setCopied] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [expired, setExpired] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      setExpired(true);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  // Copy CBU
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(MOCK_PAYMENT.cbu);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for non-secure contexts
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  // Cancel trade
  const handleCancel = useCallback(() => {
    setShowCancel(false);
    router.push('/trade');
  }, [router]);

  const isLowTime = timeLeft < 5 * 60;
  const timerProgress = timeLeft / TIMER_SECONDS;

  // ============================================
  // EXPIRED STATE
  // ============================================
  if (expired) {
    return (
      <div className="flex flex-col min-h-dvh bg-white">
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="flex items-center justify-center size-20 rounded-full bg-red-50 mb-5">
            <Clock className="size-10 text-red-500" />
          </div>
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-gray-900 mb-2">
            Tiempo expirado
          </h2>
          <p className="text-body-sm text-gray-500 mb-8 max-w-[280px]">
            El tiempo para realizar el pago ha expirado. Tu USDC ha sido devuelto del escrow.
          </p>
          <button
            type="button"
            onClick={() => router.push('/trade')}
            className="w-full max-w-[280px] h-14 rounded-2xl font-[family-name:var(--font-space-grotesk)] text-base font-bold text-white bg-gradient-to-r from-fuchsia-500 to-purple-600 shadow-lg shadow-fuchsia-500/25 hover:opacity-90 transition-all active:scale-[0.98]"
          >
            Volver a Trade
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // MAIN PAYMENT SCREEN
  // ============================================
  return (
    <div className="flex flex-col min-h-dvh bg-white">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center justify-center size-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="size-5 text-gray-900" />
        </button>
        <h2 className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold text-gray-900">
          Realizar Pago
        </h2>
      </div>

      <div className="flex-1 px-4 pb-4 space-y-4 overflow-y-auto">
        {/* Progress Steps */}
        <div className="flex items-center gap-3 px-1">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center size-6 rounded-full bg-emerald-500">
              <Check className="size-3.5 text-white" strokeWidth={3} />
            </div>
            <span className="text-body-sm font-medium text-emerald-600">USDC en Escrow</span>
          </div>
          <div className="flex-1 h-px bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center size-6 rounded-full bg-amber-400">
              <span className="text-white text-xs font-bold">2</span>
            </div>
            <span className="text-body-sm font-semibold text-amber-600">Tu pago</span>
          </div>
          <div className="flex-1 h-px bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center size-6 rounded-full bg-gray-200">
              <span className="text-gray-400 text-xs font-bold">3</span>
            </div>
            <span className="text-body-sm text-gray-400">Listo</span>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className={cn(
          'rounded-2xl p-5 text-center',
          isLowTime ? 'bg-red-50' : 'bg-gray-50'
        )}>
          <div className="flex items-center justify-center gap-2 mb-1">
            <Clock className={cn('size-4', isLowTime ? 'text-red-500' : 'text-gray-400')} />
            <span className={cn(
              'text-body-sm font-medium',
              isLowTime ? 'text-red-500' : 'text-gray-500'
            )}>
              Tiempo restante
            </span>
          </div>
          <span className={cn(
            'font-[family-name:var(--font-jetbrains-mono)] text-4xl font-bold tabular-nums',
            isLowTime ? 'text-red-500' : 'text-gray-900'
          )}>
            {formatTimer(timeLeft)}
          </span>
          {/* Progress bar */}
          <div className="mt-3 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-1000 ease-linear',
                isLowTime ? 'bg-red-500' : 'bg-fuchsia-500'
              )}
              style={{ width: `${timerProgress * 100}%` }}
            />
          </div>
        </div>

        {/* Payment Details Card */}
        <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
          <p className="text-body-sm font-semibold text-gray-500 uppercase tracking-wider">
            Transferir a:
          </p>

          {/* Bank */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-gray-500">Banco</span>
              <span className="text-body-sm font-semibold text-gray-900">
                {MOCK_PAYMENT.bank}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-gray-500">Titular</span>
              <span className="text-body-sm font-semibold text-gray-900">
                {MOCK_PAYMENT.accountHolder}
              </span>
            </div>

            {/* CBU with copy */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-body-sm text-gray-500">CBU</span>
              <div className="flex items-center gap-2">
                <span className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-gray-900 tabular-nums">
                  {MOCK_PAYMENT.cbu}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className={cn(
                    'flex items-center justify-center size-8 rounded-lg transition-all active:scale-95',
                    copied
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-white text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  )}
                >
                  {copied ? (
                    <Check className="size-4" strokeWidth={2.5} />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Amount to transfer — prominent */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-body font-bold text-gray-900">Monto a transferir</span>
              <span className="font-[family-name:var(--font-jetbrains-mono)] text-2xl font-bold text-gray-900 tabular-nums">
                ${formatFiat(totalToPay)}
              </span>
            </div>
            <p className="text-caption text-gray-400 mt-1 text-right">ARS</p>
          </div>
        </div>

        {/* Important Instructions */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="size-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-body-sm font-semibold text-amber-800 mb-2">
                Instrucciones importantes:
              </p>
              <ul className="space-y-1.5">
                <li className="text-body-sm text-amber-700 flex items-start gap-2">
                  <span className="text-amber-400 shrink-0 mt-0.5">&#8226;</span>
                  Transferí exactamente <strong>${formatFiat(totalToPay)} ARS</strong>
                </li>
                <li className="text-body-sm text-amber-700 flex items-start gap-2">
                  <span className="text-amber-400 shrink-0 mt-0.5">&#8226;</span>
                  Usá: Mercado Pago o Banco Galicia
                </li>
                <li className="text-body-sm text-amber-700 flex items-start gap-2">
                  <span className="text-amber-400 shrink-0 mt-0.5">&#8226;</span>
                  NO incluyas ninguna referencia en el pago
                </li>
                <li className="text-body-sm text-amber-700 flex items-start gap-2">
                  <span className="text-amber-400 shrink-0 mt-0.5">&#8226;</span>
                  Guardá el comprobante
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Escrow protection */}
        <div className="flex items-center gap-2.5 px-4 py-3.5 bg-emerald-50 rounded-2xl">
          <Shield className="size-5 text-emerald-600 shrink-0" />
          <span className="text-body-sm font-medium text-emerald-700">
            Protegido por escrow en Stellar
          </span>
        </div>

        {/* Help section */}
        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            className="text-body-sm font-medium text-fuchsia-600 hover:text-fuchsia-700 transition-colors"
          >
            Problemas?
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 text-body-sm font-medium text-fuchsia-600 hover:text-fuchsia-700 transition-colors"
          >
            <MessageCircle className="size-4" />
            Chat con {MOCK_PAYMENT.maker}
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 pb-6 border-t border-gray-100 space-y-3">
        <button
          type="button"
          onClick={() => router.push(`/trade/waiting?amount=${amount}`)}
          className="w-full h-14 rounded-2xl font-[family-name:var(--font-space-grotesk)] text-base font-bold text-white bg-gradient-to-r from-fuchsia-500 to-purple-600 shadow-lg shadow-fuchsia-500/25 hover:opacity-90 transition-all active:scale-[0.98]"
        >
          Ya transferí
        </button>
        <button
          type="button"
          onClick={() => setShowCancel(true)}
          className="w-full h-10 font-[family-name:var(--font-space-grotesk)] text-sm font-semibold text-red-500 hover:text-red-600 transition-colors active:scale-[0.98]"
        >
          Cancelar trade
        </button>
      </div>

      {/* Cancel Modal */}
      <CancelModal
        open={showCancel}
        onClose={() => setShowCancel(false)}
        onConfirm={handleCancel}
      />
    </div>
  );
}

export default function TradePaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">Cargando...</div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
````

## File: app/trade/success/page.tsx
````typescript
'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  X,
  Copy,
  Check,
  Star,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock trade data
const MOCK_MAKER = 'crypto_trader_ar';
const MOCK_RATE = 1_485;
const FEE_RATE = 0.005;
const MOCK_TXN_ID = '#TXN123456';
const MOCK_DURATION = '2m 34s';

function formatFiat(value: number): string {
  return value.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatUsdc(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatFiatCompact(value: number): string {
  return value.toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

// ============================================
// CONFETTI
// ============================================
const CONFETTI_COLORS = [
  '#d946ef', '#a855f7', '#6366f1', '#8b5cf6',
  '#10b981', '#f59e0b', '#ec4899', '#84cc16',
];

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 6 + Math.random() * 6,
        duration: 2.5 + Math.random() * 2,
        delay: Math.random() * 0.8,
        shape: Math.random() > 0.5 ? 'circle' : 'rect',
      })),
    []
  );

  return (
    <div className="fixed inset-0 z-[70] pointer-events-none overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti"
          style={{
            left: `${p.left}%`,
            top: '-10px',
            '--confetti-duration': `${p.duration}s`,
            '--confetti-delay': `${p.delay}s`,
            width: p.shape === 'circle' ? p.size : p.size * 0.6,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.shape === 'circle' ? '50%' : '2px',
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

// ============================================
// STAR RATING
// ============================================
function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
          className="transition-transform active:scale-90 hover:scale-110 p-0.5"
        >
          <Star
            className={cn(
              'size-8 transition-colors',
              (hover || value) >= star
                ? 'fill-amber-400 text-amber-400'
                : 'fill-transparent text-gray-300'
            )}
          />
        </button>
      ))}
    </div>
  );
}

// ============================================
// SUCCESS CONTENT
// ============================================
function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const amount = parseFloat(searchParams.get('amount') || '0.11');
  const fiatAmount = amount * MOCK_RATE;
  const feeArs = amount * FEE_RATE * MOCK_RATE;
  const totalPaid = fiatAmount - feeArs;

  const [showConfetti, setShowConfetti] = useState(true);
  const [rating, setRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  const timestamp = useMemo(() => {
    return new Date().toLocaleString('es-AR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }, []);

  // Trigger mount animation
  useEffect(() => {
    const timeout = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timeout);
  }, []);

  // Hide confetti after animation completes
  useEffect(() => {
    const timeout = setTimeout(() => setShowConfetti(false), 4500);
    return () => clearTimeout(timeout);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(MOCK_TXN_ID);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmitRating = () => {
    if (rating > 0) {
      setRatingSubmitted(true);
    }
  };

  return (
    <div className="flex flex-col min-h-dvh bg-white">
      {showConfetti && <Confetti />}

      {/* Close button */}
      <div className="flex items-center justify-end px-4 pt-4 pb-0">
        <button
          type="button"
          onClick={() => router.push('/quick-trade')}
          className="flex items-center justify-center size-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <X className="size-5 text-gray-500" />
        </button>
      </div>

      <div className="flex-1 px-4 pb-4 overflow-y-auto">
        {/* Success Hero */}
        <div className="flex flex-col items-center text-center pt-4 pb-6">
          {/* Animated checkmark */}
          <div
            className={cn(
              'flex items-center justify-center size-24 rounded-full bg-emerald-50 mb-5',
              mounted ? 'animate-scaleIn' : 'opacity-0'
            )}
          >
            <div className="flex items-center justify-center size-16 rounded-full bg-emerald-500">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path
                  d="M9 16.5L14 21.5L23 11.5"
                  stroke="white"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="48"
                  strokeDashoffset="48"
                  className="animate-checkDraw"
                />
              </svg>
            </div>
          </div>

          <h2
            className={cn(
              'font-[family-name:var(--font-space-grotesk)] text-2xl font-bold text-gray-900 mb-2 transition-all duration-500',
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            )}
            style={{ transitionDelay: '0.3s' }}
          >
            Trade Completado!
          </h2>
          <p
            className={cn(
              'text-body text-gray-500 transition-all duration-500',
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            )}
            style={{ transitionDelay: '0.45s' }}
          >
            Tu USDC ha sido liberado
          </p>
        </div>

        <div className="space-y-4">
          {/* Transaction Summary */}
          <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
            {/* Amount received — prominent */}
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-gray-500">Recibiste</span>
              <span className="font-[family-name:var(--font-jetbrains-mono)] text-xl font-bold text-emerald-600 tabular-nums">
                {formatUsdc(amount)} USDC
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-gray-500">Pagaste</span>
              <span className="font-[family-name:var(--font-jetbrains-mono)] text-sm font-semibold text-gray-900 tabular-nums">
                ${formatFiat(totalPaid)} ARS
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-gray-500">Tasa</span>
              <span className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-gray-900 tabular-nums">
                1 USDC = {formatFiatCompact(MOCK_RATE)} ARS
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-gray-500">Tiempo</span>
              <span className="text-body-sm font-semibold text-gray-900">
                {MOCK_DURATION}
              </span>
            </div>

            <div className="border-t border-gray-200 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-body-sm text-gray-500">ID</span>
                <div className="flex items-center gap-2">
                  <span className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-gray-400 tabular-nums">
                    {MOCK_TXN_ID}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className={cn(
                      'flex items-center justify-center size-7 rounded-md transition-all active:scale-95',
                      copied
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-white text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                    )}
                  >
                    {copied ? (
                      <Check className="size-3.5" strokeWidth={2.5} />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </button>
                </div>
              </div>
              <p className="text-caption text-gray-400 mt-2 text-right">{timestamp}</p>
            </div>
          </div>

          {/* Wallet info */}
          <div className="flex items-center gap-2.5 px-4 py-3.5 bg-emerald-50 rounded-2xl">
            <Wallet className="size-5 text-emerald-600 shrink-0" />
            <span className="text-body-sm font-medium text-emerald-700">
              Tu USDC ya está disponible en tu wallet
            </span>
          </div>

          {/* Market Maker Rating */}
          <div className="bg-gray-50 rounded-2xl p-5">
            {ratingSubmitted ? (
              <div className="flex flex-col items-center text-center py-2">
                <div className="flex items-center justify-center size-10 rounded-full bg-emerald-100 mb-2">
                  <Check className="size-5 text-emerald-600" strokeWidth={2.5} />
                </div>
                <p className="text-body-sm font-semibold text-gray-900">
                  Gracias por tu calificación!
                </p>
                <p className="text-caption text-gray-400 mt-0.5">
                  Tu feedback ayuda a la comunidad
                </p>
              </div>
            ) : (
              <>
                <p className="text-body-sm text-gray-500 text-center mb-3">
                  Como fue tu experiencia con <strong className="text-gray-900">@{MOCK_MAKER}</strong>?
                </p>
                <div className="flex justify-center mb-4">
                  <StarRating value={rating} onChange={setRating} />
                </div>
                {rating > 0 && (
                  <button
                    type="button"
                    onClick={handleSubmitRating}
                    className="w-full h-10 rounded-xl font-[family-name:var(--font-space-grotesk)] text-sm font-semibold text-fuchsia-600 bg-fuchsia-50 hover:bg-fuchsia-100 transition-colors active:scale-[0.98]"
                  >
                    Enviar calificación
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 pb-6 border-t border-gray-100 space-y-3">
        <button
          type="button"
          onClick={() => router.push('/trade')}
          className="w-full h-14 rounded-2xl font-[family-name:var(--font-space-grotesk)] text-base font-bold text-white bg-gradient-to-r from-fuchsia-500 to-purple-600 shadow-lg shadow-fuchsia-500/25 hover:opacity-90 transition-all active:scale-[0.98]"
        >
          Hacer otro trade
        </button>
        <button
          type="button"
          onClick={() => router.push('/orders')}
          className="w-full h-12 rounded-2xl font-[family-name:var(--font-space-grotesk)] text-base font-semibold text-gray-500 border border-gray-200 bg-white hover:bg-gray-50 transition-all active:scale-[0.98]"
        >
          Ver mis órdenes
        </button>
        <button
          type="button"
          onClick={() => router.push('/quick-trade')}
          className="w-full h-10 font-[family-name:var(--font-space-grotesk)] text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}

export default function TradeSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">Cargando...</div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
````

## File: app/trade/waiting/page.tsx
````typescript
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Check,
  Loader2,
  MessageCircle,
  AlertTriangle,
  Shield,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock trade data
const MOCK_MAKER = 'crypto_trader_ar';
const MOCK_RATE = 1_485;
const FEE_RATE = 0.005;
const MOCK_TXN_ID = '#TXN123456';

/** Demo: auto-confirm after this many seconds */
const MOCK_CONFIRM_DELAY_S = 10;

/** Show "taking too long" after this many seconds */
const SLOW_THRESHOLD_S = 30;

function formatFiat(value: number): string {
  return value.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatUsdc(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatFiatCompact(value: number): string {
  return value.toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

// ============================================
// WAITING CONTENT
// ============================================
function WaitingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const amount = parseFloat(searchParams.get('amount') || '0.11');
  const fiatAmount = amount * MOCK_RATE;
  const feeArs = amount * FEE_RATE * MOCK_RATE;
  const totalPaid = fiatAmount - feeArs;

  const [elapsed, setElapsed] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const isSlow = elapsed >= SLOW_THRESHOLD_S;

  // Elapsed timer + mock polling
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Mock "poll" every 5 seconds — flash the checking indicator
  useEffect(() => {
    if (elapsed > 0 && elapsed % 5 === 0) {
      setIsChecking(true);
      const timeout = setTimeout(() => setIsChecking(false), 800);
      return () => clearTimeout(timeout);
    }
  }, [elapsed]);

  // Mock auto-confirm after MOCK_CONFIRM_DELAY_S seconds
  useEffect(() => {
    if (elapsed >= MOCK_CONFIRM_DELAY_S) {
      router.push(`/trade/success?amount=${amount}`);
    }
  }, [elapsed, amount, router]);

  return (
    <div className="flex flex-col min-h-dvh bg-white">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-full bg-gray-100 opacity-40 cursor-not-allowed">
          <span className="text-gray-400 text-sm">&larr;</span>
        </div>
        <h2 className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold text-gray-900">
          Esperando Confirmación
        </h2>
      </div>

      <div className="flex-1 px-4 pb-4 space-y-5 overflow-y-auto">
        {/* Progress Steps */}
        <div className="flex items-center gap-3 px-1">
          {/* Step 1: Escrow */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center justify-center size-6 rounded-full bg-emerald-500">
              <Check className="size-3.5 text-white" strokeWidth={3} />
            </div>
            <span className="text-caption font-medium text-emerald-600">Escrow</span>
          </div>
          <div className="flex-1 h-px bg-emerald-300" />

          {/* Step 2: Pago */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center justify-center size-6 rounded-full bg-emerald-500">
              <Check className="size-3.5 text-white" strokeWidth={3} />
            </div>
            <span className="text-caption font-medium text-emerald-600">Pago</span>
          </div>
          <div className="flex-1 h-px bg-gray-200" />

          {/* Step 3: Confirmación (current) */}
          <div className="flex items-center gap-1.5">
            <div className="relative flex items-center justify-center size-6 rounded-full bg-fuchsia-500">
              <span className="text-white text-xs font-bold">3</span>
              <span className="absolute inset-0 rounded-full bg-fuchsia-500 animate-ping opacity-30" />
            </div>
            <span className="text-caption font-semibold text-fuchsia-600">Confirmar</span>
          </div>
        </div>

        {/* Central Status */}
        <div className="flex flex-col items-center text-center pt-6 pb-4">
          {/* Animated spinner ring */}
          <div className="relative flex items-center justify-center size-24 mb-5">
            {/* Outer pulsing ring */}
            <div className="absolute inset-0 rounded-full bg-fuchsia-100 animate-pulse" />
            {/* Spinning arc */}
            <svg className="absolute inset-0 size-24 animate-spin" style={{ animationDuration: '3s' }} viewBox="0 0 96 96">
              <circle
                cx="48" cy="48" r="42"
                fill="none"
                stroke="#d946ef"
                strokeWidth="3"
                strokeDasharray="180 264"
                strokeLinecap="round"
              />
            </svg>
            {/* Inner icon */}
            <div className="relative z-10 flex items-center justify-center size-16 rounded-full bg-white shadow-sm">
              <Shield className="size-8 text-fuchsia-500" />
            </div>
          </div>

          <h3 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-gray-900 mb-1.5">
            Esperando confirmación
          </h3>
          <p className="text-body-sm text-gray-500 mb-1">
            @{MOCK_MAKER} está verificando tu pago
          </p>
          <p className="text-caption text-gray-400">
            Generalmente toma ~3 minutos
          </p>

          {/* Polling indicator */}
          <div className={cn(
            'mt-4 flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300',
            isChecking
              ? 'bg-fuchsia-50 text-fuchsia-600'
              : 'bg-gray-50 text-gray-400'
          )}>
            <Loader2 className={cn(
              'size-3.5',
              isChecking ? 'animate-spin' : ''
            )} />
            <span className="text-caption font-medium">
              {isChecking ? 'Verificando...' : 'Escuchando actualizaciones'}
            </span>
          </div>
        </div>

        {/* Trade Details (collapsible) */}
        <div className="bg-gray-50 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setDetailsOpen((prev) => !prev)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-100 transition-colors"
          >
            <span className="text-body-sm font-semibold text-gray-900">
              Detalles del trade
            </span>
            {detailsOpen ? (
              <ChevronUp className="size-4 text-gray-400" />
            ) : (
              <ChevronDown className="size-4 text-gray-400" />
            )}
          </button>

          {detailsOpen && (
            <div className="px-5 pb-5 space-y-3 border-t border-gray-100 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-body-sm text-gray-500">Monto</span>
                <span className="font-[family-name:var(--font-jetbrains-mono)] text-sm font-semibold text-gray-900 tabular-nums">
                  {formatUsdc(amount)} USDC
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body-sm text-gray-500">Enviaste</span>
                <span className="font-[family-name:var(--font-jetbrains-mono)] text-sm font-semibold text-gray-900 tabular-nums">
                  ${formatFiat(totalPaid)} ARS
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body-sm text-gray-500">Tasa</span>
                <span className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-gray-900 tabular-nums">
                  1 USDC = {formatFiatCompact(MOCK_RATE)} ARS
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body-sm text-gray-500">ID</span>
                <span className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-gray-400 tabular-nums">
                  {MOCK_TXN_ID}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="bg-gray-50 rounded-2xl p-5">
          <p className="text-body-sm font-semibold text-gray-900 mb-4">
            Progreso
          </p>
          <div className="space-y-0">
            {/* Step 1 - completed */}
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center size-7 rounded-full bg-emerald-500">
                  <Check className="size-4 text-white" strokeWidth={3} />
                </div>
                <div className="w-px h-6 bg-emerald-300" />
              </div>
              <div className="pb-5 pt-0.5">
                <p className="text-body-sm font-medium text-emerald-700">
                  Tu pago fue marcado como enviado
                </p>
                <p className="text-caption text-gray-400 mt-0.5">Completado</p>
              </div>
            </div>

            {/* Step 2 - in progress */}
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="relative flex items-center justify-center size-7 rounded-full bg-fuchsia-100">
                  <Loader2 className="size-4 text-fuchsia-500 animate-spin" />
                </div>
                <div className="w-px h-6 bg-gray-200" />
              </div>
              <div className="pb-5 pt-0.5">
                <p className="text-body-sm font-semibold text-fuchsia-700">
                  El vendedor está verificando el pago
                </p>
                <p className="text-caption text-fuchsia-400 mt-0.5">En progreso...</p>
              </div>
            </div>

            {/* Step 3 - pending */}
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center size-7 rounded-full bg-gray-200">
                  <div className="size-2.5 rounded-full bg-gray-400" />
                </div>
              </div>
              <div className="pt-0.5">
                <p className="text-body-sm text-gray-400">
                  Tu USDC será liberado del escrow
                </p>
                <p className="text-caption text-gray-300 mt-0.5">Pendiente</p>
              </div>
            </div>
          </div>
        </div>

        {/* Escrow protection */}
        <div className="flex items-center gap-2.5 px-4 py-3.5 bg-emerald-50 rounded-2xl">
          <Shield className="size-5 text-emerald-600 shrink-0" />
          <span className="text-body-sm font-medium text-emerald-700">
            Protegido por escrow en Stellar
          </span>
        </div>

        {/* Slow / timeout warning */}
        {isSlow && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="size-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-body-sm font-semibold text-amber-800 mb-1">
                  Tomando demasiado tiempo?
                </p>
                <p className="text-body-sm text-amber-700 mb-3">
                  Si el vendedor no confirma en los próximos minutos, podés abrir una disputa.
                </p>
                <button
                  type="button"
                  onClick={() => router.push('/trade/dispute')}
                  className="px-4 py-2 rounded-xl text-body-sm font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 transition-colors active:scale-[0.98]"
                >
                  Abrir disputa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="p-4 pb-6 border-t border-gray-100 space-y-3">
        <button
          type="button"
          className="w-full h-12 rounded-2xl font-[family-name:var(--font-space-grotesk)] text-base font-semibold text-fuchsia-600 border border-fuchsia-200 bg-white hover:bg-fuchsia-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <MessageCircle className="size-4" />
          Chat con @{MOCK_MAKER}
        </button>
        <button
          type="button"
          className="w-full h-10 font-[family-name:var(--font-space-grotesk)] text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
        >
          Reportar problema
        </button>
      </div>
    </div>
  );
}

export default function TradeWaitingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">Cargando...</div>
      }
    >
      <WaitingContent />
    </Suspense>
  );
}
````

## File: app/trade/page.tsx
````typescript
'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import QuickTradeInput from '@/components/QuickTradeInput';

export default function TradePage() {
  const router = useRouter();
  const { user, loading } = useUser();

  // Protección: solo freelancers
  if (!loading && (!user || user.role !== 'FREELANCER')) {
    router.push('/');
    return null;
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20">Cargando...</div>;
  }

  return <QuickTradeInput />;
}
````

## File: app/providers.tsx
````typescript
"use client";

import {
  CrossmintProvider,
  CrossmintAuthProvider,
  CrossmintWalletProvider,
} from "@crossmint/client-sdk-react-ui";

const apiKey = process.env.NEXT_PUBLIC_CROSSMINT_API_KEY!;

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CrossmintProvider apiKey={apiKey}>
      <CrossmintAuthProvider>
        <CrossmintWalletProvider
          createOnLogin={{
            chain: "stellar",
            signer: {
              type: "email",
            },
          }}
        >
          {children}
        </CrossmintWalletProvider>
      </CrossmintAuthProvider>
    </CrossmintProvider>
  );
}
````

## File: components/CompactEscrowStepper.tsx
````typescript
'use client';

import { useState, useCallback } from 'react';
import {
  Wallet,
  Clock,
  DollarSign,
  CheckCircle,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SubStep {
  label: string;
  isActive: boolean;
  isComplete: boolean;
}

interface CompactEscrowStepperProps {
  /** 0 = Setup, 1 = Deposit, 2 = Payment, 3 = Confirm, 4 = Complete */
  currentStep: number;
  /** Countdown seconds until next step (null = no countdown) */
  countdown?: number | null;
  /** Whether the step is currently updating */
  isUpdating?: boolean;
  /** Start expanded (default: false = collapsed) */
  defaultExpanded?: boolean;
  /** Current sub-step info for granular progress */
  subStep?: SubStep | null;
}

const steps = [
  {
    id: 0,
    title: 'Setup',
    description: 'Activate USDC Trustline',
    icon: Wallet,
  },
  {
    id: 1,
    title: 'Deposit',
    description: 'Funds locked in escrow',
    icon: Clock,
  },
  {
    id: 2,
    title: 'Payment',
    description: 'Buyer sends fiat',
    icon: DollarSign,
  },
  {
    id: 3,
    title: 'Confirm',
    description: 'Seller confirms receipt',
    icon: CheckCircle,
  },
  {
    id: 4,
    title: 'Complete',
    description: 'USDC released',
    icon: Check,
  },
];

export function CompactEscrowStepper({
  currentStep,
  countdown = null,
  isUpdating = false,
  defaultExpanded = false,
  subStep = null,
}: CompactEscrowStepperProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const currentStepData = steps[currentStep] || steps[0];
  const CurrentIcon = currentStepData.icon;
  const completedSteps = currentStep;
  const totalSteps = steps.length;

  // Progress percentage for the mini bar
  const progressPercent = (completedSteps / (totalSteps - 1)) * 100;

  return (
    <div className="bg-white border-b border-gray-200 overflow-hidden">
      {/* Collapsed State - ~60px compact bar */}
      <button
        type="button"
        onClick={toggleExpanded}
        className={cn(
          'w-full transition-all duration-300 ease-out relative',
          isExpanded ? 'h-0 opacity-0 pointer-events-none' : 'h-[72px] opacity-100'
        )}
        aria-expanded={isExpanded}
        aria-label={`Step ${currentStep + 1} of ${totalSteps}: ${currentStepData.title}. Tap to ${isExpanded ? 'collapse' : 'expand'} details`}
      >
        <div className="max-w-[480px] mx-auto px-4 h-full flex items-center gap-3">
          {/* Current step icon */}
          <div className="relative flex-shrink-0">
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                currentStep === 4
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-500)] text-white'
              )}
            >
              {subStep?.isActive ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CurrentIcon className="w-5 h-5" />
              )}
            </div>
            {/* Pulse ring for active step */}
            {currentStep < 4 && !subStep?.isActive && (
              <div className="absolute inset-0 rounded-full animate-ping bg-[var(--color-primary-500)]/30" />
            )}
          </div>

          {/* Step info */}
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-gray-900 truncate">
                {currentStepData.title}
              </span>
              <span className="text-xs text-gray-400 font-mono">
                {currentStep + 1}/{totalSteps}
              </span>
            </div>

            {/* Sub-step indicator */}
            {subStep ? (
              <div className="flex items-center gap-1.5 mt-0.5">
                <Loader2 className="w-3 h-3 text-[var(--color-primary-500)] animate-spin" />
                <span className="text-xs text-[var(--color-primary-600)] font-medium truncate">
                  {subStep.label}
                </span>
              </div>
            ) : (
              <p className="text-xs text-gray-500 truncate">
                {currentStepData.description}
              </p>
            )}
          </div>

          {/* Timer - Always visible */}
          {countdown !== null && countdown > 0 && currentStep < 4 && (
            <div className="flex-shrink-0 text-right">
              <div className="text-lg font-bold text-[var(--color-primary-600)] font-mono tabular-nums">
                {countdown}s
              </div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wide">
                next step
              </div>
            </div>
          )}

          {/* Expand indicator */}
          <ChevronDown
            className="w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200"
            aria-hidden="true"
          />
        </div>

        {/* Mini progress bar at bottom of collapsed state */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
          <div
            className="h-full bg-gradient-to-r from-[var(--color-primary-500)] to-emerald-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </button>

      {/* Expanded State - Full step list */}
      <div
        className={cn(
          'transition-all duration-300 ease-out overflow-hidden',
          isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="max-w-[480px] mx-auto px-4 py-4">
          {/* Header with collapse button and timer */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={toggleExpanded}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Collapse step details"
            >
              <ChevronUp className="w-4 h-4" />
              <span className="font-medium">Escrow Progress</span>
            </button>

            {/* Timer in expanded view */}
            {countdown !== null && countdown > 0 && currentStep < 4 && (
              <div className="flex items-center gap-2 bg-[var(--color-primary-50)] rounded-full px-3 py-1.5">
                <div className="w-2 h-2 rounded-full bg-[var(--color-primary-500)] animate-pulse" />
                <span className="text-sm font-bold text-[var(--color-primary-600)] font-mono tabular-nums">
                  {countdown}s
                </span>
                <span className="text-xs text-[var(--color-primary-500)]">
                  next step
                </span>
              </div>
            )}

            {isUpdating && (
              <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5">
                <Loader2 className="w-4 h-4 text-[var(--color-primary-500)] animate-spin" />
                <span className="text-xs text-gray-600">Updating...</span>
              </div>
            )}
          </div>

          {/* Vertical step list */}
          <div className="space-y-0">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = step.id < currentStep;
              const isCurrent = step.id === currentStep;
              const isPending = step.id > currentStep;

              return (
                <div key={step.id} className="relative">
                  <div className="flex items-start gap-3">
                    {/* Icon circle */}
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300',
                        isCompleted && 'bg-emerald-500 text-white',
                        isCurrent &&
                          'bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-500)] text-white ring-4 ring-[var(--color-primary-100)]',
                        isPending && 'bg-gray-100 text-gray-400'
                      )}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : isCurrent && subStep?.isActive ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-5">
                      <div
                        className={cn(
                          'font-semibold text-sm transition-colors duration-300',
                          isCompleted && 'text-emerald-600',
                          isCurrent && 'text-[var(--color-primary-600)]',
                          isPending && 'text-gray-400'
                        )}
                      >
                        {step.title}
                      </div>
                      <div
                        className={cn(
                          'text-xs mt-0.5 transition-colors duration-300',
                          isCurrent ? 'text-gray-700' : 'text-gray-500'
                        )}
                      >
                        {step.description}
                      </div>

                      {/* Sub-step detail for current step */}
                      {isCurrent && subStep && (
                        <div className="mt-2 flex items-center gap-2 bg-[var(--color-primary-50)] rounded-lg px-3 py-2 animate-in fade-in slide-in-from-left-2 duration-200">
                          <Loader2 className="w-3.5 h-3.5 text-[var(--color-primary-500)] animate-spin flex-shrink-0" />
                          <span className="text-xs font-medium text-[var(--color-primary-700)]">
                            {subStep.label}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Status indicator */}
                    {isCurrent && !subStep && (
                      <div className="flex-shrink-0">
                        <div className="px-2 py-1 bg-[var(--color-primary-100)] text-[var(--color-primary-700)] text-xs font-medium rounded-full animate-pulse">
                          In progress
                        </div>
                      </div>
                    )}

                    {isCurrent && subStep && (
                      <div className="flex-shrink-0">
                        <div className="px-2 py-1 bg-[var(--color-secondary-100)] text-[var(--color-secondary-700)] text-xs font-medium rounded-full">
                          Processing
                        </div>
                      </div>
                    )}

                    {isCompleted && (
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-emerald-600" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Connecting line */}
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        'absolute left-5 top-10 w-0.5 transition-all duration-300',
                        step.id < currentStep ? 'bg-emerald-500' : 'bg-gray-200',
                        isCurrent && subStep ? 'h-12' : 'h-5'
                      )}
                      style={{ transform: 'translateX(-50%)' }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompactEscrowStepper;
````

## File: components/DepositModal.tsx
````typescript
'use client';

import { useState } from 'react';
import { X, Copy, Check, AlertTriangle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
}

export default function DepositModal({
  isOpen,
  onClose,
  walletAddress,
}: DepositModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Full address for QR and copy (in production this would be the full Stellar address)
  const fullAddress = walletAddress || 'GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOUJ3NBNE5P4XXXY';

  // Truncated for display
  const truncatedAddress = fullAddress.length > 16
    ? `${fullAddress.slice(0, 8)}...${fullAddress.slice(-8)}`
    : fullAddress;

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(fullAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-[480px] bg-white rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 font-[family-name:var(--font-space-grotesk)]">
            Deposit USDC
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6">
          {/* Instruction */}
          <p className="text-center text-gray-600">
            Send USDC to this address
          </p>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
              <QRCodeSVG
                value={fullAddress}
                size={180}
                level="M"
                includeMargin={false}
                className="rounded-lg"
              />
            </div>
          </div>

          {/* Address with copy button */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
              Your wallet address
            </p>
            <div className="flex items-center justify-between gap-3">
              <code className="text-sm font-mono text-gray-900 break-all">
                {truncatedAddress}
              </code>
              <button
                type="button"
                onClick={handleCopyAddress}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  copied
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Warning box */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-800 mb-2">Important</p>
                <ul className="text-sm text-amber-700 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500">•</span>
                    Only send USDC on Stellar network
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500">•</span>
                    Sending other tokens will result in permanent loss
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500">•</span>
                    Minimum deposit: 1 USDC
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Done button */}
          <Button
            onClick={onClose}
            className="w-full h-12 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-semibold transition-colors"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
````

## File: components/FadeIn.tsx
````typescript
import { type ReactNode } from 'react';

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export default function FadeIn({ children, delay, className = '' }: FadeInProps) {
  return (
    <div
      className={`animate-fadeIn ${className}`.trim()}
      style={delay != null ? { animationDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}
````

## File: components/FilterTabs.tsx
````typescript
export type FilterStatus = 'all' | 'active' | 'completed' | 'disputed' | 'cancelled';

interface FilterTabsProps {
  selected: FilterStatus;
  counts?: {
    all: number;
    active: number;
    completed: number;
    disputed: number;
    cancelled: number;
  };
  onChange: (status: FilterStatus) => void;
}

const tabs: { status: FilterStatus; label: string }[] = [
  { status: 'all', label: 'All' },
  { status: 'active', label: 'Active' },
  { status: 'completed', label: 'Completed' },
  { status: 'disputed', label: 'Disputed' },
  { status: 'cancelled', label: 'Cancelled' },
];

export default function FilterTabs({ selected, counts, onChange }: FilterTabsProps) {
  return (
    <div className="flex gap-4 border-b border-gray-200 overflow-x-auto scrollbar-hide">
      {tabs.map(({ status, label }) => {
        const isActive = selected === status;
        const count = counts?.[status];

        return (
          <button
            key={status}
            type="button"
            onClick={() => onChange(status)}
            className={`flex items-center shrink-0 pb-3 px-2 -mb-px text-sm transition-all duration-200 ${
              isActive
                ? 'text-primary-600 font-semibold border-b-2 border-primary-500'
                : 'text-gray-500 font-medium hover:text-primary-500'
            }`}
          >
            {label}
            {count !== undefined && (
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                  isActive
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
````

## File: components/HowItWorks.tsx
````typescript
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const steps = [
  { icon: '💵', text: 'Ingresás el monto en USDC' },
  { icon: '🤝', text: 'Te matcheamos con el mejor vendedor' },
  { icon: '⚡', text: 'Recibís ARS en minutos' },
];

export default function HowItWorks() {
  const router = useRouter();

  return (
    <div className="mt-6 rounded-2xl border border-primary-200 bg-gradient-to-br from-primary-50 via-white to-primary-50 p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xl">📚</span>
        <h3 className="text-h5 text-gray-900">Cómo funciona PeerlyPay</h3>
      </div>

      <div className="space-y-3">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm">
              {step.icon}
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-500 text-xs font-semibold text-white">
                {i + 1}
              </span>
              <p className="text-body-sm text-gray-700">{step.text}</p>
            </div>
          </div>
        ))}
      </div>

      <Button
        onClick={() => router.push('/trade')}
        className="mt-5 w-full rounded-xl bg-magenta-500 py-3 text-white hover:bg-magenta-600"
      >
        Hacer mi primer trade
      </Button>
    </div>
  );
}
````

## File: components/LayoutShell.tsx
````typescript
'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

/** Route prefixes that render fullscreen without Header/BottomNav */
const FULLSCREEN_PREFIXES = ['/trade'];

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullscreen = FULLSCREEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isFullscreen) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-white max-w-120 mx-auto px-4 pt-20 pb-24">
      <Header />
      {children}
      <BottomNav />
    </div>
  );
}
````

## File: components/MiniProgressBar.tsx
````typescript
'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MiniProgressBarProps {
  /** 0 = Setup, 1 = Deposit, 2 = Payment, 3 = Confirm, 4 = Complete */
  currentStep: number;
}

const steps = [
  { id: 0, label: 'Setup', shortLabel: 'Setup' },
  { id: 1, label: 'Deposit', shortLabel: 'Deposit' },
  { id: 2, label: 'Payment', shortLabel: 'Pay' },
  { id: 3, label: 'Confirm', shortLabel: 'Confirm' },
  { id: 4, label: 'Complete', shortLabel: 'Done' },
];

export function MiniProgressBar({ currentStep }: MiniProgressBarProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between max-w-[480px] mx-auto">
        {steps.map((step, index) => {
          const isComplete = step.id < currentStep;
          const isActive = step.id === currentStep;
          const isPending = step.id > currentStep;

          return (
            <React.Fragment key={step.id}>
              {/* Step circle and label */}
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300',
                    isComplete && 'bg-emerald-500 text-white',
                    isActive && 'bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-500)] text-white ring-4 ring-[var(--color-primary-100)]',
                    isPending && 'bg-gray-200 text-gray-400'
                  )}
                >
                  {isComplete ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    step.id + 1
                  )}
                </div>

                {/* Step label - show current on mobile, all on desktop */}
                <span
                  className={cn(
                    'text-xs font-medium transition-colors duration-300',
                    isComplete && 'text-emerald-600',
                    isActive && 'text-[var(--color-primary-600)]',
                    isPending && 'text-gray-400',
                    isActive ? 'block' : 'hidden sm:block'
                  )}
                >
                  {step.shortLabel}
                </span>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-1 mx-1 rounded-full transition-all duration-300',
                    isComplete ? 'bg-emerald-500' : 'bg-gray-200'
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default MiniProgressBar;
````

## File: components/OrderCardSkeleton.tsx
````typescript
'use client';

import { Skeleton } from '@/components/ui/skeleton';

export default function OrderCardSkeleton() {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 text-left">
      {/* User info row: address + badge */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-16 rounded-full" />
      </div>

      {/* Amount */}
      <Skeleton className="mb-1 h-8 w-40" />

      {/* Price */}
      <Skeleton className="mb-2 h-4 w-48" />

      {/* Total */}
      <Skeleton className="h-6 w-36" />

      {/* Payment method */}
      <Skeleton className="mt-3 h-5 w-24 rounded-md" />

      {/* Time limit */}
      <Skeleton className="mt-2 h-3 w-40" />

      {/* Action button */}
      <Skeleton className="mt-4 h-10 w-full rounded-full" />
    </article>
  );
}
````

## File: components/OrderDetailCard.tsx
````typescript
import { Building2, Clock } from 'lucide-react';
import type { Order } from '@/types';

interface OrderDetailCardProps {
  order: Order;
}

function shortenAddress(address: string): string {
  if (address.length <= 14) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getAddressInitial(address: string): string {
  const hex = address.replace(/^0x/i, '').slice(0, 1);
  return (hex || '?').toUpperCase();
}

function formatAmount(value: number, decimals = 2): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export default function OrderDetailCard({ order }: OrderDetailCardProps) {
  const total = order.amount * order.rate;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6">
      {/* Seller/Buyer info */}
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-sm font-bold text-white">
            {getAddressInitial(order.createdBy)}
          </div>
          {order.status === 'open' && (
            <span
              className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-white bg-green-500"
              aria-hidden
            />
          )}
        </div>
        <div className="min-w-0">
          <span className="text-mono-code font-medium text-dark-500 block truncate">
            {shortenAddress(order.createdBy)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-cyan-50 px-2 py-0.5 text-xs font-semibold text-cyan-600 mt-0.5">
            ⭐ {(order.reputation_score ?? 0) === 0 ? 'New trader' : `${order.reputation_score} trades`}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="my-4 border-t border-neutral-200" />

      {/* Details grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Amount */}
        <div>
          <p className="text-sm text-gray-600 mb-1">Amount</p>
          <p className="font-mono text-2xl font-bold text-primary-600 tabular-nums">
            {formatAmount(order.amount)} USDC
          </p>
        </div>

        {/* Exchange Rate */}
        <div>
          <p className="text-sm text-gray-600 mb-1">Rate</p>
          <p className="text-mono-amount-sm text-dark-500">
            1 USDC = {formatAmount(order.rate)} {order.currency}
          </p>
        </div>

        {/* Total */}
        <div>
          <p className="text-sm text-gray-600 mb-1">Total</p>
          <p className="text-mono-amount font-semibold text-dark-500">
            {formatAmount(total)} {order.currency}
          </p>
        </div>

        {/* Payment Method */}
        <div>
          <p className="text-sm text-gray-600 mb-1">Payment Method</p>
          <p className="flex items-center gap-1.5 text-body-sm text-dark-500">
            <Building2 className="h-4 w-4 text-gray-400" />
            {order.paymentMethod}
          </p>
        </div>

        {/* Duration */}
        <div>
          <p className="text-sm text-gray-600 mb-1">Payment Window</p>
          <p className="flex items-center gap-1.5 text-body-sm text-dark-500">
            <Clock className="h-4 w-4 text-gray-400" />
            {order.duration || '30 min'}
          </p>
        </div>
      </div>
    </div>
  );
}
````

## File: components/OrderHistoryCard.tsx
````typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Check, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OrderHistoryItem, OrderHistoryStatus } from '@/types';

// ============================================
// TYPES
// ============================================

export interface OrderHistoryCardProps {
  order: OrderHistoryItem;
  onChat?: (orderId: string) => void;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getTypeBadge(type: 'buy' | 'sell'): { label: string; className: string } {
  if (type === 'buy') {
    return {
      label: 'Buy USDC',
      className: 'bg-green-50 text-green-700 border border-green-300',
    };
  }
  return {
    label: 'Sell USDC',
    className: 'bg-red-50 text-red-700 border border-red-300',
  };
}

function getStatusBadge(status: OrderHistoryStatus): { label: string; className: string } {
  const statusMap: Record<OrderHistoryStatus, { label: string; className: string }> = {
    awaiting_payment: {
      label: 'Awaiting Payment',
      className: 'bg-yellow-100 text-yellow-700',
    },
    payment_sent: {
      label: 'Paid',
      className: 'bg-blue-100 text-blue-700',
    },
    releasing: {
      label: 'Please Release',
      className: 'bg-yellow-100 text-yellow-700',
    },
    completed: {
      label: 'Completed',
      className: 'bg-green-100 text-green-700',
    },
    cancelled: {
      label: 'Cancelled',
      className: 'bg-gray-100 text-gray-600',
    },
    disputed: {
      label: 'In Dispute',
      className: 'bg-red-100 text-red-700',
    },
    expired: {
      label: 'Expired',
      className: 'bg-gray-100 text-gray-500',
    },
  };

  return statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-600' };
}

function formatAmount(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatFiatAmount(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

function formatTimestamp(dateString: string): string {
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function truncateOrderId(id: string): string {
  if (id.length <= 12) return id;
  return `${id.slice(0, 9)}...`;
}

function shortenAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// ============================================
// COMPONENT
// ============================================

export function OrderHistoryCard({ order, onChat }: OrderHistoryCardProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const typeBadge = getTypeBadge(order.type);
  const statusBadge = getStatusBadge(order.status);
  const counterpartyName = order.counterparty.username || shortenAddress(order.counterparty.address);

  const handleCopyOrderId = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(order.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCardClick = () => {
    router.push(`/orders/${order.id}`);
  };

  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChat?.(order.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };

  // Check if action is needed (for highlighting)
  const needsAction = order.status === 'releasing' || order.status === 'awaiting_payment';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'w-full bg-white rounded-xl border border-gray-200 p-4 cursor-pointer',
        'transition-all duration-200 hover:border-gray-300 hover:shadow-sm',
        'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:ring-offset-2',
        needsAction && 'border-l-4 border-l-yellow-400'
      )}
      aria-label={`${order.type} order for ${order.usdc_amount} USDC`}
    >
      {/* Row 1: Type Badge + Status Badge */}
      <div className="flex items-center justify-between mb-4">
        <span
          className={cn(
            'inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold',
            typeBadge.className
          )}
        >
          {typeBadge.label}
        </span>

        <span
          className={cn(
            'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
            statusBadge.className
          )}
        >
          {statusBadge.label}
        </span>
      </div>

      {/* Info Grid - 2 columns */}
      <div className="space-y-2.5">
        {/* Amount */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Amount</span>
          <span className="text-sm font-semibold font-[family-name:var(--font-jetbrains-mono)] tabular-nums text-gray-900">
            $ {formatFiatAmount(order.fiat_amount)}
          </span>
        </div>

        {/* Rate */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Price</span>
          <span className="text-sm font-semibold font-[family-name:var(--font-jetbrains-mono)] tabular-nums text-gray-900">
            $ {formatAmount(order.rate)}
          </span>
        </div>

        {/* Total Quantity */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Total quantity</span>
          <span className="text-sm font-semibold font-[family-name:var(--font-jetbrains-mono)] tabular-nums text-gray-900">
            {formatAmount(order.usdc_amount)} USDC
          </span>
        </div>

        {/* Order ID */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Order</span>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium font-[family-name:var(--font-jetbrains-mono)] text-gray-900">
              {truncateOrderId(order.id)}
            </span>
            <button
              type="button"
              onClick={handleCopyOrderId}
              className="p-1 rounded hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
              aria-label={copied ? 'Copied!' : 'Copy order ID'}
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-green-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-gray-500" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="my-3 border-t border-gray-100" />

      {/* Footer: Username + Timestamp */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleChatClick}
          className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:underline"
          aria-label={`Chat with ${counterpartyName}`}
        >
          <span className="font-medium">{counterpartyName}</span>
          <MessageSquare className="w-3.5 h-3.5" />
        </button>

        <span className="text-xs text-gray-500 font-[family-name:var(--font-jetbrains-mono)] tabular-nums">
          {formatTimestamp(order.updated_at)}
        </span>
      </div>
    </div>
  );
}

export default OrderHistoryCard;
````

## File: components/RecentActivity.tsx
````typescript
'use client';

import { useRouter } from 'next/navigation';

interface RecentActivityProps {
  weeklyTrades: number;
  totalConverted: number;
  avgPerTrade: number;
}

export default function RecentActivity({
  weeklyTrades,
  totalConverted,
  avgPerTrade,
}: RecentActivityProps) {
  const router = useRouter();

  return (
    <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
      <h3 className="text-h5 text-gray-900 mb-4">
        <span className="mr-1">💰</span> Tu actividad
      </h3>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-green-50 p-3 text-center">
          <p className="text-h5 text-green-700">{weeklyTrades}</p>
          <p className="text-caption text-gray-500">Esta semana</p>
        </div>
        <div className="rounded-xl bg-green-50 p-3 text-center">
          <p className="text-h5 text-green-700">
            ${totalConverted.toLocaleString('es-AR')}
          </p>
          <p className="text-caption text-gray-500">Total ARS</p>
        </div>
        <div className="rounded-xl bg-green-50 p-3 text-center">
          <p className="text-h5 text-green-700">{avgPerTrade}</p>
          <p className="text-caption text-gray-500">Prom. USDC</p>
        </div>
      </div>

      <button
        onClick={() => router.push('/orders')}
        className="mt-4 w-full text-center text-body-sm font-medium text-magenta-500 hover:text-magenta-600 transition-colors"
      >
        Ver historial completo →
      </button>
    </div>
  );
}
````

## File: components/RoleSelection.tsx
````typescript
'use client';

import { useState } from 'react';
import { Zap, TrendingUp } from 'lucide-react';

export type UserRole = 'FREELANCER' | 'MARKET_MAKER';

interface RoleSelectionProps {
  onSelectRole: (role: UserRole) => void;
}

export function RoleSelection({ onSelectRole }: RoleSelectionProps) {
  const [selected, setSelected] = useState<UserRole | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-6 flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-bold text-3xl">¿Cómo vas a usar PeerlyPay?</h1>
          <p className="text-gray-600">
            Elige tu perfil para personalizar tu experiencia
          </p>
        </div>

        <div className="space-y-4">
          {/* Freelancer */}
          <div 
            className={`p-6 rounded-xl cursor-pointer transition-all border-2 ${
              selected === 'FREELANCER' 
                ? 'border-pink-500 bg-pink-50 shadow-lg' 
                : 'border-gray-200 hover:border-pink-300 hover:shadow-md'
            }`}
            onClick={() => setSelected('FREELANCER')}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${
                selected === 'FREELANCER' ? 'bg-pink-200' : 'bg-pink-100'
              }`}>
                <Zap className="w-6 h-6 text-pink-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">
                  Cobro en crypto, necesito pesos
                </h3>
                <p className="text-sm text-gray-600">
                  Conversión rápida de USDC a moneda local
                </p>
              </div>
            </div>
          </div>

          {/* Market Maker */}
          <div 
            className={`p-6 rounded-xl cursor-pointer transition-all border-2 ${
              selected === 'MARKET_MAKER' 
                ? 'border-indigo-500 bg-indigo-50 shadow-lg' 
                : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
            }`}
            onClick={() => setSelected('MARKET_MAKER')}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${
                selected === 'MARKET_MAKER' ? 'bg-indigo-200' : 'bg-indigo-100'
              }`}>
                <TrendingUp className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">
                  Quiero proveer liquidez y ganar
                </h3>
                <p className="text-sm text-gray-600">
                  Compra/venta activa de USDC
                </p>
              </div>
            </div>
          </div>
        </div>

        <button 
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
            selected
              ? 'bg-pink-600 text-white hover:bg-pink-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          disabled={!selected}
          onClick={() => selected && onSelectRole(selected)}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
````

## File: components/StatsCards.tsx
````typescript
"use client";

import { Clock, CheckCircle, AlertTriangle } from "lucide-react";

interface StatsCardsProps {
  active: number;
  completed: number;
  disputed: number;
}

export default function StatsCards({
  active,
  completed,
  disputed,
}: StatsCardsProps) {
  const stats = [
    {
      icon: Clock,
      number: active,
      label: "Active Orders",
      color: "primary",
    },
    {
      icon: CheckCircle,
      number: completed,
      label: "Completed",
      color: "success",
    },
    {
      icon: AlertTriangle,
      number: disputed,
      label: "Disputed",
      color: "warning",
    },
  ] as const;

  const colorClasses = {
    primary: {
      bg: "bg-primary-50",
      text: "text-primary-600",
    },
    success: {
      bg: "bg-success-50",
      text: "text-success-600",
    },
    warning: {
      bg: "bg-warning-50",
      text: "text-warning-600",
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-[480px] md:max-w-none">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const colors = colorClasses[stat.color];

        return (
          <div
            key={stat.label}
            className="bg-white border border-[#e5e5e5] rounded-xl p-6 text-center"
          >
            {/* Icon */}
            <div
              className={`w-12 h-12 ${colors.bg} ${colors.text} rounded-full p-3 mx-auto mb-4 flex items-center justify-center`}
            >
              <Icon className="w-6 h-6" />
            </div>

            {/* Number */}
            <p
              className={`font-space-grotesk text-4xl font-bold ${colors.text} mb-1`}
            >
              {stat.number}
            </p>

            {/* Label */}
            <p className="font-dm-sans text-sm font-medium text-gray-600">
              {stat.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
````

## File: components/WalletConnection.tsx
````typescript
'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Wallet,
  Loader2,
  LogOut,
  Copy,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Zap,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

function shortenAddress(address: string): string {
  if (address.length <= 14) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatBalance(balance: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(balance);
}

export default function WalletConnection() {
  const { user, connectWallet, disconnectWallet } = useStore();
  const { isConnected, walletAddress, balance } = user;
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    isConnected ? 'connected' : 'disconnected'
  );
  const [hasCopied, setHasCopied] = useState(false);

  const handleConnect = useCallback(async () => {
    setConnectionState('connecting');

    try {
      // Simulate wallet connection delay
      await new Promise((resolve) => setTimeout(resolve, 1200));
      connectWallet();
      setConnectionState('connected');
      toast.success('Wallet conectada', {
        description: 'Tu wallet está lista para operar',
        icon: <CheckCircle2 className="size-4 text-accent-500" />,
      });
    } catch {
      setConnectionState('error');
      toast.error('Error de conexión', {
        description: 'No se pudo conectar. Intenta de nuevo.',
        icon: <AlertCircle className="size-4" />,
      });
    }
  }, [connectWallet]);

  const handleDisconnect = useCallback(() => {
    disconnectWallet();
    setConnectionState('disconnected');
    toast.info('Wallet desconectada', {
      description: 'Sesión cerrada correctamente',
    });
  }, [disconnectWallet]);

  const handleCopyAddress = useCallback(async () => {
    if (!walletAddress) return;

    try {
      await navigator.clipboard.writeText(walletAddress);
      setHasCopied(true);
      toast.success('Dirección copiada');
      setTimeout(() => setHasCopied(false), 2000);
    } catch {
      toast.error('No se pudo copiar');
    }
  }, [walletAddress]);

  const handleViewExplorer = useCallback(() => {
    if (!walletAddress) return;
    // Stellar explorer URL (placeholder - update with actual explorer)
    const explorerUrl = `https://stellar.expert/explorer/public/account/${walletAddress}`;
    window.open(explorerUrl, '_blank', 'noopener,noreferrer');
  }, [walletAddress]);

  // Disconnected state - prominent CTA
  if (connectionState === 'disconnected') {
    return (
      <Button
        onClick={handleConnect}
        className="group relative overflow-hidden bg-gradient-peerlypay hover:opacity-90 text-white rounded-full px-5 py-2.5 font-[family-name:var(--font-dm-sans)] font-medium transition-all duration-300 shadow-peerlypay hover:shadow-peerlypay-lg hover:scale-[1.02] active:scale-[0.98]"
        aria-label="Conectar wallet para comenzar a operar"
      >
        {/* Shimmer effect on hover */}
        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <span className="relative flex items-center gap-2">
          <Wallet className="size-4" aria-hidden="true" />
          <span className="hidden xs:inline">Conectar</span>
          <span className="xs:hidden">Wallet</span>
        </span>
      </Button>
    );
  }

  // Connecting state - loading with pulse animation
  if (connectionState === 'connecting') {
    return (
      <Button
        disabled
        className="relative bg-gradient-peerlypay text-white rounded-full px-5 py-2.5 opacity-90 cursor-wait"
        aria-label="Conectando wallet..."
        aria-busy="true"
      >
        {/* Pulse ring animation */}
        <span className="absolute inset-0 rounded-full animate-ping bg-primary-500/30" />

        <span className="relative flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          <span className="text-sm">Conectando...</span>
        </span>
      </Button>
    );
  }

  // Error state - retry option
  if (connectionState === 'error') {
    return (
      <Button
        onClick={handleConnect}
        variant="outline"
        className="border-destructive text-destructive hover:bg-destructive/10 rounded-full px-5 py-2.5 transition-all duration-200"
        aria-label="Error al conectar. Click para reintentar"
      >
        <AlertCircle className="size-4" aria-hidden="true" />
        <span className="text-sm">Reintentar</span>
      </Button>
    );
  }

  // Connected state - rich dropdown with account info
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="group relative rounded-full pl-3 pr-2.5 py-2 h-auto border-neutral-200 hover:border-primary-300 hover:bg-primary-50/50 transition-all duration-200"
          aria-label={`Wallet conectada: ${walletAddress}. Click para ver opciones`}
        >
          {/* Connection indicator dot */}
          <span
            className="absolute -top-0.5 -right-0.5 size-2.5 bg-accent-500 rounded-full border-2 border-white animate-pulse"
            aria-label="Conectado"
          />

          <span className="flex items-center gap-2">
            {/* Mini balance pill */}
            <span className="hidden sm:flex items-center gap-1 bg-neutral-100 rounded-full px-2 py-0.5">
              <Zap className="size-3 text-primary-500" aria-hidden="true" />
              <span className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-neutral-700">
                {formatBalance(balance.usd)}
              </span>
            </span>

            {/* Address */}
            <span className="font-[family-name:var(--font-jetbrains-mono)] text-sm text-neutral-800">
              {walletAddress ? shortenAddress(walletAddress) : '0x...'}
            </span>

            <ChevronDown
              className="size-4 text-neutral-400 group-hover:text-primary-500 transition-colors"
              aria-hidden="true"
            />
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 p-2 rounded-xl shadow-lg border-neutral-200"
        sideOffset={8}
      >
        {/* Account header */}
        <div className="px-2 py-3 mb-1">
          {/* Network badge */}
          <div className="flex items-center gap-1.5 mb-2">
            <span className="size-2 bg-accent-500 rounded-full" aria-hidden="true" />
            <span className="text-xs font-medium text-neutral-500 font-[family-name:var(--font-dm-sans)]">
              Stellar Mainnet
            </span>
          </div>

          {/* Balance display */}
          <div className="flex flex-col">
            <span className="text-overline text-neutral-400 text-[10px]">
              BALANCE DISPONIBLE
            </span>
            <span className="font-[family-name:var(--font-space-grotesk)] text-2xl font-semibold text-neutral-900 tracking-tight">
              {formatBalance(balance.usd)}
            </span>
            <span className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-neutral-500">
              ≈ {balance.usdc.toFixed(2)} USDC
            </span>
          </div>
        </div>

        <DropdownMenuSeparator className="bg-neutral-100" />

        {/* Actions */}
        <DropdownMenuItem
          onClick={handleCopyAddress}
          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg hover:bg-neutral-50 focus:bg-neutral-50 transition-colors"
        >
          {hasCopied ? (
            <CheckCircle2 className="size-4 text-accent-600" aria-hidden="true" />
          ) : (
            <Copy className="size-4 text-neutral-500" aria-hidden="true" />
          )}
          <span className="font-[family-name:var(--font-dm-sans)] text-sm text-neutral-700">
            {hasCopied ? 'Copiado' : 'Copiar dirección'}
          </span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleViewExplorer}
          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg hover:bg-neutral-50 focus:bg-neutral-50 transition-colors"
        >
          <ExternalLink className="size-4 text-neutral-500" aria-hidden="true" />
          <span className="font-[family-name:var(--font-dm-sans)] text-sm text-neutral-700">
            Ver en Explorer
          </span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-neutral-100 my-1" />

        <DropdownMenuItem
          onClick={handleDisconnect}
          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive transition-colors"
        >
          <LogOut className="size-4" aria-hidden="true" />
          <span className="font-[family-name:var(--font-dm-sans)] text-sm font-medium">
            Desconectar
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
````

## File: components/WalletModal.tsx
````typescript
'use client';

import { useState } from 'react';
import { X, Copy, Check, ExternalLink } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
  balanceUsdc: number;
  balanceXlm: number;
  onDisconnect: () => void;
}

export default function WalletModal({
  isOpen,
  onClose,
  walletAddress,
  balanceUsdc,
  balanceXlm,
  onDisconnect,
}: WalletModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Full address for QR and copy
  const fullAddress = walletAddress || 'GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOUJ3NBNE5P4XXXY';

  // Truncated for display
  const truncatedAddress = fullAddress.length > 16
    ? `${fullAddress.slice(0, 8)}...${fullAddress.slice(-8)}`
    : fullAddress;

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(fullAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleViewOnExplorer = () => {
    window.open(`https://stellarchain.io/accounts/${fullAddress}`, '_blank');
  };

  const handleDisconnect = () => {
    onDisconnect();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-[480px] bg-white rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 font-[family-name:var(--font-space-grotesk)]">
            Your Wallet
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* QR Code */}
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
              <QRCodeSVG
                value={fullAddress}
                size={160}
                level="M"
                includeMargin={false}
                className="rounded-lg"
              />
            </div>
          </div>

          {/* Address with copy button */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
              Wallet address
            </p>
            <div className="flex items-center justify-between gap-3">
              <code className="text-sm font-mono text-gray-900">
                {truncatedAddress}
              </code>
              <button
                type="button"
                onClick={handleCopyAddress}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  copied
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Balance breakdown */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">
              Balances
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">$</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">USDC</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 font-[family-name:var(--font-jetbrains-mono)]">
                  {balanceUsdc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-600">XLM</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">XLM</span>
                    <span className="text-xs text-gray-500 ml-1.5">(for fees)</span>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-900 font-[family-name:var(--font-jetbrains-mono)]">
                  {balanceXlm.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                </span>
              </div>
            </div>
          </div>

          {/* View on Explorer link */}
          <button
            type="button"
            onClick={handleViewOnExplorer}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-[var(--color-primary-500)] hover:text-[var(--color-primary-600)] transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View on Stellar Explorer
          </button>

          {/* Disconnect button */}
          <Button
            onClick={handleDisconnect}
            variant="outline"
            className="w-full h-12 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 font-semibold transition-colors"
          >
            Disconnect Wallet
          </Button>
        </div>
      </div>
    </div>
  );
}
````

## File: contexts/UserContext.tsx
````typescript
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'FREELANCER' | 'MARKET_MAKER';

export interface User {
  id: string;
  walletAddress: string;
  role: UserRole;
  createdAt: Date;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isFreelancer: boolean;
  isMarketMaker: boolean;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'peerlypay_user';

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUserState(parsed);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      localStorage.removeItem(USER_STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const setUser = (newUser: User | null) => {
    setUserState(newUser);
    
    try {
      if (newUser) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const isFreelancer = user?.role === 'FREELANCER';
  const isMarketMaker = user?.role === 'MARKET_MAKER';

  return (
    <UserContext.Provider 
      value={{ user, setUser, isFreelancer, isMarketMaker, loading }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
````

## File: contracts/contracts/p2p/src/core/validators/admin.rs
````rust
use soroban_sdk::Address;

use crate::error::ContractError;
use crate::storage::types::Config;

pub fn validate_initialize_inputs(
    max_duration_secs: u64,
    filler_payment_timeout_secs: u64,
) -> Result<(), ContractError> {
    if max_duration_secs == 0 || filler_payment_timeout_secs == 0 {
        return Err(ContractError::InvalidTimeout);
    }

    Ok(())
}

pub fn ensure_pauser(config: &Config, caller: &Address) -> Result<(), ContractError> {
    if *caller != config.pauser {
        return Err(ContractError::Unauthorized);
    }

    Ok(())
}

pub fn ensure_dispute_resolver(config: &Config, caller: &Address) -> Result<(), ContractError> {
    if *caller != config.dispute_resolver {
        return Err(ContractError::Unauthorized);
    }

    Ok(())
}

pub fn ensure_not_paused(config: &Config) -> Result<(), ContractError> {
    if config.paused {
        return Err(ContractError::Paused);
    }

    Ok(())
}
````

## File: contracts/contracts/p2p/src/core/validators/dispute.rs
````rust
use crate::error::ContractError;
use crate::storage::types::{Order, OrderStatus};

pub fn ensure_disputable(order: &Order) -> Result<(), ContractError> {
    if order.status != OrderStatus::AwaitingConfirmation {
        return Err(ContractError::InvalidOrderStatus);
    }

    Ok(())
}

pub fn ensure_disputed(order: &Order) -> Result<(), ContractError> {
    if order.status != OrderStatus::Disputed {
        return Err(ContractError::InvalidOrderStatus);
    }

    Ok(())
}
````

## File: contracts/contracts/p2p/src/core/validators/order.rs
````rust
use soroban_sdk::Address;

use crate::error::ContractError;
use crate::storage::types::{Config, Order, OrderStatus};

pub fn validate_create_order(
    amount: i128,
    exchange_rate: i128,
    duration_secs: u64,
    config: &Config,
) -> Result<(), ContractError> {
    if amount <= 0 {
        return Err(ContractError::InvalidAmount);
    }

    if exchange_rate <= 0 {
        return Err(ContractError::InvalidExchangeRate);
    }

    if duration_secs > config.max_duration_secs {
        return Err(ContractError::InvalidDuration);
    }

    Ok(())
}

pub fn ensure_status(order: &Order, expected: OrderStatus) -> Result<(), ContractError> {
    if order.status != expected {
        return Err(ContractError::InvalidOrderStatus);
    }

    Ok(())
}

pub fn ensure_creator(order: &Order, caller: &Address) -> Result<(), ContractError> {
    if *caller != order.creator {
        return Err(ContractError::Unauthorized);
    }

    Ok(())
}

pub fn ensure_not_creator(order: &Order, caller: &Address) -> Result<(), ContractError> {
    if *caller == order.creator {
        return Err(ContractError::Unauthorized);
    }

    Ok(())
}

pub fn ensure_not_expired(order: &Order, now: u64) -> Result<(), ContractError> {
    if order.deadline <= now {
        return Err(ContractError::OrderExpired);
    }

    Ok(())
}

pub fn ensure_fiat_timeout_expired(order: &Order, now: u64) -> Result<(), ContractError> {
    let deadline = order
        .fiat_transfer_deadline
        .ok_or(ContractError::InvalidOrderStatus)?;

    if deadline >= now {
        return Err(ContractError::FiatTransferHasNotExpired);
    }

    Ok(())
}

pub fn ensure_filler(order: &Order, caller: &Address) -> Result<(), ContractError> {
    match &order.filler {
        Some(filler) if *filler == *caller => Ok(()),
        Some(_) => Err(ContractError::Unauthorized),
        None => Err(ContractError::MissingFiller),
    }
}
````

## File: contracts/contracts/p2p/src/core/admin.rs
````rust
use soroban_sdk::{Address, Env};

use crate::core::validators::admin::{ensure_pauser, validate_initialize_inputs};
use crate::error::ContractError;
use crate::storage::types::{Config, DataKey};

pub struct AdminManager;

impl AdminManager {
    pub fn initialize(
        e: &Env,
        admin: Address,
        dispute_resolver: Address,
        pauser: Address,
        token: Address,
        max_duration_secs: u64,
        filler_payment_timeout_secs: u64,
    ) -> Result<Config, ContractError> {
        if e.storage().instance().has(&DataKey::Config) {
            return Err(ContractError::AlreadyInitialized);
        }

        validate_initialize_inputs(max_duration_secs, filler_payment_timeout_secs)?;

        let config = Config {
            admin,
            dispute_resolver,
            pauser,
            token,
            max_duration_secs,
            filler_payment_timeout_secs,
            paused: false,
        };

        e.storage().instance().set(&DataKey::Config, &config);
        e.storage().instance().set(&DataKey::OrderCount, &0u64);

        Ok(config)
    }

    pub fn pause(e: &Env, caller: Address) -> Result<(), ContractError> {
        caller.require_auth();
        let mut config = Self::get_config(e)?;

        ensure_pauser(&config, &caller)?;
        if config.paused {
            return Err(ContractError::AlreadyPaused);
        }

        config.paused = true;
        e.storage().instance().set(&DataKey::Config, &config);

        Ok(())
    }

    pub fn unpause(e: &Env, caller: Address) -> Result<(), ContractError> {
        caller.require_auth();
        let mut config = Self::get_config(e)?;

        ensure_pauser(&config, &caller)?;
        if !config.paused {
            return Err(ContractError::AlreadyUnpaused);
        }

        config.paused = false;
        e.storage().instance().set(&DataKey::Config, &config);

        Ok(())
    }

    pub fn get_config(e: &Env) -> Result<Config, ContractError> {
        e.storage()
            .instance()
            .get(&DataKey::Config)
            .ok_or(ContractError::ConfigNotInitialized)
    }

    pub fn get_order_count(e: &Env) -> Result<u64, ContractError> {
        if !e.storage().instance().has(&DataKey::Config) {
            return Err(ContractError::ConfigNotInitialized);
        }

        Ok(e.storage()
            .instance()
            .get(&DataKey::OrderCount)
            .unwrap_or(0u64))
    }
}
````

## File: contracts/contracts/p2p/src/core/dispute.rs
````rust
use soroban_sdk::token::Client as TokenClient;
use soroban_sdk::{Address, Env};

use crate::core::admin::AdminManager;
use crate::core::order::OrderManager;
use crate::core::validators::admin::{ensure_dispute_resolver, ensure_not_paused};
use crate::core::validators::dispute::{ensure_disputable, ensure_disputed};
use crate::core::validators::order::{ensure_creator, ensure_filler};
use crate::error::ContractError;
use crate::storage::types::{DataKey, Order, OrderStatus};

pub struct DisputeManager;

impl DisputeManager {
    pub fn dispute_fiat_payment(
        e: &Env,
        caller: Address,
        order_id: u64,
    ) -> Result<Order, ContractError> {
        caller.require_auth();
        let config = AdminManager::get_config(e)?;
        ensure_not_paused(&config)?;

        let mut order = OrderManager::get_order(e, order_id)?;
        ensure_disputable(&order)?;

        if order.from_crypto {
            ensure_filler(&order, &caller)?;
        } else {
            ensure_creator(&order, &caller)?;
        }

        order.status = OrderStatus::Disputed;
        e.storage()
            .instance()
            .set(&DataKey::Order(order.order_id), &order);

        Ok(order)
    }

    pub fn resolve_dispute(
        e: &Env,
        caller: Address,
        order_id: u64,
        fiat_transfer_confirmed: bool,
    ) -> Result<Order, ContractError> {
        caller.require_auth();
        let config = AdminManager::get_config(e)?;
        ensure_dispute_resolver(&config, &caller)?;
        ensure_not_paused(&config)?;

        let mut order = OrderManager::get_order(e, order_id)?;
        ensure_disputed(&order)?;

        let token_client = TokenClient::new(e, &config.token);
        let recipient = if fiat_transfer_confirmed {
            order.status = OrderStatus::Completed;
            if order.from_crypto {
                order.filler.clone().ok_or(ContractError::MissingFiller)?
            } else {
                order.creator.clone()
            }
        } else {
            order.status = OrderStatus::Refunded;
            if order.from_crypto {
                order.creator.clone()
            } else {
                order.filler.clone().ok_or(ContractError::MissingFiller)?
            }
        };

        token_client.transfer(&e.current_contract_address(), &recipient, &order.amount);
        e.storage()
            .instance()
            .set(&DataKey::Order(order.order_id), &order);

        Ok(order)
    }
}
````

## File: contracts/contracts/p2p/src/core/order.rs
````rust
use soroban_sdk::token::Client as TokenClient;
use soroban_sdk::{Address, Env};

use crate::core::admin::AdminManager;
use crate::core::validators::admin::ensure_not_paused;
use crate::core::validators::order::{
    ensure_creator, ensure_fiat_timeout_expired, ensure_filler, ensure_not_creator,
    ensure_not_expired, ensure_status, validate_create_order,
};
use crate::error::ContractError;
use crate::storage::types::{DataKey, FiatCurrency, Order, OrderStatus, PaymentMethod};

pub struct OrderManager;

impl OrderManager {
    pub fn create_order(
        e: &Env,
        caller: Address,
        fiat_currency: FiatCurrency,
        payment_method: PaymentMethod,
        from_crypto: bool,
        amount: i128,
        exchange_rate: i128,
        duration_secs: u64,
    ) -> Result<Order, ContractError> {
        caller.require_auth();
        let config = AdminManager::get_config(e)?;
        ensure_not_paused(&config)?;
        validate_create_order(amount, exchange_rate, duration_secs, &config)?;

        let now = e.ledger().timestamp();
        let next_order_id = Self::next_order_id(e)?;
        let deadline = now + duration_secs;
        let mut order = Order {
            order_id: next_order_id,
            creator: caller.clone(),
            filler: None,
            token: config.token.clone(),
            amount,
            exchange_rate,
            from_crypto,
            fiat_currency,
            payment_method,
            status: OrderStatus::Created,
            created_at: now,
            deadline,
            fiat_transfer_deadline: None,
        };

        if from_crypto {
            let token_client = TokenClient::new(e, &config.token);
            token_client.transfer(&caller, &e.current_contract_address(), &amount);
        }

        order.status = OrderStatus::AwaitingFiller;
        Self::store_order(e, &order);
        e.storage()
            .instance()
            .set(&DataKey::OrderCount, &(next_order_id + 1));

        Ok(order)
    }

    pub fn cancel_order(e: &Env, caller: Address, order_id: u64) -> Result<Order, ContractError> {
        caller.require_auth();
        let config = AdminManager::get_config(e)?;
        ensure_not_paused(&config)?;

        let mut order = Self::get_order(e, order_id)?;
        ensure_status(&order, OrderStatus::AwaitingFiller)?;
        ensure_creator(&order, &caller)?;

        order.status = OrderStatus::Cancelled;

        if order.from_crypto {
            let token_client = TokenClient::new(e, &config.token);
            token_client.transfer(&e.current_contract_address(), &order.creator, &order.amount);
        }

        Self::store_order(e, &order);
        Ok(order)
    }

    pub fn take_order(e: &Env, caller: Address, order_id: u64) -> Result<Order, ContractError> {
        caller.require_auth();
        let config = AdminManager::get_config(e)?;
        ensure_not_paused(&config)?;

        let mut order = Self::get_order(e, order_id)?;
        ensure_status(&order, OrderStatus::AwaitingFiller)?;
        ensure_not_creator(&order, &caller)?;
        ensure_not_expired(&order, e.ledger().timestamp())?;

        if !order.from_crypto {
            let token_client = TokenClient::new(e, &config.token);
            token_client.transfer(&caller, &e.current_contract_address(), &order.amount);
        }

        order.filler = Some(caller);
        order.status = OrderStatus::AwaitingPayment;
        order.fiat_transfer_deadline =
            Some(e.ledger().timestamp() + config.filler_payment_timeout_secs);

        Self::store_order(e, &order);
        Ok(order)
    }

    pub fn submit_fiat_payment(
        e: &Env,
        caller: Address,
        order_id: u64,
    ) -> Result<Order, ContractError> {
        caller.require_auth();
        let config = AdminManager::get_config(e)?;
        ensure_not_paused(&config)?;

        let mut order = Self::get_order(e, order_id)?;
        ensure_status(&order, OrderStatus::AwaitingPayment)?;

        if order.from_crypto {
            ensure_filler(&order, &caller)?;
        } else {
            ensure_creator(&order, &caller)?;
        }

        order.status = OrderStatus::AwaitingConfirmation;
        Self::store_order(e, &order);

        Ok(order)
    }

    pub fn execute_fiat_transfer_timeout(
        e: &Env,
        caller: Address,
        order_id: u64,
    ) -> Result<Order, ContractError> {
        caller.require_auth();
        let config = AdminManager::get_config(e)?;
        ensure_not_paused(&config)?;

        let mut order = Self::get_order(e, order_id)?;
        ensure_status(&order, OrderStatus::AwaitingPayment)?;
        ensure_fiat_timeout_expired(&order, e.ledger().timestamp())?;

        if order.from_crypto {
            ensure_creator(&order, &caller)?;
        } else {
            ensure_filler(&order, &caller)?;
        }

        order.status = OrderStatus::AwaitingFiller;
        order.filler = None;
        order.fiat_transfer_deadline = None;
        Self::store_order(e, &order);

        Ok(order)
    }

    pub fn confirm_fiat_payment(
        e: &Env,
        caller: Address,
        order_id: u64,
    ) -> Result<Order, ContractError> {
        caller.require_auth();
        let config = AdminManager::get_config(e)?;
        ensure_not_paused(&config)?;

        let mut order = Self::get_order(e, order_id)?;
        ensure_status(&order, OrderStatus::AwaitingConfirmation)?;

        let recipient = if order.from_crypto {
            ensure_creator(&order, &caller)?;
            order.filler.clone().ok_or(ContractError::MissingFiller)?
        } else {
            ensure_filler(&order, &caller)?;
            order.creator.clone()
        };

        let token_client = TokenClient::new(e, &config.token);
        token_client.transfer(&e.current_contract_address(), &recipient, &order.amount);

        order.status = OrderStatus::Completed;
        Self::store_order(e, &order);

        Ok(order)
    }

    pub fn get_order(e: &Env, order_id: u64) -> Result<Order, ContractError> {
        e.storage()
            .instance()
            .get(&DataKey::Order(order_id))
            .ok_or(ContractError::OrderNotFound)
    }

    fn next_order_id(e: &Env) -> Result<u64, ContractError> {
        let current = AdminManager::get_order_count(e)?;
        Ok(current)
    }

    fn store_order(e: &Env, order: &Order) {
        e.storage()
            .instance()
            .set(&DataKey::Order(order.order_id), order);
    }
}
````

## File: contracts/contracts/p2p/src/events/handler.rs
````rust
use soroban_sdk::{contractevent, Address};

#[contractevent(topics = ["p2p_initialized"], data_format = "vec")]
#[derive(Clone)]
pub struct Initialized {
    pub admin: Address,
    pub dispute_resolver: Address,
    pub pauser: Address,
    pub token: Address,
}

#[contractevent(topics = ["p2p_paused"], data_format = "single-value")]
#[derive(Clone)]
pub struct PausedEvt {
    pub by: Address,
}

#[contractevent(topics = ["p2p_unpaused"], data_format = "single-value")]
#[derive(Clone)]
pub struct UnpausedEvt {
    pub by: Address,
}

#[contractevent(topics = ["p2p_order_created"], data_format = "vec")]
#[derive(Clone)]
pub struct OrderCreated {
    pub order_id: u64,
    pub creator: Address,
    pub amount: i128,
    pub from_crypto: bool,
}

#[contractevent(topics = ["p2p_order_cancelled"], data_format = "vec")]
#[derive(Clone)]
pub struct OrderCancelled {
    pub order_id: u64,
    pub cancelled_by: Address,
}

#[contractevent(topics = ["p2p_order_taken"], data_format = "vec")]
#[derive(Clone)]
pub struct OrderTaken {
    pub order_id: u64,
    pub filler: Address,
}

#[contractevent(topics = ["p2p_fiat_payment_submitted"], data_format = "vec")]
#[derive(Clone)]
pub struct FiatPaymentSubmitted {
    pub order_id: u64,
    pub submitted_by: Address,
}

#[contractevent(topics = ["p2p_fiat_transfer_timeout"], data_format = "vec")]
#[derive(Clone)]
pub struct FiatTransferTimeout {
    pub order_id: u64,
    pub executed_by: Address,
}

#[contractevent(topics = ["p2p_fiat_payment_confirmed"], data_format = "vec")]
#[derive(Clone)]
pub struct FiatPaymentConfirmed {
    pub order_id: u64,
    pub confirmed_by: Address,
}

#[contractevent(topics = ["p2p_fiat_payment_disputed"], data_format = "vec")]
#[derive(Clone)]
pub struct FiatPaymentDisputed {
    pub order_id: u64,
    pub disputed_by: Address,
}

#[contractevent(topics = ["p2p_dispute_resolved"], data_format = "vec")]
#[derive(Clone)]
pub struct DisputeResolved {
    pub order_id: u64,
    pub resolved_by: Address,
    pub fiat_transfer_confirmed: bool,
}
````

## File: contracts/contracts/p2p/src/storage/types.rs
````rust
use soroban_sdk::{contracttype, Address};

#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum FiatCurrency {
    Usd,
    Eur,
    Ars,
    Cop,
    Gbp,
    Other(u32),
}

#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum PaymentMethod {
    BankTransfer,
    MobileWallet,
    Cash,
    Other(u32),
}

#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum OrderStatus {
    Created,
    AwaitingFiller,
    AwaitingPayment,
    AwaitingConfirmation,
    Completed,
    Disputed,
    Refunded,
    Cancelled,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Config {
    pub admin: Address,
    pub dispute_resolver: Address,
    pub pauser: Address,
    pub token: Address,
    pub max_duration_secs: u64,
    pub filler_payment_timeout_secs: u64,
    pub paused: bool,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Order {
    pub order_id: u64,
    pub creator: Address,
    pub filler: Option<Address>,
    pub token: Address,
    pub amount: i128,
    pub exchange_rate: i128,
    pub from_crypto: bool,
    pub fiat_currency: FiatCurrency,
    pub payment_method: PaymentMethod,
    pub status: OrderStatus,
    pub created_at: u64,
    pub deadline: u64,
    pub fiat_transfer_deadline: Option<u64>,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum DataKey {
    Config,
    OrderCount,
    Order(u64),
}
````

## File: contracts/contracts/p2p/src/contract.rs
````rust
use soroban_sdk::{contract, contractimpl, Address, Env};

use crate::core::{AdminManager, DisputeManager, OrderManager};
use crate::error::ContractError;
use crate::events::handler::{
    DisputeResolved, FiatPaymentConfirmed, FiatPaymentDisputed, FiatPaymentSubmitted,
    FiatTransferTimeout, Initialized, OrderCancelled, OrderCreated, OrderTaken, PausedEvt,
    UnpausedEvt,
};
use crate::storage::types::{Config, FiatCurrency, Order, PaymentMethod};

#[contract]
pub struct P2PContract;

#[contractimpl]
impl P2PContract {
    pub fn __constructor() {}

    pub fn initialize(
        e: Env,
        admin: Address,
        dispute_resolver: Address,
        pauser: Address,
        token: Address,
        max_duration_secs: u64,
        filler_payment_timeout_secs: u64,
    ) -> Result<(), ContractError> {
        admin.require_auth();
        let config = AdminManager::initialize(
            &e,
            admin,
            dispute_resolver,
            pauser,
            token,
            max_duration_secs,
            filler_payment_timeout_secs,
        )?;

        Initialized {
            admin: config.admin,
            dispute_resolver: config.dispute_resolver,
            pauser: config.pauser,
            token: config.token,
        }
        .publish(&e);

        Ok(())
    }

    pub fn pause(e: Env, caller: Address) -> Result<(), ContractError> {
        AdminManager::pause(&e, caller.clone())?;
        PausedEvt { by: caller }.publish(&e);
        Ok(())
    }

    pub fn unpause(e: Env, caller: Address) -> Result<(), ContractError> {
        AdminManager::unpause(&e, caller.clone())?;
        UnpausedEvt { by: caller }.publish(&e);
        Ok(())
    }

    pub fn create_order(
        e: Env,
        caller: Address,
        fiat_currency: FiatCurrency,
        payment_method: PaymentMethod,
        from_crypto: bool,
        amount: i128,
        exchange_rate: i128,
        duration_secs: u64,
    ) -> Result<u64, ContractError> {
        let order = OrderManager::create_order(
            &e,
            caller,
            fiat_currency,
            payment_method,
            from_crypto,
            amount,
            exchange_rate,
            duration_secs,
        )?;

        OrderCreated {
            order_id: order.order_id,
            creator: order.creator,
            amount: order.amount,
            from_crypto: order.from_crypto,
        }
        .publish(&e);

        Ok(order.order_id)
    }

    pub fn cancel_order(e: Env, caller: Address, order_id: u64) -> Result<(), ContractError> {
        let order = OrderManager::cancel_order(&e, caller.clone(), order_id)?;
        OrderCancelled {
            order_id,
            cancelled_by: caller,
        }
        .publish(&e);

        let _ = order;
        Ok(())
    }

    pub fn take_order(e: Env, caller: Address, order_id: u64) -> Result<(), ContractError> {
        let _order = OrderManager::take_order(&e, caller.clone(), order_id)?;
        OrderTaken {
            order_id,
            filler: caller,
        }
        .publish(&e);
        Ok(())
    }

    pub fn submit_fiat_payment(
        e: Env,
        caller: Address,
        order_id: u64,
    ) -> Result<(), ContractError> {
        let _order = OrderManager::submit_fiat_payment(&e, caller.clone(), order_id)?;
        FiatPaymentSubmitted {
            order_id,
            submitted_by: caller,
        }
        .publish(&e);
        Ok(())
    }

    pub fn execute_fiat_transfer_timeout(
        e: Env,
        caller: Address,
        order_id: u64,
    ) -> Result<(), ContractError> {
        let _order = OrderManager::execute_fiat_transfer_timeout(&e, caller.clone(), order_id)?;
        FiatTransferTimeout {
            order_id,
            executed_by: caller,
        }
        .publish(&e);
        Ok(())
    }

    pub fn confirm_fiat_payment(
        e: Env,
        caller: Address,
        order_id: u64,
    ) -> Result<(), ContractError> {
        let _order = OrderManager::confirm_fiat_payment(&e, caller.clone(), order_id)?;
        FiatPaymentConfirmed {
            order_id,
            confirmed_by: caller,
        }
        .publish(&e);
        Ok(())
    }

    pub fn dispute_fiat_payment(
        e: Env,
        caller: Address,
        order_id: u64,
    ) -> Result<(), ContractError> {
        let _order = DisputeManager::dispute_fiat_payment(&e, caller.clone(), order_id)?;
        FiatPaymentDisputed {
            order_id,
            disputed_by: caller,
        }
        .publish(&e);
        Ok(())
    }

    pub fn resolve_dispute(
        e: Env,
        caller: Address,
        order_id: u64,
        fiat_transfer_confirmed: bool,
    ) -> Result<(), ContractError> {
        let _order =
            DisputeManager::resolve_dispute(&e, caller.clone(), order_id, fiat_transfer_confirmed)?;
        DisputeResolved {
            order_id,
            resolved_by: caller,
            fiat_transfer_confirmed,
        }
        .publish(&e);
        Ok(())
    }

    pub fn get_order(e: Env, order_id: u64) -> Result<Order, ContractError> {
        OrderManager::get_order(&e, order_id)
    }

    pub fn get_order_count(e: Env) -> Result<u64, ContractError> {
        AdminManager::get_order_count(&e)
    }

    pub fn get_config(e: Env) -> Result<Config, ContractError> {
        AdminManager::get_config(&e)
    }
}
````

## File: contracts/contracts/p2p/src/error.rs
````rust
use core::fmt;
use soroban_sdk::contracterror;

#[derive(Debug, Copy, Clone, PartialEq)]
#[contracterror]
pub enum ContractError {
    InvalidAmount = 1,
    InvalidExchangeRate = 2,
    InvalidDuration = 3,
    OrderNotFound = 4,
    InvalidOrderStatus = 5,
    Unauthorized = 6,
    OrderExpired = 7,
    FiatTransferHasNotExpired = 8,
    AlreadyInitialized = 9,
    ConfigNotInitialized = 10,
    Paused = 11,
    AlreadyPaused = 12,
    AlreadyUnpaused = 13,
    MissingFiller = 14,
    Overflow = 15,
    Underflow = 16,
    DivisionError = 17,
    InvalidTimeout = 18,
    InvalidAddress = 19,
}

impl fmt::Display for ContractError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ContractError::InvalidAmount => write!(f, "Amount must be greater than zero"),
            ContractError::InvalidExchangeRate => {
                write!(f, "Exchange rate must be greater than zero")
            }
            ContractError::InvalidDuration => write!(f, "Invalid order duration"),
            ContractError::OrderNotFound => write!(f, "Order not found"),
            ContractError::InvalidOrderStatus => write!(f, "Invalid order status"),
            ContractError::Unauthorized => write!(f, "Unauthorized operation"),
            ContractError::OrderExpired => write!(f, "Order has expired"),
            ContractError::FiatTransferHasNotExpired => {
                write!(f, "Fiat transfer deadline has not expired")
            }
            ContractError::AlreadyInitialized => write!(f, "Contract is already initialized"),
            ContractError::ConfigNotInitialized => write!(f, "Contract is not initialized"),
            ContractError::Paused => write!(f, "Contract is paused"),
            ContractError::AlreadyPaused => write!(f, "Contract is already paused"),
            ContractError::AlreadyUnpaused => write!(f, "Contract is already unpaused"),
            ContractError::MissingFiller => write!(f, "Order filler is missing"),
            ContractError::Overflow => write!(f, "Overflow"),
            ContractError::Underflow => write!(f, "Underflow"),
            ContractError::DivisionError => write!(f, "Division error"),
            ContractError::InvalidTimeout => write!(f, "Invalid timeout configuration"),
            ContractError::InvalidAddress => write!(f, "Invalid address"),
        }
    }
}
````

## File: contracts/contracts/p2p/src/lib.rs
````rust
#![no_std]

mod contract;
mod core {
    pub mod admin;
    pub mod dispute;
    pub mod order;

    pub use admin::*;
    pub use dispute::*;
    pub use order::*;

    pub mod validators {
        pub mod admin;
        pub mod dispute;
        pub mod order;
    }
}
mod error;
mod events {
    pub mod handler;
}

mod storage {
    pub mod types;
}
mod tests {
    #[cfg(test)]
    mod test;
}

pub use crate::contract::P2PContract;
````

## File: contracts/contracts/p2p/Cargo.toml
````toml
[package]
name = "p2p"
version = "0.0.0"
edition = "2021"
publish = false

[lib]
crate-type = ["cdylib"]

[dependencies]
soroban-sdk = { workspace = true }
soroban-token-sdk = { workspace = true }

[dev-dependencies]
soroban-sdk = { workspace = true, features = ["testutils"] }
soroban-token-sdk = { workspace = true }
````

## File: contracts/Cargo.toml
````toml
[workspace]
resolver = "2"
members = [
"contracts/*",
]

[workspace.dependencies]
soroban-sdk = "23.1.1"
soroban-token-sdk = { version = "23.1.1" }

[profile.release]
opt-level = "z"
overflow-checks = true
debug = 0
strip = "symbols"
debug-assertions = false
panic = "abort"
codegen-units = 1
lto = true

# For more información sobre este perfil ve https://soroban.stellar.org/docs/basic-tutorials/logging#cargotoml-profile
[profile.release-with-logs]
inherits = "release"
debug-assertions = true
````

## File: contracts/Makefile
````
SHELL := /bin/bash

NETWORK ?= testnet
SOURCE ?= alice
STELLAR ?= stellar

ARTIFACTS_DIR ?= .artifacts
NETWORK_ARTIFACTS_DIR := $(ARTIFACTS_DIR)/$(NETWORK)

ESCROW_WASM_PATH ?= target/wasm32v1-none/release/escrow.wasm
ESCROW_WASM_HASH_FILE ?= $(NETWORK_ARTIFACTS_DIR)/escrow_wasm_hash.txt
ESCROW_CONTRACT_ID_FILE ?= $(NETWORK_ARTIFACTS_DIR)/escrow_contract_id.txt
ESCROW_PAYLOAD_FILE ?= $(NETWORK_ARTIFACTS_DIR)/escrow_init_payload.json

ENGAGEMENT_ID ?=
TITLE ?=
DESCRIPTION ?=
AMOUNT ?=
PLATFORM_FEE_BPS ?=
TOKEN_CONTRACT_ID ?=
APPROVER ?=
SERVICE_PROVIDER ?=
PLATFORM_ADDRESS ?=
RELEASE_SIGNER ?=
DISPUTE_RESOLVER ?=
RECEIVER ?=
RECEIVER_MEMO ?= 0
MILESTONES_JSON ?=

define require_var
	@if [[ -z "$(${1})" ]]; then \
		echo "Missing required variable: ${1}"; \
		exit 1; \
	fi
endef

.PHONY: help check-tools check-stellar check-python contract-build contract-install-escrow escrow-deploy escrow-build-payload escrow-init escrow-get run-simple-escrow-flow clean-artifacts

help:
	@echo "Peerlypay Stellar escrow commands (2-step deploy + initialize)"
	@echo
	@echo "Core flow:"
	@echo "  make contract-build"
	@echo "  make contract-install-escrow NETWORK=testnet SOURCE=alice"
	@echo "  make escrow-deploy NETWORK=testnet SOURCE=alice"
	@echo "  make escrow-build-payload NETWORK=testnet ..."
	@echo "  make escrow-init NETWORK=testnet SOURCE=alice"
	@echo
	@echo "Helpers:"
	@echo "  make escrow-get NETWORK=testnet SOURCE=alice"
	@echo "  make run-simple-escrow-flow"
	@echo "  make clean-artifacts"

check-tools: check-stellar check-python

check-stellar:
	@command -v $(STELLAR) >/dev/null 2>&1 || (echo "stellar CLI not found" && exit 1)

check-python:
	@command -v python3 >/dev/null 2>&1 || (echo "python3 not found" && exit 1)

contract-build: check-stellar
	@$(STELLAR) contract build
	@if [[ ! -f "$(ESCROW_WASM_PATH)" ]]; then \
		echo "Expected wasm not found at $(ESCROW_WASM_PATH)"; \
		echo "Update ESCROW_WASM_PATH if your output path differs."; \
		exit 1; \
	fi
	@echo "Built wasm: $(ESCROW_WASM_PATH)"

contract-install-escrow: check-stellar
	@mkdir -p "$(NETWORK_ARTIFACTS_DIR)"
	@if [[ ! -f "$(ESCROW_WASM_PATH)" ]]; then \
		echo "Wasm not found at $(ESCROW_WASM_PATH). Run make contract-build first."; \
		exit 1; \
	fi
	@HASH="$$( $(STELLAR) contract install --network "$(NETWORK)" --source "$(SOURCE)" --wasm "$(ESCROW_WASM_PATH)" )"; \
	if [[ -z "$$HASH" ]]; then \
		echo "Failed to obtain wasm hash"; \
		exit 1; \
	fi; \
	echo "$$HASH" | tee "$(ESCROW_WASM_HASH_FILE)" >/dev/null; \
	echo "Installed escrow wasm hash: $$HASH"

escrow-deploy: check-stellar
	@mkdir -p "$(NETWORK_ARTIFACTS_DIR)"
	@WASM_HASH="$${ESCROW_WASM_HASH:-}"; \
	if [[ -z "$$WASM_HASH" && -f "$(ESCROW_WASM_HASH_FILE)" ]]; then \
		WASM_HASH="$$(cat "$(ESCROW_WASM_HASH_FILE)")"; \
	fi; \
	if [[ -z "$$WASM_HASH" ]]; then \
		echo "Missing ESCROW_WASM_HASH and no cached hash file found at $(ESCROW_WASM_HASH_FILE)"; \
		exit 1; \
	fi; \
	CONTRACT_ID="$$( $(STELLAR) contract deploy --network "$(NETWORK)" --source "$(SOURCE)" --wasm-hash "$$WASM_HASH" )"; \
	if [[ -z "$$CONTRACT_ID" ]]; then \
		echo "Failed to deploy escrow contract"; \
		exit 1; \
	fi; \
	echo "$$CONTRACT_ID" | tee "$(ESCROW_CONTRACT_ID_FILE)" >/dev/null; \
	echo "Deployed escrow contract id: $$CONTRACT_ID"

escrow-build-payload: check-python
	$(call require_var,ENGAGEMENT_ID)
	$(call require_var,TITLE)
	$(call require_var,DESCRIPTION)
	$(call require_var,AMOUNT)
	$(call require_var,PLATFORM_FEE_BPS)
	$(call require_var,TOKEN_CONTRACT_ID)
	$(call require_var,APPROVER)
	$(call require_var,SERVICE_PROVIDER)
	$(call require_var,PLATFORM_ADDRESS)
	$(call require_var,RELEASE_SIGNER)
	$(call require_var,DISPUTE_RESOLVER)
	$(call require_var,RECEIVER)
	@mkdir -p "$(NETWORK_ARTIFACTS_DIR)"
	@python3 scripts/build_escrow_payload.py \
		--engagement-id "$(ENGAGEMENT_ID)" \
		--title "$(TITLE)" \
		--description "$(DESCRIPTION)" \
		--amount "$(AMOUNT)" \
		--platform-fee-bps "$(PLATFORM_FEE_BPS)" \
		--token-contract-id "$(TOKEN_CONTRACT_ID)" \
		--approver "$(APPROVER)" \
		--service-provider "$(SERVICE_PROVIDER)" \
		--platform-address "$(PLATFORM_ADDRESS)" \
		--release-signer "$(RELEASE_SIGNER)" \
		--dispute-resolver "$(DISPUTE_RESOLVER)" \
		--receiver "$(RECEIVER)" \
		--receiver-memo "$(RECEIVER_MEMO)" \
		--milestones-json '$(MILESTONES_JSON)' \
		--output "$(ESCROW_PAYLOAD_FILE)"
	@echo "Wrote payload: $(ESCROW_PAYLOAD_FILE)"

escrow-init: check-tools
	@CONTRACT_ID="$${ESCROW_CONTRACT_ID:-}"; \
	if [[ -z "$$CONTRACT_ID" && -f "$(ESCROW_CONTRACT_ID_FILE)" ]]; then \
		CONTRACT_ID="$$(cat "$(ESCROW_CONTRACT_ID_FILE)")"; \
	fi; \
	if [[ -z "$$CONTRACT_ID" ]]; then \
		echo "Missing ESCROW_CONTRACT_ID and no cached contract id at $(ESCROW_CONTRACT_ID_FILE)"; \
		exit 1; \
	fi; \
	if [[ ! -f "$(ESCROW_PAYLOAD_FILE)" ]]; then \
		echo "Missing payload file $(ESCROW_PAYLOAD_FILE). Run make escrow-build-payload first."; \
		exit 1; \
	fi; \
	PAYLOAD="$$(python3 -c 'import json,sys; print(json.dumps(json.load(open(sys.argv[1])), separators=(",",":")))' "$(ESCROW_PAYLOAD_FILE)")"; \
	$(STELLAR) contract invoke --network "$(NETWORK)" --source "$(SOURCE)" --id "$$CONTRACT_ID" -- initialize_escrow --escrow_properties "$$PAYLOAD"

escrow-get: check-stellar
	@CONTRACT_ID="$${ESCROW_CONTRACT_ID:-}"; \
	if [[ -z "$$CONTRACT_ID" && -f "$(ESCROW_CONTRACT_ID_FILE)" ]]; then \
		CONTRACT_ID="$$(cat "$(ESCROW_CONTRACT_ID_FILE)")"; \
	fi; \
	if [[ -z "$$CONTRACT_ID" ]]; then \
		echo "Missing ESCROW_CONTRACT_ID and no cached contract id at $(ESCROW_CONTRACT_ID_FILE)"; \
		exit 1; \
	fi; \
	$(STELLAR) contract invoke --network "$(NETWORK)" --source "$(SOURCE)" --id "$$CONTRACT_ID" -- get_escrow

run-simple-escrow-flow: check-tools
	@./scripts/run_simple_escrow_flow.sh

clean-artifacts:
	@rm -rf "$(ARTIFACTS_DIR)"
	@echo "Removed $(ARTIFACTS_DIR)"
````

## File: types/user.ts
````typescript
export type UserRole = 'FREELANCER' | 'MARKET_MAKER';

export interface User {
  id: string;
  walletAddress: string;
  role: UserRole;
  createdAt: Date;
}
````

## File: AGENTS.md
````markdown
# AGENTS.md

Guidance for coding agents working in `peerlypay-stellar`.
This repo has two primary parts:
- Next.js 16 + TypeScript frontend at repository root.
- Soroban Rust smart contract workspace in `contracts/`.

## 1) Build, Lint, and Test Commands

Run commands from the correct directory.

### Frontend (repo root)
- Install deps: `npm install`
- Dev server: `npm run dev`
- Production build: `npm run build`
- Start production server: `npm run start`
- Lint: `npm run lint`

Notes:
- `package.json` currently defines no frontend unit/integration test script.
- If you add tests, also add documented commands here.

### Smart contracts (`contracts/` workspace)
- Build all contracts: `cargo build`
- Run all contract tests: `cargo test`
- Run tests with logs: `cargo test -- --nocapture`
- Run release build: `cargo build --release`

### Single-test execution (important)
- Run one exact Rust test by name:
  - `cargo test test_release_funds_successful_flow -- --exact --nocapture`
- Run tests matching a substring:
  - `cargo test dispute_resolution -- --nocapture`
- Run tests for one crate from workspace root:
  - `cargo test -p escrow test_dispute_management -- --exact --nocapture`
- If already inside `contracts/contracts/escrow`, same command works without `-p`.

### Soroban CLI commands (from `contracts/README.md`)
- Build contract wasm: `stellar contract build`
- Install wasm to network:
  - `stellar contract install --network <network> --source <source_account> --wasm <path_to_wasm>`
- Deploy by wasm hash:
  - `stellar contract deploy --wasm-hash <wasm_hash> --source <source_account> --network <network>`

Use these only when deployment/network work is requested.

## 2) Code Style and Engineering Guidelines

Follow existing patterns in this repository. Prefer minimal, consistent changes.

### General
- Keep changes scoped and task-focused; avoid unrelated refactors.
- Do not introduce new dependencies unless needed.
- Prefer explicit, readable code over clever shortcuts.
- Preserve current architecture (App Router + Zustand + Soroban module layout).

### TypeScript / Next.js
- Language level: strict TypeScript style with explicit domain types.
- Prefer `type`/`interface` in `types/index.ts` and shared modules.
- Avoid `any`; use unions, discriminated unions, and concrete interfaces.
- Use `@/` path alias imports for internal modules.
- Keep React components functional and hook-based.

### Imports
- Group imports in this order:
  1. React/Next imports
  2. Third-party libraries
  3. Internal `@/` imports
  4. Type-only imports (or inline via `import type`)
- Keep imports stable and avoid deep relative traversals when `@/` exists.

### Formatting and file hygiene
- Match the existing formatting style in touched files; avoid one-off formatting changes.
- Keep function bodies short and extract helpers when a block becomes hard to scan.
- Prefer early returns for validation and guard clauses.
- Avoid dead code, commented-out blocks, and leftover debug logs.
- Keep component props and return types explicit when non-trivial.
- Do not mix unrelated concerns in one file (UI, data fetching, and domain logic).

### Naming conventions
- Components: `PascalCase` (`CreateOrderForm`, `OrderDetailClient`).
- Variables/functions: `camelCase`.
- Constants: `UPPER_SNAKE_CASE` for true constants (`SKELETON_COUNT`).
- Types/interfaces/enums: `PascalCase`.
- Route files follow Next.js conventions (`page.tsx`, `layout.tsx`).

### React and state
- Keep page components thin; extract reusable UI to `components/`.
- Use Zustand store selectors (`useStore((s) => s.orders)`) to limit rerenders.
- Memoize derived collections when non-trivial (`useMemo`).
- Prefer deterministic UI state transitions over ad hoc side effects.

### Styling
- Use existing Tailwind utility patterns and design tokens from `globals.css`.
- Reuse shadcn/ui primitives in `components/ui/` before creating new primitives.
- Maintain mobile-first layout conventions used across pages.

### Error handling (frontend)
- Validate user input before mutating state or sending transactions.
- Fail fast with clear user feedback (toasts, inline hints).
- Do not swallow errors silently; at minimum log actionable context.
- Keep user-facing messages concise and non-technical.

### Rust / Soroban contract style
- Keep business logic in manager modules (`core/*`) and checks in validators.
- Add/extend `ContractError` variants instead of using generic failures.
- Use `Result<_, ContractError>` consistently for fallible logic.
- Enforce auth with `require_auth()` at function boundaries.
- Emit events for state-changing operations.
- Use safe math helpers already provided in `modules/math` and `modules/fee`.

### Rust naming and structure
- Types/structs/enums: `PascalCase`.
- Functions/modules/files: `snake_case`.
- Keep validator function names explicit (`validate_*_conditions`).
- Keep contract entrypoints thin; delegate logic to managers.

### Testing expectations
- Prefer adding/adjusting tests with any logic change in `contracts`.
- Reuse existing test setup patterns from `contracts/contracts/escrow/src/tests/test.rs`.
- For bug fixes, add a regression test named after the behavior.
- Run targeted test(s) first, then broader suites when practical.

### Documentation and comments
- Add comments only for non-obvious rules/invariants.
- Keep README/contract docs aligned with implemented behavior.
- If adding commands or workflows, update this file and relevant README.

## 3) Repository-Specific Observations

- Frontend currently uses mocked wallet/order flows in Zustand.
- Contract module has real validation and fee/dispute logic with tests.
- Large UI files (for example order detail) should be refactored only when requested.

## 4) Cursor/Copilot Rules

Checked for repository-level agent instruction files:
- `.cursor/rules/`: not present.
- `.cursorrules`: not present.
- `.github/copilot-instructions.md`: not present.

If these files are added later, treat them as authoritative and merge their guidance here.

## 5) Safe Change Checklist for Agents

- Confirm target directory before running commands.
- Run lint/build/tests relevant to touched code.
- Do not commit secrets or environment-specific credentials.
- Avoid destructive git operations unless explicitly requested.
- Summarize what changed, why, and how it was verified.
````

## File: app/marketplace/MarketplaceContent.tsx
````typescript
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ArrowUpDown,
  Filter,
  Star,
  TrendingUp,
  Clock,
  BarChart3,
  ChevronDown,
  X,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import OrderCard from '@/components/OrderCard';
import OrderCardSkeleton from '@/components/OrderCardSkeleton';
import EmptyState from '@/components/EmptyState';
import FadeIn from '@/components/FadeIn';
import { Button } from '@/components/ui/button';

type TabType = 'buy' | 'sell';
type SortType = 'best_rate' | 'newest' | 'volume';

const SKELETON_COUNT = 4;

// Sort options configuration
const sortOptions: { value: SortType; label: string; icon: typeof TrendingUp }[] = [
  { value: 'best_rate', label: 'Best Rate', icon: TrendingUp },
  { value: 'newest', label: 'Newest', icon: Clock },
  { value: 'volume', label: 'Volume', icon: BarChart3 },
];

export default function MarketplaceContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('type') as TabType) || 'buy';

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [sortBy, setSortBy] = useState<SortType>('best_rate');
  const [minAmount, setMinAmount] = useState<number | null>(null);
  const [minReputation, setMinReputation] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const orders = useStore((s) => s.orders);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    // User wants to buy -> show sell orders; wants to sell -> show buy orders
    let result = orders.filter((order) => {
      if (activeTab === 'buy') {
        return order.type === 'sell' && order.status === 'open';
      } else {
        return order.type === 'buy' && order.status === 'open';
      }
    });

    // Apply amount filter
    if (minAmount !== null) {
      result = result.filter((order) => order.amount >= minAmount);
    }

    // Apply reputation filter
    if (minReputation !== null) {
      result = result.filter((order) => (order.reputation_score ?? 0) >= minReputation);
    }

    // Apply sorting
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'best_rate':
          // For buyers: lower rate is better; for sellers: higher rate is better
          return activeTab === 'buy' ? a.rate - b.rate : b.rate - a.rate;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'volume':
          return b.amount - a.amount;
        default:
          return 0;
      }
    });

    return result;
  }, [orders, activeTab, sortBy, minAmount, minReputation]);

  const hasActiveFilters = minAmount !== null || minReputation !== null;

  const clearFilters = () => {
    setMinAmount(null);
    setMinReputation(null);
  };

  const currentSortOption = sortOptions.find((o) => o.value === sortBy);

  return (
    <>
      {/* Page title */}
      <h1 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-space-grotesk)] mb-6">
          Marketplace
        </h1>

        {/* Tabs - underline style */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('buy')}
            className={`flex-1 py-3 text-sm font-semibold transition-all border-b-2 -mb-px ${
              activeTab === 'buy'
                ? 'text-[var(--color-primary-500)] border-[var(--color-primary-500)]'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            Buy USDC
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sell')}
            className={`flex-1 py-3 text-sm font-semibold transition-all border-b-2 -mb-px ${
              activeTab === 'sell'
                ? 'text-[var(--color-primary-500)] border-[var(--color-primary-500)]'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            Sell USDC
          </button>
        </div>

        {/* Filter & Sort bar */}
        <div className="flex items-center gap-2 mb-4">
          {/* Sort dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <ArrowUpDown className="w-4 h-4" />
              {currentSortOption?.label}
              <ChevronDown className={`w-4 h-4 transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
            </button>

            {showSortMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowSortMenu(false)}
                />
                <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-20 min-w-[160px]">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setSortBy(option.value);
                        setShowSortMenu(false);
                      }}
                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors ${
                        sortBy === option.value
                          ? 'bg-gray-100 text-gray-900 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <option.icon className="w-4 h-4" />
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Filter button */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              hasActiveFilters
                ? 'bg-[var(--color-primary-100)] text-[var(--color-primary-700)]'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="w-5 h-5 flex items-center justify-center bg-[var(--color-primary-500)] text-white text-xs rounded-full">
                {(minAmount !== null ? 1 : 0) + (minReputation !== null ? 1 : 0)}
              </span>
            )}
          </button>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1 px-2 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}

          {/* Results count */}
          <span className="ml-auto text-sm text-gray-500">
            {filteredOrders.length} offers
          </span>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <FadeIn>
            <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-4">
              {/* Min amount filter */}
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
                  Minimum Amount (USDC)
                </label>
                <div className="flex gap-2">
                  {[null, 50, 100, 200, 500].map((amount) => (
                    <button
                      key={amount ?? 'any'}
                      type="button"
                      onClick={() => setMinAmount(amount)}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        minAmount === amount
                          ? 'bg-[var(--color-primary-500)] text-white'
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {amount === null ? 'Any' : `${amount}+`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Min reputation filter */}
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
                  Minimum Reputation
                </label>
                <div className="flex gap-2">
                  {[null, 10, 25, 50, 100].map((rep) => (
                    <button
                      key={rep ?? 'any'}
                      type="button"
                      onClick={() => setMinReputation(rep)}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        minReputation === rep
                          ? 'bg-[var(--color-primary-500)] text-white'
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {rep === null ? (
                        'Any'
                      ) : (
                        <span className="flex items-center justify-center gap-1">
                          <Star className="w-3 h-3" />
                          {rep}+
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        )}

        {/* Orders list */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <OrderCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order, index) => (
              <FadeIn key={order.id} delay={index * 0.03}>
                <OrderCard order={order} />
              </FadeIn>
            ))}
          </div>
        ) : (
          <FadeIn>
            <EmptyState
              title="No offers match your filters"
              description={
                hasActiveFilters
                  ? 'Try adjusting your filters to see more offers'
                  : 'Check back later or create your own order'
              }
            />
            {hasActiveFilters && (
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="rounded-xl"
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </FadeIn>
        )}
    </>
  );
}
````

## File: app/marketplace/page.tsx
````typescript
import { Suspense } from 'react';
import MarketplaceContent from './MarketplaceContent';

// Loading fallback component
function MarketplaceLoading() {
  return (
    <>
      <div className="h-8 w-40 bg-gray-200 rounded-lg mb-6 animate-pulse" />
      <div className="flex border-b border-gray-200 mb-4">
        <div className="flex-1 py-3 flex justify-center">
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="flex-1 py-3 flex justify-center">
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    </>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<MarketplaceLoading />}>
      <MarketplaceContent />
    </Suspense>
  );
}
````

## File: app/orders/[id]/ChatBox.tsx
````typescript
'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
}

export interface ChatBoxProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
}

function shortenAddress(address: string): string {
  if (address.length <= 14) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export default function ChatBox({
  messages,
  onSendMessage,
}: ChatBoxProps) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserAddress = useStore((s) => s.user.walletAddress);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setInputText('');
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 transition-all duration-200">
      <header className="mb-4 flex items-center gap-2">
        <MessageSquare className="size-5 text-gray-600 shrink-0" />
        <h3 className="text-h5 text-gray-800 font-display">Chat</h3>
      </header>

      <div className="max-h-80 space-y-3 overflow-y-auto">
        {messages.map((msg) => {
          const isSystem = msg.sender === 'system';
          const isOwn = !isSystem && currentUserAddress !== null && msg.sender === currentUserAddress;
          return (
            <div
              key={msg.id}
              className={`rounded-lg px-3 py-2 animate-in fade-in duration-200 ${
                isSystem
                  ? 'mx-0 max-w-full bg-primary-50 border border-primary-100 text-left'
                  : isOwn
                    ? 'ml-auto max-w-5/6 bg-magenta/10 text-right'
                    : 'mr-auto max-w-5/6 bg-gray-50 text-left'
              }`}
            >
              <p className="mb-1 text-xs text-gray-500">
                {isSystem ? 'PeerlyPay' : shortenAddress(msg.sender)}
              </p>
              <p className="text-sm">{msg.text}</p>
              <p className="mt-1 text-xs text-gray-400">{formatTime(msg.timestamp)}</p>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4 flex gap-2">
        <Input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message..."
          className="flex-1 rounded-lg border-gray-200"
        />
        <Button
          type="button"
          onClick={handleSend}
          className="shrink-0 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:opacity-90 transition-all duration-200"
          aria-label="Send message"
        >
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
}
````

## File: app/orders/[id]/EscrowStepper.tsx
````typescript
'use client';

import { Check, Clock, Wallet } from 'lucide-react';
import type { OrderStatus } from '@/types';

export interface EscrowStepperProps {
  /** 0 = Setup, 1 = Deposit, 2 = Payment, 3 = Confirm, 4 = Complete */
  currentStep: number;
  orderStatus: OrderStatus;
}

const steps = [
  { number: 0, label: 'Setup', description: 'Activate USDC Trustline', Icon: Wallet },
  { number: 1, label: 'Deposit', description: 'Funds locked in escrow', Icon: Clock },
  { number: 2, label: 'Payment', description: 'Buyer sends fiat', Icon: Clock },
  { number: 3, label: 'Confirm', description: 'Seller confirms receipt', Icon: Clock },
  { number: 4, label: 'Complete', description: 'USDC released', Icon: Clock },
];

export default function EscrowStepper({ currentStep }: EscrowStepperProps) {
  return (
    <div className="relative flex w-full items-start gap-0">
      {/* Connecting line (full track) */}
      <div
        className="absolute left-0 right-0 top-6 border-t-2 border-gray-200"
        style={{ marginLeft: '20px', marginRight: '20px', width: 'calc(100% - 40px)' }}
        aria-hidden
      />

      {/* Progress line (filled up to current step) */}
      <div
        className="absolute left-0 top-6 border-t-2 border-lime-500 transition-all duration-300"
        style={{
          marginLeft: '20px',
          width:
            currentStep <= 0
              ? '0'
              : `calc((100% - 40px) * ${currentStep / 4})`,
        }}
        aria-hidden
      />

      {steps.map((step) => {
        const isCompleted = step.number < currentStep;
        const isActive = step.number === currentStep;
        const isPending = step.number > currentStep;
        const Icon = step.Icon;

        return (
          <div
            key={step.number}
            className="relative z-10 flex flex-1 flex-col items-center min-w-0"
          >
            <div
              className={`
                flex h-10 w-10 shrink-0 items-center justify-center rounded-full
                ${isCompleted ? 'bg-lime-500 text-white' : ''}
                ${isActive ? 'bg-primary-500 text-white animate-pulse' : ''}
                ${isPending ? 'bg-gray-200 text-gray-400' : ''}
              `}
            >
              {isCompleted ? (
                <Check className="size-5" />
              ) : isActive ? (
                <Icon className="size-5" />
              ) : (
                <span className="text-sm font-semibold">{step.number + 1}</span>
              )}
            </div>
            <span className="mt-1.5 text-center text-xs font-semibold truncate w-full px-0.5">
              {step.label}
            </span>
            <span className="mt-0.5 w-full truncate px-0.5 text-center text-2xs leading-tight text-gray-500">
              {step.description}
            </span>
          </div>
        );
      })}
    </div>
  );
}
````

## File: app/orders/create/CreateOrderClient.tsx
````typescript
'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@crossmint/client-sdk-react-ui';
import { Wallet, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import FadeIn from '@/components/FadeIn';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import CreateOrderForm from './CreateOrderForm';
import OrderTypeSelector from './OrderTypeSelector';

export default function CreateOrderClient() {
  const searchParams = useSearchParams();
  const user = useStore((s) => s.user);
  const { login } = useAuth();
  const initialType = (searchParams.get('type') as 'buy' | 'sell') || 'sell';
  const [orderType, setOrderType] = useState<'buy' | 'sell'>(initialType);
  const [isConnecting, setIsConnecting] = useState(false);

  const isWalletReady = user.isConnected && Boolean(user.walletAddress);

  const handleConnectWallet = async () => {
    setIsConnecting(true);

    try {
      await login();
      toast.success('Crossmint login iniciado');
    } catch {
      toast.error('No se pudo iniciar el login');
    } finally {
      setIsConnecting(false);
    }
  };

  if (!isWalletReady) {
    return (
      <FadeIn>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="font-display text-xl font-semibold text-amber-900">Connect your wallet first</p>
          <p className="mt-2 text-sm text-amber-800">
            You need an active Stellar wallet to create orders.
          </p>
          <Button
            type="button"
            onClick={handleConnectWallet}
            disabled={isConnecting}
            className="mt-4 w-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:opacity-90 disabled:opacity-70"
          >
            {isConnecting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="size-4" />
                Connect Wallet
              </>
            )}
          </Button>
        </div>
      </FadeIn>
    );
  }

  return (
    <>
      <FadeIn>
        <h1 className="text-h3 text-black mb-6">Create Order</h1>
        <OrderTypeSelector selected={orderType} onSelect={setOrderType} />
      </FadeIn>
      <FadeIn delay={0.1}>
        <CreateOrderForm orderType={orderType} />
      </FadeIn>
    </>
  );
}
````

## File: app/orders/mine/page.tsx
````typescript
'use client';

import { useState, useMemo } from 'react';
import { Package } from 'lucide-react';
import { useStore } from '@/lib/store';
import OrderCard from '@/components/OrderCard';
import EmptyState from '@/components/EmptyState';
import type { Order } from '@/types';

type TabType = 'active' | 'completed' | 'disputed';

function getOrdersForTab(orders: Order[], tab: TabType): Order[] {
  if (tab === 'active') {
    return orders.filter((o) => o.status === 'open' || o.status === 'active');
  }
  if (tab === 'completed') {
    return orders.filter((o) => o.status === 'completed');
  }
  return orders.filter((o) => o.status === 'disputed' || o.status === 'cancelled');
}

export default function MyOrdersPage() {
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const orders = useStore((s) => s.orders);
  const user = useStore((s) => s.user);

  const myOrders = useMemo(
    () =>
      orders.filter(
        (o) => user.walletAddress !== null && o.createdBy === user.walletAddress
      ),
    [orders, user.walletAddress]
  );

  const activeOrders = useMemo(
    () => getOrdersForTab(myOrders, 'active'),
    [myOrders]
  );
  const completedOrders = useMemo(
    () => getOrdersForTab(myOrders, 'completed'),
    [myOrders]
  );
  const disputedOrders = useMemo(
    () => getOrdersForTab(myOrders, 'disputed'),
    [myOrders]
  );

  const filteredOrders = useMemo(() => {
    if (activeTab === 'active') return activeOrders;
    if (activeTab === 'completed') return completedOrders;
    return disputedOrders;
  }, [activeTab, activeOrders, completedOrders, disputedOrders]);

  const meshGradient =
    'radial-gradient(at 0% 0%, rgb(255 182 193 / 60%) 0px, transparent 50%), radial-gradient(at 100% 0%, rgb(173 216 255 / 60%) 0px, transparent 50%), radial-gradient(at 100% 100%, rgb(221 160 255 / 60%) 0px, transparent 50%), radial-gradient(at 0% 100%, rgb(152 251 200 / 50%) 0px, transparent 50%)';
  const borderGradient =
    'linear-gradient(135deg, rgb(255 182 193 / 80%), rgb(173 216 255 / 80%), rgb(221 160 255 / 80%), rgb(152 251 200 / 60%))';

  return (
    <>
      <h1 className="text-h3 text-black mb-6">My Orders</h1>

        {/* Your Reputation */}
      <div
        className="group relative mb-6 cursor-pointer overflow-hidden rounded-xl shadow-balance-card transition-all duration-300 hover:scale-105 hover:shadow-2xl"
        role="button"
        tabIndex={0}
        onClick={() => {}}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLElement).click();
        }}
      >
        <div className="absolute inset-0" style={{ background: meshGradient }} aria-hidden />
        <div className="relative rounded-xl p-0.5" style={{ background: borderGradient }}>
          <div className="rounded-lg border border-white/30 bg-white/55 p-5 backdrop-blur-3xl">
            <p className="mb-2 text-body-sm font-semibold text-gray-800">Your Reputation</p>
            <p className="text-4xl font-display font-bold text-dark-500">
              ⭐ {user.reputation_score ?? 0}
            </p>
            <p className="mt-1 text-body-sm text-gray-700">
              {(user.reputation_score ?? 0)} completed trades
            </p>
          </div>
        </div>
      </div>

        {/* Stats section */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-magenta-600">{activeOrders.length}</p>
            <p className="text-xs font-medium text-gray-500 mt-1">Active</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{completedOrders.length}</p>
            <p className="text-xs font-medium text-gray-500 mt-1">Completed</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{disputedOrders.length}</p>
            <p className="text-xs font-medium text-gray-500 mt-1">Disputed</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-3 rounded-xl font-semibold transition ${
              activeTab === 'active'
                ? 'bg-magenta-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Active
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-3 rounded-xl font-semibold transition ${
              activeTab === 'completed'
                ? 'bg-magenta-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Completed
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('disputed')}
            className={`flex-1 py-3 rounded-xl font-semibold transition ${
              activeTab === 'disputed'
                ? 'bg-magenta-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Disputed
          </button>
        </div>

        {/* Order list or EmptyState */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Package className="w-16 h-16 text-gray-300" />}
            title={
              activeTab === 'active'
                ? 'No active orders. Create an order to get started.'
                : activeTab === 'completed'
                  ? 'No completed orders yet.'
                  : 'No disputed orders.'
            }
          />
        )}
    </>
  );
}
````

## File: components/EmptyState.tsx
````typescript
import { ReactNode } from 'react';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl py-12 px-6 flex flex-col items-center gap-4">
      {icon}
      <p className="text-gray-500 text-base font-medium text-center">{title}</p>
      {description && (
        <p className="text-gray-400 text-sm text-center">{description}</p>
      )}
      {actionText != null && onAction != null && (
        <button
          type="button"
          onClick={onAction}
          className="text-magenta-500 text-sm font-semibold cursor-pointer hover:underline focus:outline-none focus:underline"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
````

## File: components/OrderCard.tsx
````typescript
'use client';

import { useRouter } from 'next/navigation';
import type { Order } from '@/types';

export interface OrderCardProps {
  order: Order;
}

function shortenAddress(address: string): string {
  if (address.length <= 14) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getAddressInitial(address: string): string {
  const hex = address.replace(/^0x/i, '').slice(0, 1);
  return (hex || '?').toUpperCase();
}

export default function OrderCard({ order }: OrderCardProps) {
  const router = useRouter();
  const total = order.amount * order.rate;
  const actionLabel = order.type === 'sell' ? 'Buy Now' : 'Sell Now';

  const handleClick = () => {
    router.push(`/orders/${order.id}`);
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className="cursor-pointer rounded-xl border border-gray-200 bg-white p-4 text-left transition-all duration-200 hover:scale-105 hover:border-primary-200 hover:shadow-lg"
    >
      {/* Row 1: Avatar + username + online */}
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-sm font-display font-bold text-white">
            {getAddressInitial(order.createdBy)}
          </div>
          <span
            className="absolute bottom-0 right-0 h-2 w-2 rounded-full border-2 border-white bg-green-500"
            aria-hidden
          />
        </div>
        <span className="text-base font-semibold text-gray-900 truncate">
          {shortenAddress(order.createdBy)}
        </span>
      </div>

      {/* Row 2: Reputation | Payment window */}
      <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
        <span
          className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2 py-1 text-xs font-semibold text-cyan-700 cursor-pointer hover:bg-cyan-100/80 transition-colors"
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            // Future: show trade history
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') e.stopPropagation();
          }}
        >
          ⭐ {(order.reputation_score ?? 0) === 0 ? 'New trader' : `${order.reputation_score} trades`}
        </span>
        <span aria-hidden>|</span>
        <span>Payment window: {order.duration || '30 min'}</span>
      </div>

      {/* Row 3: Exchange rate - prominent */}
      <p className="mt-2 text-3xl font-display font-bold text-dark-500">
        1 USDC = {order.rate.toLocaleString('en-US')} {order.currency}
      </p>

      {/* Row 4: Limits */}
      <p className="mt-1 text-sm text-gray-600">
        Limits: 10 - {total.toLocaleString('en-US')} {order.currency}
      </p>

      {/* Row 5: Payment methods + compact button */}
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-sm text-gray-700 truncate min-w-0">
          {order.paymentMethod}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          className="shrink-0 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-2.5 text-sm font-display font-bold text-white hover:opacity-90 transition-all duration-200"
        >
          {actionLabel}
        </button>
      </div>
    </article>
  );
}
````

## File: components/QuickTradeInput.tsx
````typescript
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowDownUp,
  Delete,
  Loader2,
  Shield,
  AlertCircle,
  ArrowLeft,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { estimateQuickTrade } from '@/lib/match-order';
import type { OrderType, QuickTradeEstimate } from '@/types';

/** Transaction limit in USDC */
const USDC_LIMIT = 500;

/** Debounce delay for rate calculation (ms) */
const DEBOUNCE_MS = 500;

/**
 * Input mode determines which currency the user is typing in.
 * - 'fiat': user types ARS, we calculate USDC (Comprar USDC flow)
 * - 'usdc': user types USDC, we calculate ARS (Vender USDC flow)
 */
type InputMode = 'fiat' | 'usdc';

function formatFiatCompact(value: number): string {
  return value.toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatUsdc(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ============================================
// NUMERIC KEYPAD
// ============================================
const KEYPAD_KEYS = [
  '1', '2', '3',
  '4', '5', '6',
  '7', '8', '9',
  '.', '0', 'delete',
] as const;

interface NumpadProps {
  onKey: (key: string) => void;
  disabled?: boolean;
}

function Numpad({ onKey, disabled }: NumpadProps) {
  return (
    <div className="grid grid-cols-3 gap-2 px-2">
      {KEYPAD_KEYS.map((key) => (
        <button
          key={key}
          type="button"
          disabled={disabled}
          onClick={() => onKey(key)}
          className={cn(
            'flex items-center justify-center h-[56px] rounded-2xl transition-all active:scale-[0.95]',
            'font-[family-name:var(--font-space-grotesk)] text-[22px] font-semibold',
            key === 'delete'
              ? 'bg-gray-100 text-gray-400 active:bg-gray-200'
              : 'bg-gray-50 text-gray-900 hover:bg-gray-100 active:bg-gray-200',
            disabled && 'opacity-40 pointer-events-none'
          )}
        >
          {key === 'delete' ? (
            <Delete className="size-[22px]" strokeWidth={2} />
          ) : (
            key
          )}
        </button>
      ))}
    </div>
  );
}

// ============================================
// MAIN QUICK TRADE COMPONENT
// ============================================
export default function QuickTradeInput() {
  const router = useRouter();
  const { user, orders } = useStore();
  const [inputMode, setInputMode] = useState<InputMode>('fiat');
  const [inputValue, setInputValue] = useState('');
  const [estimate, setEstimate] = useState<QuickTradeEstimate | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const numericValue = parseFloat(inputValue) || 0;

  // Derive trade type from input mode
  const tradeType: OrderType = inputMode === 'fiat' ? 'buy' : 'sell';

  // Calculate USDC amount
  const usdcAmount = inputMode === 'usdc'
    ? numericValue
    : (estimate ? numericValue / estimate.rate : 0);

  const isOverLimit = usdcAmount > USDC_LIMIT;
  const hasValidAmount = numericValue > 0 && !isOverLimit;

  // Debounced estimate calculation
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setError(null);

    if (numericValue <= 0) {
      setEstimate(null);
      setIsCalculating(false);
      return;
    }

    setIsCalculating(true);

    debounceRef.current = setTimeout(() => {
      if (inputMode === 'usdc') {
        const result = estimateQuickTrade(orders, numericValue, 'sell');
        if (result) {
          setEstimate(result);
          setError(null);
        } else {
          setEstimate(null);
          setError('No hay órdenes disponibles para este monto');
        }
      } else {
        const rateProbe = estimateQuickTrade(orders, 1, 'buy');
        if (rateProbe) {
          const impliedUsdc = numericValue / rateProbe.rate;
          const fullEstimate = estimateQuickTrade(orders, impliedUsdc, 'buy');
          if (fullEstimate) {
            setEstimate(fullEstimate);
            setError(null);
          } else {
            setEstimate(null);
            setError('No hay órdenes disponibles para este monto');
          }
        } else {
          setEstimate(null);
          setError('No hay órdenes disponibles');
        }
      }
      setIsCalculating(false);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [numericValue, inputMode, orders]);

  // Handle numpad key press
  const handleKey = useCallback((key: string) => {
    if (key === 'delete') {
      setInputValue((prev) => prev.slice(0, -1));
      return;
    }

    setInputValue((prev) => {
      if (key === '.' && prev.includes('.')) return prev;
      if (prev.includes('.') && prev.split('.')[1].length >= 2) return prev;
      if (prev.replace('.', '').length >= 8) return prev;
      if (key === '.' && prev === '') return '0.';
      if (prev === '0' && key !== '.') return key;
      return prev + key;
    });
  }, []);

  // Swap input mode
  const handleSwap = useCallback(() => {
    setInputMode((prev) => (prev === 'fiat' ? 'usdc' : 'fiat'));
    setInputValue('');
    setEstimate(null);
    setError(null);
  }, []);

  // Set max amount
  const handleMax = useCallback(() => {
    if (inputMode === 'usdc') {
      const maxUsdc = Math.min(user.balance.usdc, USDC_LIMIT);
      setInputValue(maxUsdc > 0 ? String(maxUsdc) : String(USDC_LIMIT));
    } else {
      const rateProbe = estimateQuickTrade(orders, 1, 'buy');
      if (rateProbe) {
        const maxArs = Math.floor(USDC_LIMIT * rateProbe.rate);
        setInputValue(String(maxArs));
      }
    }
  }, [inputMode, user.balance.usdc, orders]);

  // Clear input
  const handleClear = useCallback(() => {
    setInputValue('');
    setEstimate(null);
    setError(null);
  }, []);

  // Navigate to confirmation page
  const handleContinue = useCallback(() => {
    if (!hasValidAmount) return;

    const amount = inputMode === 'usdc'
      ? numericValue
      : (estimate ? numericValue / estimate.rate : 0);

    if (amount <= 0) return;

    router.push(`/trade/confirm?amount=${amount.toFixed(2)}&type=${tradeType}`);
  }, [hasValidAmount, numericValue, inputMode, tradeType, estimate, router]);

  // ============================================
  // DERIVED DISPLAY VALUES
  // ============================================
  const displayPrimary = inputValue || '0';

  let displaySecondary = '0.00';
  if (estimate && !isCalculating) {
    if (inputMode === 'fiat') {
      displaySecondary = formatUsdc(numericValue / estimate.rate);
    } else {
      displaySecondary = formatFiatCompact(estimate.total);
    }
  }

  // ============================================
  // FULLSCREEN LIGHT UI
  // ============================================
  return (
    <div className="fixed inset-0 z-50 flex flex-col h-dvh bg-white">
      {/* ============================================
          TOP BAR: back + mode label + help
          ============================================ */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <button
          type="button"
          onClick={() => router.push('/quick-trade')}
          className="flex items-center justify-center size-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="size-5 text-gray-600" />
        </button>

        <span className="font-[family-name:var(--font-space-grotesk)] text-sm font-semibold text-gray-500 uppercase tracking-wider">
          {inputMode === 'fiat' ? 'Comprar USDC' : 'Vender USDC'}
        </span>

        <button
          type="button"
          className="flex items-center justify-center size-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <HelpCircle className="size-5 text-gray-400" />
        </button>
      </div>

      {/* ============================================
          AMOUNT DISPLAY AREA (upper portion)
          ============================================ */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-1 min-h-0">
        {/* Primary amount */}
        <div className="flex items-baseline gap-2">
          {inputMode === 'fiat' && (
            <span className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold text-gray-300">
              $
            </span>
          )}
          <span
            className={cn(
              'font-[family-name:var(--font-jetbrains-mono)] font-bold tracking-tight tabular-nums text-gray-900 transition-all',
              displayPrimary.length > 8
                ? 'text-3xl'
                : displayPrimary.length > 5
                  ? 'text-[44px] leading-none'
                  : 'text-[56px] leading-none'
            )}
          >
            {displayPrimary}
          </span>
          {inputMode === 'usdc' && (
            <span className="font-[family-name:var(--font-space-grotesk)] text-xl font-semibold text-gray-300 self-end mb-1.5">
              USDC
            </span>
          )}
        </div>

        {/* Swap button */}
        <button
          type="button"
          onClick={handleSwap}
          className="my-3 flex items-center justify-center size-10 rounded-full bg-gray-100 border border-gray-200 hover:bg-gray-200 active:scale-95 transition-all"
          aria-label="Cambiar moneda"
        >
          <ArrowDownUp className="size-[18px] text-gray-500" strokeWidth={2.5} />
        </button>

        {/* Secondary amount */}
        <div className="flex items-center gap-1.5 h-8">
          {isCalculating && numericValue > 0 ? (
            <div className="flex items-center gap-2 text-gray-400">
              <Loader2 className="size-4 animate-spin" />
              <span className="text-body-sm">Calculando...</span>
            </div>
          ) : (
            <>
              <span className="font-[family-name:var(--font-space-grotesk)] text-lg font-medium text-gray-400">
                {inputMode === 'fiat' ? '≈' : '≈ $'}
              </span>
              <span className="font-[family-name:var(--font-jetbrains-mono)] text-lg font-semibold text-gray-500 tabular-nums">
                {displaySecondary}
              </span>
              <span className="font-[family-name:var(--font-space-grotesk)] text-sm font-medium text-gray-300">
                {inputMode === 'fiat' ? 'USDC' : 'ARS'}
              </span>
            </>
          )}
        </div>

        {/* Rate chip */}
        {estimate && !isCalculating && (
          <div className="mt-2 px-3.5 py-1.5 rounded-full bg-gray-50 border border-gray-200">
            <span className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-gray-500 tabular-nums">
              1 USDC = {formatFiatCompact(estimate.rate)} ARS
            </span>
          </div>
        )}

        {/* Error / over limit */}
        {isOverLimit && (
          <p className="mt-2 flex items-center gap-1.5 text-body-sm text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">
            <AlertCircle className="size-3.5 shrink-0" />
            Excede el límite de {USDC_LIMIT} USDC
          </p>
        )}

        {!isCalculating && error && !isOverLimit && (
          <p className="mt-2 flex items-center gap-1.5 text-body-sm text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
            <AlertCircle className="size-3.5 shrink-0" />
            {error}
          </p>
        )}
      </div>

      {/* ============================================
          BOTTOM SECTION: Limit + Actions + Keypad + CTA
          ============================================ */}
      <div className="px-4 pb-5 space-y-3">
        {/* Transaction limit banner */}
        <button
          type="button"
          className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center size-5 rounded-full bg-fuchsia-100">
              <Shield className="size-3 text-fuchsia-500" />
            </div>
            <span className="font-[family-name:var(--font-dm-sans)] text-xs font-medium text-gray-500">
              Límite: {USDC_LIMIT} USDC
            </span>
          </div>
          <ChevronRight className="size-4 text-gray-300" />
        </button>

        {/* Máx / Limpiar actions */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleMax}
            className="px-4 py-1.5 rounded-full bg-gray-50 border border-gray-200 font-[family-name:var(--font-dm-sans)] text-xs font-semibold text-gray-600 hover:bg-gray-100 active:scale-95 transition-all"
          >
            Máx
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={!inputValue}
            className={cn(
              'px-4 py-1.5 rounded-full bg-gray-50 border border-gray-200 font-[family-name:var(--font-dm-sans)] text-xs font-semibold text-gray-600 hover:bg-gray-100 active:scale-95 transition-all',
              !inputValue && 'opacity-30 pointer-events-none'
            )}
          >
            Limpiar
          </button>
        </div>

        {/* Numpad */}
        <Numpad onKey={handleKey} />

        {/* CTA Button */}
        <button
          type="button"
          onClick={handleContinue}
          disabled={!hasValidAmount || !!error}
          className={cn(
            'w-full h-14 rounded-2xl font-[family-name:var(--font-space-grotesk)] text-base font-bold text-white transition-all active:scale-[0.98]',
            hasValidAmount && !error
              ? 'bg-gradient-to-r from-fuchsia-500 to-purple-600 shadow-lg shadow-fuchsia-500/25 hover:opacity-90'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
          )}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
````

## File: components/WalletButton.tsx
````typescript
'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth, useWallet } from '@crossmint/client-sdk-react-ui';
import { toast } from 'sonner';
import { Wallet, Loader2, Copy, ExternalLink, Power, ChevronDown } from 'lucide-react';
import { useStore } from '@/lib/store';

function shortenAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function WalletButton() {
  const { user, connectWallet, disconnectWallet, setWalletStatus } = useStore();
  const { login, logout, status } = useAuth();
  const { wallet } = useWallet();
  const { isConnected, walletAddress, balance } = user;

  const [isConnecting, setIsConnecting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeWalletAddress = walletAddress ?? wallet?.address ?? null;

  useEffect(() => {
    setWalletStatus(status ?? null);
  }, [setWalletStatus, status]);

  useEffect(() => {
    if (wallet?.address) {
      connectWallet(wallet.address, wallet.owner ?? null, status ?? 'logged-in');
      return;
    }

    if (status === 'logged-out') {
      disconnectWallet();
    }
  }, [connectWallet, disconnectWallet, status, wallet?.address, wallet?.owner]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleConnect = async () => {
    setIsConnecting(true);

    try {
      await login();
      toast.success('Crossmint login iniciado');
    } catch {
      toast.error('No se pudo iniciar el login');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await logout();
      disconnectWallet();
      setIsOpen(false);
      toast.info('Wallet desconectada');
    } catch {
      toast.error('No se pudo cerrar la sesion');
    }
  };

  const handleCopyAddress = async () => {
    if (!activeWalletAddress) {
      toast.error('No wallet address available');
      return;
    }

    await navigator.clipboard.writeText(activeWalletAddress);
    toast.success('Direccion copiada');
    setIsOpen(false);
  };

  const handleOpenExplorer = () => {
    if (!activeWalletAddress) {
      toast.error('No wallet address available');
      return;
    }

    window.open(
      `https://stellar.expert/explorer/testnet/account/${activeWalletAddress}`,
      '_blank'
    );
    setIsOpen(false);
  };

  const formattedBalance = balance.usdc.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // --- Disconnected ---
  if (!isConnected) {
    const isAuthLoading = status === 'initializing' || isConnecting;

    return (
      <button
        disabled={isAuthLoading}
        onClick={handleConnect}
        className="flex items-center gap-2 rounded-lg bg-magenta px-4 py-2 font-sans text-sm font-semibold text-white transition-all duration-200 hover:bg-magenta-600 active:scale-[0.97] disabled:opacity-70"
      >
        {isAuthLoading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            <span>Conectando...</span>
          </>
        ) : (
          <>
            <Wallet className="size-4" />
            <span>Connect Wallet</span>
          </>
        )}
      </button>
    );
  }

  // --- Connected ---
  const displayAddr = activeWalletAddress ? shortenAddress(activeWalletAddress) : '0x...';

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 font-mono text-sm transition-all duration-200 hover:border-gray-300 hover:shadow-sm active:scale-[0.98]"
      >
        <span className="text-yellow-500 text-xs">&#9889;</span>
        <span className="font-semibold text-gray-900">${formattedBalance}</span>
        <span className="text-gray-300">|</span>
        <span className="inline-flex size-2 rounded-full bg-emerald-400" />
        <span className="text-gray-600">{displayAddr}</span>
        <ChevronDown
          className={`size-3.5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 origin-top-right animate-in fade-in slide-in-from-top-2 duration-200 rounded-xl border border-gray-100 bg-white shadow-lg">
          {/* Network badge */}
          <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
            <span className="inline-flex size-2 rounded-full bg-emerald-400" />
            <span className="font-sans text-sm font-medium text-gray-700">
              Stellar Testnet
            </span>
          </div>

          {/* Balance section */}
          <div className="border-b border-gray-100 px-4 py-4">
            <p className="font-sans text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Balance disponible
            </p>
            <p className="mt-1 font-display text-2xl font-bold tracking-tight text-gray-900">
              ${formattedBalance}
            </p>
            <p className="font-mono text-xs text-gray-500">
              ≈ {formattedBalance} USDC
            </p>
          </div>

          {/* Actions */}
          <div className="p-1.5">
            <button
              onClick={handleCopyAddress}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left font-sans text-sm text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Copy className="size-4 text-gray-400" />
              Copiar direccion
            </button>

            <button
              onClick={handleOpenExplorer}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left font-sans text-sm text-gray-700 transition-colors hover:bg-gray-50"
            >
              <ExternalLink className="size-4 text-gray-400" />
              Ver en Explorer
            </button>

            <div className="my-1 border-t border-gray-100" />

            <button
              onClick={handleDisconnect}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left font-sans text-sm text-red-500 transition-colors hover:bg-red-50"
            >
              <Power className="size-4" />
              Desconectar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
````

## File: package.json
````json
{
  "name": "peerlypay",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@crossmint/client-sdk-react-ui": "^2.6.16",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-label": "^2.1.8",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-separator": "^1.1.8",
    "@radix-ui/react-slot": "^1.2.4",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.563.0",
    "next": "16.1.6",
    "next-themes": "^0.4.6",
    "qrcode.react": "^4.2.0",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.4.0",
    "zustand": "^5.0.11"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.1.6",
    "tailwindcss": "^4",
    "tw-animate-css": "^1.4.0",
    "typescript": "^5"
  }
}
````

## File: app/orders/[id]/OrderDetailClient.tsx
````typescript
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AlertTriangle, Copy, Loader2, Check, Star, RefreshCw, Wallet, Banknote, CircleCheck, PartyPopper } from 'lucide-react';
import FadeIn from '@/components/FadeIn';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import ChatBox, { type Message } from './ChatBox';
import EscrowStepper from './EscrowStepper';

const BANK_DETAILS = [
  { label: 'Bank', value: 'Banco Galicia' },
  { label: 'Account', value: '1234-5678-9012' },
  { label: 'CBU', value: '0123456789012345678901' },
  { label: 'Name', value: 'Juan Pérez' },
];

function addSystemMessage(messages: Message[], text: string): Message[] {
  return [
    ...messages,
    {
      id: `sys-${Date.now()}`,
      sender: 'system',
      text,
      timestamp: new Date(),
    },
  ];
}

interface OrderDetailClientProps {
  orderId: string;
}

export default function OrderDetailClient({ orderId }: OrderDetailClientProps) {
  const router = useRouter();
  const orders = useStore((s) => s.orders);
  const user = useStore((s) => s.user);
  const updateOrderStatus = useStore((s) => s.updateOrderStatus);

  const order = useMemo(
    () => orders.find((o) => o.id === orderId),
    [orders, orderId]
  );

  const [simStep, setSimStep] = useState(0);
  const [messages, setMessages] = useState<Message[]>(() => {
    if (!order) return [];

    return [
      {
        id: '1',
        sender: order.createdBy,
        text: 'Hello! I have the funds ready in escrow.',
        timestamp: new Date(Date.now() - 3600000),
      },
      {
        id: '2',
        sender: user.walletAddress || '',
        text: 'Great! I will send the bank transfer now.',
        timestamp: new Date(Date.now() - 1800000),
      },
    ];
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(3);

  const isSeller =
    order &&
    ((order.type === 'sell' && user.walletAddress === order.createdBy) ||
      (order.type === 'buy' && user.walletAddress !== order.createdBy));
  const isBuyer =
    order &&
    ((order.type === 'buy' && user.walletAddress === order.createdBy) ||
      (order.type === 'sell' && user.walletAddress !== order.createdBy));

  const handleCopy = (label: string, value: string) => {
    navigator.clipboard?.writeText(value);
    toast.success(`${label} copied`);
  };

  const handleSendMessage = useCallback(
    (text: string) => {
      const newMessage: Message = {
        id: Date.now().toString(),
        sender: user.walletAddress || '',
        text,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);
      toast.success('Message sent');
    },
    [user.walletAddress]
  );

  const advanceToStep1 = useCallback(async () => {
    setIsUpdating(true);
    await new Promise((r) => setTimeout(r, 500));
    setMessages((prev) => addSystemMessage(prev, 'Trustline activated. You can now receive USDC.'));
    setSimStep(1);
    setCountdown(3);
    toast.success('Trustline activated! Proceed to deposit.');
    setIsUpdating(false);
  }, []);

  const advanceToStep2 = useCallback(async () => {
    setIsUpdating(true);
    await new Promise((r) => setTimeout(r, 500));
    setMessages((prev) =>
      addSystemMessage(
        addSystemMessage(prev, 'Funds deposited in escrow'),
        'Buyer has 10 seconds to send payment.'
      )
    );
    setSimStep(2);
    setCountdown(3);
    toast.success('Deposit confirmed! Waiting for payment...');
    setIsUpdating(false);
  }, []);

  const advanceToStep3 = useCallback(async () => {
    setIsUpdating(true);
    await new Promise((r) => setTimeout(r, 500));
    setMessages((prev) =>
      addSystemMessage(prev, 'Buyer marked payment as sent.')
    );
    setSimStep(3);
    setCountdown(3);
    toast.info('Payment marked. Waiting for seller confirmation...');
    setIsUpdating(false);
  }, []);

  const advanceToStep4 = useCallback(async () => {
    setIsUpdating(true);
    await new Promise((r) => setTimeout(r, 500));
    setMessages((prev) =>
      addSystemMessage(prev, 'USDC released successfully!')
    );
    if (order) updateOrderStatus(order.id, 'completed');
    setSimStep(4);
    setCountdown(null);
    toast.success('Funds released! Trade completed 🎉');
    setIsUpdating(false);
  }, [order, updateOrderStatus]);

  // Auto-advance demo: 3s countdown per step, then advance (regardless of role for demo)
  useEffect(() => {
    if (simStep >= 4 || isUpdating) return;

    const id = setInterval(() => {
      setCountdown((prev) => {
        const current = prev ?? 3;
        if (current <= 1) {
          clearInterval(id);
          if (simStep === 0) advanceToStep1();
          else if (simStep === 1) advanceToStep2();
          else if (simStep === 2) advanceToStep3();
          else if (simStep === 3) advanceToStep4();
          return null;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [advanceToStep1, advanceToStep2, advanceToStep3, advanceToStep4, isUpdating, simStep]);

  if (!order) {
    return (
      <>
        <p className="text-center text-gray-600">Order not found</p>
        <Button
          variant="outline"
          className="mt-4 w-full transition-all duration-200"
          onClick={() => router.push('/orders')}
        >
          Back to Marketplace
        </Button>
      </>
    );
  }

  const total = order.amount * order.rate;

  const stepConfig = () => {
    if (simStep === 0) return { label: 'Setup', sub: 'Activate Trustline', icon: Wallet };
    if (simStep === 1) return { label: 'Deposit', sub: 'Confirm escrow', icon: Banknote };
    if (simStep === 2) return { label: 'Payment', sub: 'Waiting for payment', icon: RefreshCw };
    if (simStep === 3) return { label: 'Confirm', sub: 'Confirm receipt', icon: CircleCheck };
    return { label: 'Completed', sub: 'Trade complete', icon: PartyPopper };
  };

  const stepInfo = stepConfig();
  const StatusIcon = stepInfo.icon;

  return (
    <div className="space-y-6">
        {/* Top row: Status badge + countdown */}
        <FadeIn>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border-2 border-primary-200 bg-white px-4 py-2.5 shadow-sm">
              <StatusIcon className="size-5 shrink-0 text-primary-600" />
              <div>
                <p className="text-body font-semibold text-dark-500">
                  {simStep < 4 ? 'In progress' : 'Complete'} — {stepInfo.label}
                </p>
                <p className="text-body-sm text-gray-500">{stepInfo.sub}</p>
              </div>
            </div>
            {simStep < 4 && countdown !== null && !isUpdating && (
              <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1.5 text-body-sm text-gray-500">
                Next step in: <span className="font-mono font-semibold text-gray-700">{countdown}…</span>
              </span>
            )}
          </div>
        </FadeIn>

        <FadeIn delay={0.03}>
          <div className="mb-2">
            <EscrowStepper currentStep={simStep} orderStatus={order.status} />
          </div>
        </FadeIn>
        {simStep === 2 && (
          <p className="text-body-sm text-gray-500 -mt-2">
            Payment window: <span className="font-mono font-semibold text-gray-700">10 seconds</span>
          </p>
        )}

        {simStep === 0 && (
          <FadeIn delay={0.1}>
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-body text-gray-700 mb-6">
                You need to activate USDC Trustline to receive tokens.
              </p>
              <Button
                disabled={isUpdating}
                className="w-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 py-4 text-body font-bold text-white hover:opacity-90 transition-all duration-200 disabled:opacity-70"
                onClick={advanceToStep1}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 size-5 animate-spin" />
                    Activating...
                  </>
                ) : (
                  'Activate Trustline'
                )}
              </Button>
            </div>
          </FadeIn>
        )}

        {simStep >= 1 && simStep < 4 && (
          <>
            <FadeIn delay={0.1}>
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="grid gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-body-sm font-medium text-gray-600">Seller</span>
                    <span className="text-body font-semibold text-dark-500 font-mono">
                      {order.type === 'sell' ? `${order.createdBy.slice(0, 6)}...${order.createdBy.slice(-4)}` : '—'}
                    </span>
                  </div>
                  <div
                    className="text-body-sm text-cyan-700 bg-cyan-50 rounded-lg px-3 py-2 cursor-pointer hover:bg-cyan-100/80 transition-colors"
                    role="button"
                    tabIndex={0}
                    onClick={() => toast.info('Trade history coming soon')}
                    onKeyDown={(e) => e.key === 'Enter' && toast.info('Trade history coming soon')}
                  >
                    ⭐ {order.reputation_score ?? 0} completed trades | 100% completion rate
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-body-sm font-medium text-gray-600">Buyer</span>
                    <span className="text-body font-semibold text-dark-500 font-mono">
                      {order.type === 'buy' ? `${order.createdBy.slice(0, 6)}...${order.createdBy.slice(-4)}` : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                    <span className="text-body-sm font-medium text-gray-600">Amount</span>
                    <span className="text-h4 font-display text-primary-600">
                      {order.amount.toLocaleString()} USDC
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-body-sm font-medium text-gray-600">Rate</span>
                    <span className="text-body font-semibold text-dark-500">
                      {order.rate.toLocaleString()} {order.currency} per USDC
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-body-sm font-medium text-gray-600">Total</span>
                    <span className="text-h4 font-display text-primary-600">
                      {total.toLocaleString()} {order.currency}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-body-sm font-medium text-gray-600">Payment method</span>
                    <span className="text-body font-semibold text-dark-500">{order.paymentMethod}</span>
                  </div>
                </div>
              </div>
            </FadeIn>

            {simStep >= 2 && (
              <FadeIn delay={0.12}>
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 text-h5 font-display text-gray-800">Payment Details</h3>
                  <div className="space-y-3">
                    {BANK_DETAILS.map(({ label, value }) => (
                      <div
                        key={label}
                        className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-4 py-3"
                      >
                        <div>
                          <p className="text-body-sm font-medium text-gray-600">{label}</p>
                          <p className="font-mono text-body font-semibold text-dark-500">{value}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(label, value)}
                          className="rounded-lg p-2 text-gray-500 hover:bg-gray-200 transition-colors"
                          aria-label={`Copy ${label}`}
                        >
                          <Copy className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            )}

            <FadeIn delay={0.15}>
              <div className="w-full">
                <ChatBox
                  messages={messages}
                  onSendMessage={handleSendMessage}
                />
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="space-y-3">
                {order.status === 'disputed' && (
                  <Button
                    disabled={isUpdating}
                    className="w-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 py-4 text-body font-bold text-white hover:opacity-90 transition-all duration-200 disabled:opacity-70"
                    onClick={async () => {
                      setIsUpdating(true);
                      await new Promise((r) => setTimeout(r, 500));
                      toast.error('Dispute opened. Support will review...');
                      setIsUpdating(false);
                    }}
                  >
                    {isUpdating ? <Loader2 className="mr-2 size-5 animate-spin" /> : <AlertTriangle className="mr-2 size-5" />}
                    Contact Support
                  </Button>
                )}
                {simStep === 1 && isSeller && (
                  <Button
                    disabled={isUpdating}
                    className="w-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 py-4 text-body font-bold text-white hover:opacity-90 transition-all duration-200 disabled:opacity-70"
                    onClick={advanceToStep2}
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 size-5 animate-spin" />
                        Confirming...
                      </>
                    ) : (
                      'Confirm Deposit'
                    )}
                  </Button>
                )}
                {simStep === 2 && isBuyer && (
                  <Button
                    disabled={isUpdating}
                    className="w-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 py-4 text-body font-bold text-white hover:opacity-90 transition-all duration-200 disabled:opacity-70"
                    onClick={advanceToStep3}
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 size-5 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Mark as Paid'
                    )}
                  </Button>
                )}
                {simStep === 2 && isSeller && (
                  <Button
                    disabled
                    variant="outline"
                    className="w-full rounded-full py-4 text-body font-semibold text-gray-400 cursor-not-allowed"
                  >
                    Waiting for buyer...
                  </Button>
                )}
                {simStep === 3 && isSeller && (
                  <Button
                    disabled={isUpdating}
                    className="w-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 py-4 text-body font-bold text-white hover:opacity-90 transition-all duration-200 disabled:opacity-70"
                    onClick={advanceToStep4}
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 size-5 animate-spin" />
                        Releasing...
                      </>
                    ) : (
                      'Confirm Payment Received'
                    )}
                  </Button>
                )}
                {simStep === 3 && isBuyer && (
                  <Button
                    disabled
                    variant="outline"
                    className="w-full rounded-full py-4 text-body font-semibold text-gray-400 cursor-not-allowed"
                  >
                    Waiting for seller to confirm...
                  </Button>
                )}
              </div>
            </FadeIn>
          </>
        )}

        {simStep === 4 && (
          <FadeIn>
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500 text-white">
                <Check className="size-10" strokeWidth={2.5} />
              </div>
              <h2 className="mb-2 text-h3 font-display text-gray-900">Trade completed</h2>
              <p className="text-body text-gray-600 mb-8">
                USDC has been released. Thank you for using PeerlyPay.
              </p>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-left mb-8">
                <p className="text-body-sm font-medium text-gray-600 mb-4">Transaction summary</p>
                <div className="grid gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-body-sm font-medium text-gray-600">Amount</span>
                    <span className="text-h4 font-display text-primary-600">
                      {order.amount.toLocaleString()} USDC
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-body-sm font-medium text-gray-600">Total</span>
                    <span className="text-h4 font-display text-primary-600">
                      {total.toLocaleString()} {order.currency}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-body-sm font-medium text-gray-600">Payment</span>
                    <span className="text-body font-semibold text-dark-500">{order.paymentMethod}</span>
                  </div>
                </div>
              </div>
              <div className="mb-8">
                <p className="text-body-sm font-semibold text-gray-700 mb-3">Rate your experience</p>
                <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 rounded transition-colors"
                      aria-label={`${star} stars`}
                    >
                      <Star
                        className={`size-8 ${
                          star <= (hoverRating || rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  className="w-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 py-4 text-body font-bold text-white hover:opacity-90"
                  onClick={() => router.push('/orders')}
                >
                  Back to Marketplace
                </Button>
                <Button
                  variant="outline"
                  className="w-full rounded-full py-4 text-body font-semibold border-2 border-gray-200"
                  onClick={() => toast.info('Receipt view coming soon')}
                >
                  View Receipt
                </Button>
              </div>
            </div>
          </FadeIn>
        )}
    </div>
  );
}
````

## File: app/orders/create/CreateOrderForm.tsx
````typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Minus, Plus, Loader2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import type { Currency, PaymentMethod, CreateOrderInput } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface FormData {
  amount: number;
  currency: Currency;
  rate: number;
  paymentMethod: PaymentMethod;
  duration: string;
}

const CURRENCIES: Currency[] = ['ARS', 'USD'];
const PAYMENT_METHODS: PaymentMethod[] = ['Bank Transfer', 'MercadoPago'];
const DURATIONS = ['1 day', '3 days', '7 days'];

interface CreateOrderFormProps {
  orderType: 'buy' | 'sell';
}

const initialFormData: FormData = {
  amount: 0,
  currency: 'USD',
  rate: 0,
  paymentMethod: 'Bank Transfer',
  duration: '1 day',
};

function NumberField({
  value,
  onChange,
  min = 0,
  step = 1,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  step?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - step))}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all duration-200"
        aria-label="Decrease"
      >
        <Minus className="size-4" />
      </button>
      <Input
        type="number"
        min={min}
        step={step}
        value={value || ''}
        onChange={(e) => {
          const v = e.target.value === '' ? min : parseFloat(e.target.value);
          onChange(isNaN(v) ? min : Math.max(min, v));
        }}
        className="flex-1 rounded-xl border border-gray-200 bg-gray-50 text-center text-body"
      />
      <button
        type="button"
        onClick={() => onChange(value + step)}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all duration-200"
        aria-label="Increase"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}

export default function CreateOrderForm({ orderType }: CreateOrderFormProps) {
  const router = useRouter();
  const { user, createOrder } = useStore();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const isWalletReady = user.isConnected && Boolean(user.walletAddress);

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault?.();

    if (!isWalletReady) {
      toast.error('Connect your wallet before creating an order.');
      return;
    }

    const { amount, rate, currency, paymentMethod, duration } = formData;
    if (amount <= 0) {
      toast.error('Amount must be greater than 0.');
      return;
    }
    if (rate < 0) {
      toast.error('Rate must be 0 or greater.');
      return;
    }
    if (!currency || !paymentMethod || !duration) {
      toast.error('Please complete all required fields.');
      return;
    }

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));

    const input: CreateOrderInput = {
      type: orderType,
      amount,
      rate,
      currency,
      paymentMethod,
      duration,
    };

    createOrder(input);
    toast.success('Order created successfully!');
    router.push('/');
    setIsLoading(false);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(e);
      }}
      className="flex flex-col gap-6"
    >
      {/* USDC Amount */}
      <div>
        <Label className="mb-2 block text-body font-semibold text-gray-700">
          USDC Amount
        </Label>
        <NumberField
          value={formData.amount}
          onChange={(v) => update('amount', v)}
          min={0}
          step={10}
        />
      </div>

      {/* Currency + Rate */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="mb-2 block text-body font-semibold text-gray-700">
            Fiat Currency
          </Label>
          <Select
            value={formData.currency}
            onValueChange={(v) => update('currency', v as Currency)}
          >
            <SelectTrigger className="w-full rounded-xl border border-gray-200 bg-gray-50">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-2 block text-body font-semibold text-gray-700">
            Exchange Rate
          </Label>
          <NumberField
            value={formData.rate}
            onChange={(v) => update('rate', v)}
            min={0}
            step={0.01}
          />
        </div>
      </div>

      {/* Payment + Duration */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="mb-2 block text-body font-semibold text-gray-700">
            Payment Method
          </Label>
          <Select
            value={formData.paymentMethod}
            onValueChange={(v) => update('paymentMethod', v as PaymentMethod)}
          >
            <SelectTrigger className="w-full rounded-xl border border-gray-200 bg-gray-50">
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-2 block text-body font-semibold text-gray-700">
            Duration
          </Label>
          <Select
            value={formData.duration}
            onValueChange={(v) => update('duration', v)}
          >
            <SelectTrigger className="w-full rounded-xl border border-gray-200 bg-gray-50">
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              {DURATIONS.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Warning */}
      <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800 [&_svg]:text-yellow-600">
        <AlertTitle className="text-body-sm font-bold">Important</AlertTitle>
        <AlertDescription className="text-body-sm text-yellow-800/90">
          Orders are binding. Ensure your payment details are correct before
          submitting.
        </AlertDescription>
      </Alert>

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading || !isWalletReady}
        className="mt-6 w-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 py-4 text-body font-bold text-white hover:opacity-90 transition-all duration-200 disabled:opacity-70"
      >
        {isLoading ? (
          <>
            <Loader2 className="size-5 animate-spin" />
            Creating...
          </>
        ) : (
          isWalletReady
            ? `Create ${orderType === 'sell' ? 'Sell' : 'Buy'} Order`
            : 'Connect wallet to continue'
        )}
      </Button>
    </form>
  );
}
````

## File: app/profile/page.tsx
````typescript
'use client';

import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import { User, ArrowRightLeft, Wallet, Calendar, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { user, setUser, isFreelancer } = useUser();
  const router = useRouter();

  const handleRoleSwitch = () => {
    if (!user) return;

    const newRole = isFreelancer ? 'MARKET_MAKER' : 'FREELANCER';
    const updatedUser = { ...user, role: newRole as 'FREELANCER' | 'MARKET_MAKER' };

    setUser(updatedUser);

    // Redirect to the appropriate dashboard
    const destination = newRole === 'FREELANCER' ? '/quick-trade' : '/pro';
    router.push(destination);
  };

  const oppositeLabel = isFreelancer ? 'Market Maker' : 'Freelancer';
  const currentLabel = isFreelancer ? 'Freelancer' : 'Market Maker';

  const createdDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—';

  const shortWallet = user?.walletAddress
    ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
    : 'Not connected';

  return (
    <>
      <h1 className="text-h3 text-black mb-6">Profile</h1>

      {/* User card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <User className="h-7 w-7 text-gray-500" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{shortWallet}</p>
            <p className="text-body-sm text-gray-500">
              {user ? 'Wallet connected' : 'No user found'}
            </p>
          </div>
        </div>

        {/* Info rows */}
        {user && (
          <div className="space-y-4 border-t border-gray-100 pt-4">
            <div className="flex items-center gap-3 text-sm">
              <Shield className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">Role</span>
              <span className="ml-auto font-medium text-gray-900">
                {currentLabel}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Wallet className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">Wallet</span>
              <span className="ml-auto font-mono text-xs text-gray-900">
                {shortWallet}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">Created</span>
              <span className="ml-auto font-medium text-gray-900">
                {createdDate}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* DEV Role Switcher */}
      {user && (
        <div className="mt-6 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center rounded bg-amber-500 px-2 py-0.5 text-xs font-bold text-white uppercase tracking-wide">
              DEV
            </span>
            <span className="text-sm font-medium text-amber-800">
              Role Switcher
            </span>
          </div>
          <p className="text-xs text-amber-700 mb-4">
            Switch between roles for development testing. This will redirect you
            to the corresponding dashboard.
          </p>
          <button
            onClick={handleRoleSwitch}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-amber-600 active:bg-amber-700"
          >
            <ArrowRightLeft className="h-4 w-4" />
            Switch to {oppositeLabel}
          </button>
        </div>
      )}

      <p className="mt-6 text-body-sm text-gray-500">
        Profile settings and account options can be added here.
      </p>
    </>
  );
}
````

## File: app/globals.css
````css
@import "tailwindcss";
@import "tw-animate-css";

@theme {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-dm-sans);
  --font-display: var(--font-space-grotesk);
  --font-mono: var(--font-geist-mono);
  --spacing-120: 30rem;
  --text-2xs: 0.625rem;
  --text-2xs--line-height: 0.875rem;
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
  --radius-3xl: calc(var(--radius) + 12px);
  --radius-4xl: calc(var(--radius) + 16px);
  
  /* Colores custom de PeerlyPay - WCAG AA Compliant */
  
  /* Principal (Magenta/Fuchsia) */
  --color-primary-50: #fdf4ff;
  --color-primary-100: #fae8ff;
  --color-primary-200: #f5d0fe;
  --color-primary-300: #f0abfc;
  --color-primary-400: #e879f9;
  --color-primary-500: #d946ef;
  --color-primary-600: #c026d3;
  --color-primary-700: #a21caf;
  --color-primary-800: #86198f;
  --color-primary-900: #701a75;
  --color-primary-950: #4a044e;
  
  /* Secundario (Cyan) */
  --color-secondary-50: #ecfeff;
  --color-secondary-100: #cffafe;
  --color-secondary-200: #a5f3fc;
  --color-secondary-300: #67e8f9;
  --color-secondary-400: #22d3ee;
  --color-secondary-500: #00ccff;
  --color-secondary-600: #0891b2;
  --color-secondary-700: #0e7490;
  --color-secondary-800: #155e75;
  --color-secondary-900: #164e63;
  --color-secondary-950: #083344;
  
  /* Acento (Lime) */
  --color-accent-50: #f7fee7;
  --color-accent-100: #ecfccb;
  --color-accent-200: #d9f99d;
  --color-accent-300: #bef264;
  --color-accent-400: #a3e635;
  --color-accent-500: #ccff33;
  --color-accent-600: #65a30d;
  --color-accent-700: #4d7c0f;
  --color-accent-800: #3f6212;
  --color-accent-900: #365314;
  --color-accent-950: #1a2e05;
  
  /* Base/Neutral */
  --color-neutral-50: #fefef9;
  --color-neutral-100: #fcfdf4;
  --color-neutral-200: #f9fbea;
  --color-neutral-300: #f6f8ec;
  --color-neutral-400: #e8edd1;
  --color-neutral-500: #d9e2b6;
  --color-neutral-600: #b8c584;
  --color-neutral-700: #97a852;
  --color-neutral-800: #5c662e;
  --color-neutral-900: #2e3317;
  --color-neutral-950: #17190b;
  
  /* Dark */
  --color-dark-50: #e6e6e6;
  --color-dark-100: #cccccc;
  --color-dark-200: #999999;
  --color-dark-300: #666666;
  --color-dark-400: #404040;
  --color-dark-500: #191919;
  --color-dark-600: #141414;
  --color-dark-700: #0f0f0f;
  --color-dark-800: #0a0a0a;
  --color-dark-900: #050505;
  --color-dark-950: #000000;
  
  /* Legacy aliases para compatibilidad */
  --color-magenta: #d946ef;
  --color-magenta-500: #d946ef;
  --color-magenta-600: #c026d3;
  --color-magenta-700: #a21caf;
  
  --color-lime: #ccff33;
  --color-lime-500: #ccff33;
  --color-lime-600: #65a30d;
  --color-lime-700: #4d7c0f;
  
  --color-cyan: #00ccff;
  --color-cyan-500: #00ccff;
  --color-cyan-600: #0891b2;
  --color-cyan-700: #0e7490;
  
  /* Typography Scale */
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;
  --font-size-5xl: 3rem;
  --font-size-6xl: 3.75rem;
  
  /* Line Heights */
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;
}

:root {
  --radius: 0.625rem;
  --radius-balance-inner: 22px;
  --shadow-balance-card: 0 8px 32px rgb(0 0 0 / 12%);
  --gradient-balance-mesh:
    radial-gradient(at 0% 0%, rgb(255 182 193 / 60%) 0px, transparent 50%),
    radial-gradient(at 100% 0%, rgb(173 216 255 / 60%) 0px, transparent 50%),
    radial-gradient(at 100% 100%, rgb(221 160 255 / 60%) 0px, transparent 50%),
    radial-gradient(at 0% 100%, rgb(152 251 200 / 50%) 0px, transparent 50%);
  --gradient-balance-border: linear-gradient(
    135deg,
    rgb(255 182 193 / 80%),
    rgb(173 216 255 / 80%),
    rgb(221 160 255 / 80%),
    rgb(152 251 200 / 60%)
  );
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);
}

@layer base {
  * {
    border-color: var(--border);
    outline-color: hsl(var(--ring) / 0.5);
  }
  body {
    background-color: var(--background);
    color: var(--foreground);
  }
}

@layer utilities {
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
  }

  .bg-balance-mesh {
    background: var(--gradient-balance-mesh);
  }

  .bg-balance-border {
    background: var(--gradient-balance-border);
  }

  .shadow-balance-card {
    box-shadow: var(--shadow-balance-card);
  }

  .rounded-balance-inner {
    border-radius: var(--radius-balance-inner);
  }

  /* Typography Hierarchy - Space Grotesk for headings */
  .text-display {
    font-family: var(--font-space-grotesk);
    font-size: 3.75rem;
    line-height: 1;
    font-weight: 700;
    letter-spacing: -0.02em;
  }
  
  .text-h1 {
    font-family: var(--font-space-grotesk);
    font-size: 3rem;
    line-height: 1.1;
    font-weight: 700;
    letter-spacing: -0.02em;
  }
  
  .text-h2 {
    font-family: var(--font-space-grotesk);
    font-size: 2.25rem;
    line-height: 1.2;
    font-weight: 700;
    letter-spacing: -0.01em;
  }
  
  .text-h3 {
    font-family: var(--font-space-grotesk);
    font-size: 1.875rem;
    line-height: 1.3;
    font-weight: 600;
  }
  
  .text-h4 {
    font-family: var(--font-space-grotesk);
    font-size: 1.5rem;
    line-height: 1.4;
    font-weight: 600;
  }
  
  .text-h5 {
    font-family: var(--font-space-grotesk);
    font-size: 1.25rem;
    line-height: 1.5;
    font-weight: 600;
  }
  
  /* Body text - DM Sans */
  .text-body-lg {
    font-family: var(--font-dm-sans);
    font-size: 1.125rem;
    line-height: 1.75;
    font-weight: 400;
  }
  
  .text-body {
    font-family: var(--font-dm-sans);
    font-size: 1rem;
    line-height: 1.5;
    font-weight: 400;
  }
  
  .text-body-sm {
    font-family: var(--font-dm-sans);
    font-size: 0.875rem;
    line-height: 1.5;
    font-weight: 400;
  }
  
  .text-caption {
    font-family: var(--font-dm-sans);
    font-size: 0.75rem;
    line-height: 1.5;
    font-weight: 500;
    letter-spacing: 0.02em;
  }
  
  /* Emphasis variants */
  .text-body-medium {
    font-weight: 500;
  }
  
  .text-body-semibold {
    font-weight: 600;
  }
  
  .text-body-bold {
    font-weight: 700;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out forwards;
}

@keyframes scaleIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.animate-scaleIn {
  animation: scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes confetti {
  0% {
    opacity: 1;
    transform: translateY(0) rotate(0deg) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(calc(100vh)) rotate(720deg) scale(0.3);
  }
}

.animate-confetti {
  animation: confetti var(--confetti-duration, 3s) var(--confetti-delay, 0s) cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

@keyframes checkDraw {
  0% {
    stroke-dashoffset: 48;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

.animate-checkDraw {
  animation: checkDraw 0.4s 0.3s ease-out forwards;
}
````

## File: components/BalanceCard.tsx
````typescript
'use client';

import { useStore } from '@/lib/store';

export default function BalanceCard() {
  const { user } = useStore();
  const { usd, usdc } = user.balance;

  const formattedUsd = usd.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formattedUsdc = usdc.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="mt-6 flex w-full flex-col items-center justify-center rounded-[10px] border border-[#e5e5e5] bg-[#f9fafb] p-5 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)]">
      <div className="flex w-full flex-col items-center justify-center gap-0 p-2.5">
        <div className="flex flex-col items-center">
          <p className="font-sans text-[10px] font-semibold uppercase leading-[1.5] tracking-[0.5px] text-[#585d69]">
            TOTAL BALANCE
          </p>
          <div className="flex items-center gap-1 text-[#191919]">
            <span className="font-display text-[30px] font-semibold tracking-[-1.2px]">
              $
            </span>
            <span className="font-display text-[60px] font-semibold tracking-[-3px]">
              {formattedUsd}
            </span>
          </div>
          <p className="font-mono text-base leading-[1.5] text-[#585d69]">
            ≈ {formattedUsdc} USDC
          </p>
        </div>
      </div>
    </div>
  );
}
````

## File: components/BottomCTA.tsx
````typescript
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function BottomCTA() {
  const router = useRouter();

  return (
    <div className="flex gap-3 w-full">
      <button
        type="button"
        onClick={() => router.push('/orders/create?type=buy')}
        className="flex-1 py-4 px-6 rounded-full bg-gradient-to-r from-magenta to-magenta-600 text-white font-display font-semibold text-base hover:opacity-90 transition-all duration-200"
      >
        + Buy USDC
      </button>
      <button
        type="button"
        onClick={() => router.push('/orders/create?type=sell')}
        className="flex-1 py-4 px-6 rounded-full bg-white border border-gray-300 text-gray-600 font-display font-semibold text-base hover:bg-gray-50 transition-all duration-200"
      >
        ⇄ Sell USDC
      </button>
    </div>
  );
}
````

## File: components/Header.tsx
````typescript
'use client';

import Image from 'next/image';
import WalletButton from '@/components/WalletButton';

export default function Header() {
  return (
    <header className="fixed top-0 left-1/2 z-50 w-full max-w-120 -translate-x-1/2 border-b bg-white shadow-sm">
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        {/* Logo */}
        <div className="flex items-center gap-2 min-w-0">
          <Image
            src="/x_icon_black.png"
            alt="PeerlyPay"
            width={28}
            height={28}
            className="shrink-0 object-contain h-7 w-7"
          />
          <span className="font-display font-bold text-xl truncate">
            PeerlyPay
          </span>
        </div>

        {/* Wallet */}
        <WalletButton />
      </div>
    </header>
  );
}
````

## File: contracts/README.md
````markdown
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


## Quickstart via Makefile (2-step deploy + init)

This repository includes a Makefile under `contracts/` to run a simple flow:

1) Deploy a new escrow contract instance.
2) Initialize it with `initialize_escrow`.

### Available targets

```bash
make help
make contract-build
make contract-install-escrow NETWORK=testnet SOURCE=alice
make escrow-deploy NETWORK=testnet SOURCE=alice
make escrow-build-payload NETWORK=testnet ...
make escrow-init NETWORK=testnet SOURCE=alice
make escrow-get NETWORK=testnet SOURCE=alice
make run-simple-escrow-flow
```

### One-command happy path (deploy -> init -> fund -> complete -> approve -> release)

If you already have the key aliases `admin`, `contractor`, and `freelancer` configured in Stellar CLI:

```bash
make run-simple-escrow-flow
```

Defaults used by the script:
- `NETWORK=testnet`
- `TOKEN_CONTRACT_ID=CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA`
- `ADMIN_ALIAS=admin`
- `CONTRACTOR_ALIAS=contractor`
- `FREELANCER_ALIAS=freelancer`

You can override any of these:

```bash
NETWORK=testnet TOKEN_CONTRACT_ID=C... make run-simple-escrow-flow
```

### Minimal example

```bash
make contract-build
make contract-install-escrow NETWORK=testnet SOURCE=alice
make escrow-deploy NETWORK=testnet SOURCE=alice

make escrow-build-payload \
  NETWORK=testnet \
  ENGAGEMENT_ID=order_001 \
  TITLE="P2P Trade #001" \
  DESCRIPTION="USDC/ARS escrow" \
  AMOUNT=100000000 \
  PLATFORM_FEE_BPS=100 \
  TOKEN_CONTRACT_ID=CB...TOKEN \
  APPROVER=G...APPROVER \
  SERVICE_PROVIDER=G...SERVICE \
  PLATFORM_ADDRESS=G...PLATFORM \
  RELEASE_SIGNER=G...RELEASE \
  DISPUTE_RESOLVER=G...DISPUTE \
  RECEIVER=G...RECEIVER

make escrow-init NETWORK=testnet SOURCE=alice
make escrow-get NETWORK=testnet SOURCE=alice
```

Notes:
- Generated deployment artifacts are stored in `.artifacts/<network>/`.
- You can override `ESCROW_WASM_HASH` and `ESCROW_CONTRACT_ID` directly from env.
- `MILESTONES_JSON` is optional; if omitted, one default `Pending` milestone is generated.
- The payload builder serializes Soroban `i128` fields (for example `amount`, `receiver_memo`) as strings for CLI compatibility.


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

Note: Makefile automation currently targets escrow flows. For P2P, use direct `cargo` and `stellar contract invoke` commands.



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
````

## File: types/index.ts
````typescript
export type OrderType = 'buy' | 'sell';
export type OrderStatus = 'open' | 'active' | 'completed' | 'cancelled' | 'disputed';
export type PaymentMethod = 'Bank Transfer' | 'MercadoPago';
export type Currency = 'ARS' | 'USD';

export interface User {
  walletAddress: string | null;
  walletOwner?: string | null;
  walletStatus?: string | null;
  isConnected: boolean;
  balance: {
    usd: number;
    usdc: number;
  };
  /** Mock: completed trades count for reputation (Stellar will provide later) */
  reputation_score?: number;
}

export interface Order {
  id: string;
  type: OrderType;
  amount: number;
  rate: number;
  currency: Currency;
  paymentMethod: PaymentMethod;
  duration: string;
  status: OrderStatus;
  createdAt: Date;
  createdBy: string;
  paymentMethods?: string[];
  displayName?: string;
  isVerified?: boolean;
  /** Mock: order creator's completed trades (Stellar will provide later) */
  reputation_score?: number;
  completionRate?: number;
}

export interface CreateOrderInput {
  type: OrderType;
  amount: number;
  rate: number;
  currency: Currency;
  paymentMethod: PaymentMethod;
  duration: string;
}

export interface MatchOrderInput {
  type: OrderType;
  amount: number;
  userId: string;
}

export type OrderHistoryStatus =
  | 'awaiting_payment'
  | 'payment_sent'
  | 'releasing'
  | 'completed'
  | 'cancelled'
  | 'disputed'
  | 'expired';

export interface OrderHistoryItem {
  id: string;
  type: OrderType;
  status: OrderHistoryStatus;
  usdc_amount: number;
  fiat_amount: number;
  rate: number;
  counterparty: {
    username?: string;
    address: string;
  };
  updated_at: string;
}

export interface MatchedMaker {
  address: string;
  displayName?: string;
  reputation_score: number;
  completionRate: number;
  isVerified: boolean;
  totalOrders: number;
}

export interface MatchOrderResult {
  matchedOrder: Order;
  maker: MatchedMaker;
  estimatedAmount: number;
  rate: number;
  fee: number;
  total: number;
}

export interface QuickTradeEstimate {
  amount: number;
  rate: number;
  fiatAmount: number;
  fee: number;
  total: number;
  currency: Currency;
}
````

## File: README.md
````markdown
# PeerlyPay 🌍💸

## Tagline

**"Earn Global, Spend Local - Trustless ramp for the borderless economy."**

## Overview

PeerlyPay is a decentralized P2P fiat-to-crypto marketplace that lets users trade USDC for local fiat (and vice versa) without relying on centralized exchanges.

We built PeerlyPay for **remote workers, freelancers, and digital nomads** in emerging markets who earn in crypto but have local expenses. Instead of using KYC-heavy CEXs or risky OTC deals, PeerlyPay provides a **trustless ramp**: funds are secured in **Stellar Soroban** smart contracts, while dispute resolution is handled securely on **Base** via the Slice Protocol.

## Features

* ✅ **P2P Marketplace** for USDC ↔ Fiat trades
* ✅ **Non-custodial Escrow** powered by Stellar Soroban (Rust)
* ✅ **Cross-Chain Dispute Resolution** (Stellar ↔ Base bridge)
* ✅ **Real-time Order Management**
* ✅ **In-app Chat** for payment coordination
* ✅ **Mobile-first responsive design**
* ✅ **Multiple payment methods** (Bank Transfer, MercadoPago)

## Tech Stack

### Frontend

* **Next.js 16** (App Router)
* **TypeScript**
* **Tailwind CSS v4** (with `oklch` color spaces)
* **shadcn/ui** components
* **Zustand** (State Management)
* **Sonner** (Toast Notifications)

### Blockchain Architecture

* **Core Escrow & Payments:** Stellar Soroban (Rust)
* Handles fund locking, releasing, and state management.


* **Dispute Resolution:** Base (Solidity)
* Utilizes **Slice Protocol V1.5** for decentralized arbitration.


* **Bridge:** Custom Proxy Contract & Relayer
* Locks funds on Stellar to trigger arbitration on Base, then relays the ruling back.



## How It Works

1. **Connect Wallet** – Link your Stellar wallet (and EVM wallet for dispute protection).
2. **Create/Match Order** – Users agree on terms; USDC is locked in a unique **Soroban Escrow Contract**.
3. **Off-chain Transfer** – Buyer sends fiat via Bank/MercadoPago.
4. **Completion** – Seller confirms receipt, and the contract releases USDC to the buyer.
5. **Dispute Flow (If needed)**:
* User triggers dispute on Stellar.
* Proxy relays request to **Base**.
* Jurors on Slice Protocol rule on the case.
* Ruling is bridged back to Stellar to unlock funds to the winner.



## Project Structure

```bash
peerlypay/
├── app/                    # Next.js 16 App Router
│   ├── orders/             # Marketplace, create, mine, and detail flows
│   │   ├── create/
│   │   ├── mine/
│   │   └── [id]/
│   └── profile/
├── components/             # Reusable shared components + shadcn/ui primitives
├── contracts/              # Smart Contracts Workspace
│   ├── .stellar/           # Soroban Network Configs
│   └── contracts/
│       └── escrow/         # Main Soroban Rust Contract
├── lib/                    # Utilities & Zustand Store
└── types/                  # TypeScript Interfaces

```

## Frontend Styling Conventions

* Prefer tokenized theme utilities over arbitrary values (for example `max-w-120` instead of `max-w-[480px]`).
* Use CSS variables in `app/globals.css` as the source of truth for custom colors, shadows, gradients, and spacing.
* Keep route-local components under `app/**`; put cross-route reusable components under `components/**`.
* Treat `components/ui/**` as shadcn/Radix primitives and avoid unnecessary churn unless behavior must change.

## Getting Started

### Prerequisites

* Node.js 18+
* [Stellar CLI](https://developers.stellar.org/docs/build/smart-contracts/getting-started/setup) (for contract interaction)
* Rust (wasm32-unknown-unknown target)

### Installation

1. **Clone the repo:**
```bash
git clone [repo-url]
cd peerlypay

```


2. **Install dependencies:**
```bash
npm install
# or
pnpm install

```


3. **Run the development server:**
```bash
npm run dev

```


4. **Run Contracts (Optional):**
Navigate to `contracts/` to build and test the Soroban logic.
```bash
cd contracts
cargo test

```



## Future Roadmap

* [ ] Automated Relayer Service for Stellar <-> Base bridge
* [ ] Integration with Unibase for portable reputation
* [ ] AI Dispute Agent for pre-arbitration mediation
* [ ] Mobile App (React Native)

## Team

* **Alexis**
* **Steven**
* **Stefano**
* **Barb**

## License

MIT

---

*Built with ❤️ for Stellar 2026*
````

## File: app/orders/page.tsx
````typescript
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Copy,
  Check,
  Star,
  Download,
  Flag,
  RefreshCw,
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useStore } from '@/lib/store';
import OrderCard from '@/components/OrderCard';
import OrderCardSkeleton from '@/components/OrderCardSkeleton';
import EmptyState from '@/components/EmptyState';
import FadeIn from '@/components/FadeIn';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

// ============================================
// TYPES
// ============================================

type TradeStatus = 'active' | 'completed' | 'disputed';

interface TradeTimelineStep {
  label: string;
  time: string;
  done: boolean;
}

interface FreelancerTrade {
  id: string;
  status: TradeStatus;
  usdcAmount: number;
  arsAmount: number;
  rate: number;
  counterparty: {
    username: string;
    reputation: number;
  };
  createdAt: string;
  completedAt?: string;
  txnId: string;
  paymentMethod: string;
  timeline: TradeTimelineStep[];
}

// ============================================
// MOCK DATA
// ============================================

const MOCK_TRADES: FreelancerTrade[] = [
  {
    id: 'TRD-001',
    status: 'active',
    usdcAmount: 0.15,
    arsAmount: 222.75,
    rate: 1485,
    counterparty: { username: 'crypto_trader_ar', reputation: 4.8 },
    createdAt: '2026-02-10T15:15:00',
    txnId: '#TXN789012',
    paymentMethod: 'MercadoPago',
    timeline: [
      { label: 'Trade iniciado', time: '3:15 PM', done: true },
      { label: 'Pago enviado', time: '3:16 PM', done: true },
      { label: 'Esperando liberación', time: '', done: false },
      { label: 'USDC recibido', time: '', done: false },
    ],
  },
  {
    id: 'TRD-002',
    status: 'completed',
    usdcAmount: 0.11,
    arsAmount: 163.35,
    rate: 1485,
    counterparty: { username: 'p2p_master', reputation: 4.9 },
    createdAt: '2026-02-09T11:30:00',
    completedAt: '2026-02-09T11:33:00',
    txnId: '#TXN456789',
    paymentMethod: 'Bank Transfer',
    timeline: [
      { label: 'Trade iniciado', time: '11:30 AM', done: true },
      { label: 'Pago enviado', time: '11:31 AM', done: true },
      { label: 'USDC liberado', time: '11:32 AM', done: true },
      { label: 'USDC recibido', time: '11:33 AM', done: true },
    ],
  },
  {
    id: 'TRD-003',
    status: 'completed',
    usdcAmount: 0.25,
    arsAmount: 371.25,
    rate: 1485,
    counterparty: { username: 'usdc_dealer_ba', reputation: 4.7 },
    createdAt: '2026-02-07T09:00:00',
    completedAt: '2026-02-07T09:04:00',
    txnId: '#TXN123456',
    paymentMethod: 'MercadoPago',
    timeline: [
      { label: 'Trade iniciado', time: '9:00 AM', done: true },
      { label: 'Pago enviado', time: '9:01 AM', done: true },
      { label: 'USDC liberado', time: '9:03 AM', done: true },
      { label: 'USDC recibido', time: '9:04 AM', done: true },
    ],
  },
  {
    id: 'TRD-004',
    status: 'completed',
    usdcAmount: 0.08,
    arsAmount: 118.8,
    rate: 1485,
    counterparty: { username: 'crypto_trader_ar', reputation: 4.8 },
    createdAt: '2026-02-05T16:45:00',
    completedAt: '2026-02-05T16:48:00',
    txnId: '#TXN987654',
    paymentMethod: 'Bank Transfer',
    timeline: [
      { label: 'Trade iniciado', time: '4:45 PM', done: true },
      { label: 'Pago enviado', time: '4:46 PM', done: true },
      { label: 'USDC liberado', time: '4:47 PM', done: true },
      { label: 'USDC recibido', time: '4:48 PM', done: true },
    ],
  },
];

// ============================================
// HELPERS
// ============================================

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatArs(value: number): string {
  return value.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatUsdc(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatRate(value: number): string {
  return value.toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

// ============================================
// STATUS BADGE
// ============================================

function StatusBadge({ status }: { status: TradeStatus }) {
  const config = {
    active: {
      label: 'En progreso',
      className: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    completed: {
      label: 'Completado',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    disputed: {
      label: 'Disputado',
      className: 'bg-red-50 text-red-700 border-red-200',
    },
  };
  const { label, className } = config[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border',
        className
      )}
    >
      {status === 'completed' && (
        <CheckCircle2 className="size-3" />
      )}
      {label}
    </span>
  );
}

// ============================================
// TRADE CARD
// ============================================

function TradeCard({
  trade,
  onTap,
}: {
  trade: FreelancerTrade;
  onTap: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onTap}
      className={cn(
        'w-full bg-white rounded-xl border border-gray-200 p-4 text-left',
        'transition-all duration-200 hover:border-gray-300 hover:shadow-sm',
        'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:ring-offset-2',
        'active:scale-[0.98]',
        trade.status === 'active' && 'border-l-4 border-l-amber-400'
      )}
    >
      {/* Header: date + status */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-400">
          {formatDate(trade.createdAt)}
        </span>
        <StatusBadge status={trade.status} />
      </div>

      {/* Amount sold */}
      <p className="text-sm font-semibold text-gray-900 mb-1">
        Vendiste {formatUsdc(trade.usdcAmount)} USDC
      </p>

      {/* Amount received */}
      <p className="text-sm text-gray-600 mb-2">
        Recibiste{' '}
        <span className="font-semibold text-emerald-600">
          ${formatArs(trade.arsAmount)} ARS
        </span>
      </p>

      {/* Rate + counterparty row */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <span className="text-xs text-gray-400">
          1 USDC = {formatRate(trade.rate)} ARS
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-gray-600">
            @{trade.counterparty.username}
          </span>
          <span className="text-xs text-amber-500">
            ★ {trade.counterparty.reputation}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        </div>
      </div>
    </button>
  );
}

// ============================================
// TRADE DETAIL SHEET
// ============================================

function TradeDetailSheet({
  trade,
  open,
  onClose,
}: {
  trade: FreelancerTrade | null;
  open: boolean;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  useEffect(() => {
    setCopied(false);
    setRating(0);
    setRatingSubmitted(false);
  }, [trade?.id]);

  if (!trade) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(trade.txnId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isWithin24h = trade.completedAt
    ? Date.now() - new Date(trade.completedAt).getTime() < 24 * 60 * 60 * 1000
    : true;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl max-h-[90dvh] overflow-y-auto p-0"
      >
        <div className="px-5 pt-4 pb-8 space-y-5">
          {/* Drag handle */}
          <div className="flex justify-center">
            <div className="w-10 h-1 rounded-full bg-gray-300" />
          </div>

          <SheetHeader className="space-y-1">
            <SheetTitle className="font-[family-name:var(--font-space-grotesk)] text-lg">
              Detalle del Trade
            </SheetTitle>
            <SheetDescription className="sr-only">
              Detalles completos de la transacción
            </SheetDescription>
          </SheetHeader>

          {/* Status */}
          <div className="flex justify-center">
            <StatusBadge status={trade.status} />
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-gray-500">Vendiste</span>
              <span className="font-[family-name:var(--font-jetbrains-mono)] text-base font-bold text-gray-900 tabular-nums">
                {formatUsdc(trade.usdcAmount)} USDC
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-gray-500">Recibiste</span>
              <span className="font-[family-name:var(--font-jetbrains-mono)] text-base font-bold text-emerald-600 tabular-nums">
                ${formatArs(trade.arsAmount)} ARS
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-gray-500">Tasa</span>
              <span className="font-[family-name:var(--font-jetbrains-mono)] text-sm text-gray-700 tabular-nums">
                1 USDC = {formatRate(trade.rate)} ARS
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-gray-500">Método</span>
              <span className="text-body-sm font-medium text-gray-700">
                {trade.paymentMethod}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-gray-500">Contraparte</span>
              <span className="text-body-sm font-medium text-gray-700">
                @{trade.counterparty.username}{' '}
                <span className="text-amber-500">
                  ★ {trade.counterparty.reputation}
                </span>
              </span>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <p className="text-body-sm font-semibold text-gray-900 mb-3">
              Timeline
            </p>
            <div className="space-y-0">
              {trade.timeline.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'w-2.5 h-2.5 rounded-full mt-1.5 shrink-0',
                        step.done ? 'bg-emerald-500' : 'bg-gray-300'
                      )}
                    />
                    {i < trade.timeline.length - 1 && (
                      <div
                        className={cn(
                          'w-0.5 h-6',
                          step.done ? 'bg-emerald-200' : 'bg-gray-200'
                        )}
                      />
                    )}
                  </div>
                  <div className="flex items-center justify-between flex-1 pb-3">
                    <span
                      className={cn(
                        'text-sm',
                        step.done
                          ? 'text-gray-900 font-medium'
                          : 'text-gray-400'
                      )}
                    >
                      {step.label}
                    </span>
                    {step.time && (
                      <span className="text-xs text-gray-400 font-[family-name:var(--font-jetbrains-mono)] tabular-nums">
                        {step.time}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction ID */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
            <div>
              <p className="text-xs text-gray-400">ID de transacción</p>
              <p className="font-[family-name:var(--font-jetbrains-mono)] text-sm text-gray-700 tabular-nums">
                {trade.txnId}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className={cn(
                'flex items-center justify-center size-8 rounded-lg transition-all active:scale-95',
                copied
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-white text-gray-400 hover:text-gray-600 border border-gray-200'
              )}
            >
              {copied ? (
                <Check className="size-4" />
              ) : (
                <Copy className="size-4" />
              )}
            </button>
          </div>

          {/* Rate trader (completed, not yet rated) */}
          {trade.status === 'completed' && !ratingSubmitted && (
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-body-sm text-gray-500 text-center mb-3">
                Califica a{' '}
                <strong className="text-gray-900">
                  @{trade.counterparty.username}
                </strong>
              </p>
              <div className="flex justify-center mb-3">
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="transition-transform active:scale-90 hover:scale-110 p-0.5"
                    >
                      <Star
                        className={cn(
                          'size-7 transition-colors',
                          rating >= star
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-transparent text-gray-300'
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>
              {rating > 0 && (
                <button
                  type="button"
                  onClick={() => setRatingSubmitted(true)}
                  className="w-full h-10 rounded-xl font-[family-name:var(--font-space-grotesk)] text-sm font-semibold text-fuchsia-600 bg-fuchsia-50 hover:bg-fuchsia-100 transition-colors active:scale-[0.98]"
                >
                  Enviar calificación
                </button>
              )}
            </div>
          )}

          {trade.status === 'completed' && ratingSubmitted && (
            <div className="flex flex-col items-center text-center bg-gray-50 rounded-2xl py-4">
              <div className="flex items-center justify-center size-9 rounded-full bg-emerald-100 mb-2">
                <Check className="size-4 text-emerald-600" strokeWidth={2.5} />
              </div>
              <p className="text-body-sm font-semibold text-gray-900">
                Gracias por tu calificación!
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {trade.status === 'completed' && (
              <button
                type="button"
                className="w-full h-12 rounded-xl flex items-center justify-center gap-2 font-[family-name:var(--font-space-grotesk)] text-sm font-semibold text-gray-700 border border-gray-200 bg-white hover:bg-gray-50 transition-all active:scale-[0.98]"
              >
                <Download className="size-4" />
                Descargar recibo
              </button>
            )}
            {isWithin24h && (
              <button
                type="button"
                className="w-full h-10 rounded-xl flex items-center justify-center gap-2 font-[family-name:var(--font-space-grotesk)] text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
              >
                <Flag className="size-4" />
                Reportar problema
              </button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ============================================
// FREELANCER TRADES VIEW
// ============================================

function FreelancerTradesView() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TradeStatus>('active');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<FreelancerTrade | null>(
    null
  );

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredTrades = useMemo(
    () => MOCK_TRADES.filter((t) => t.status === activeTab),
    [activeTab]
  );

  const counts = useMemo(
    () => ({
      active: MOCK_TRADES.filter((t) => t.status === 'active').length,
      completed: MOCK_TRADES.filter((t) => t.status === 'completed').length,
      disputed: MOCK_TRADES.filter((t) => t.status === 'disputed').length,
    }),
    []
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const tabs: { status: TradeStatus; label: string }[] = [
    { status: 'active', label: 'Activos' },
    { status: 'completed', label: 'Completados' },
    { status: 'disputed', label: 'Disputados' },
  ];

  const emptyMessages: Record<
    TradeStatus,
    { title: string; description?: string; action?: string }
  > = {
    active: { title: 'No tienes trades activos' },
    completed: {
      title: 'Aún no has completado ningún trade',
      action: 'Hacer mi primer trade',
    },
    disputed: { title: 'No tienes disputas' },
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-h3 text-black">Mis Trades</h1>
        <button
          type="button"
          onClick={handleRefresh}
          className={cn(
            'flex items-center justify-center size-9 rounded-full bg-gray-100 hover:bg-gray-200 transition-all active:scale-95',
            isRefreshing && 'animate-spin'
          )}
          aria-label="Actualizar"
        >
          <RefreshCw className="size-4 text-gray-500" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-6">
        {tabs.map(({ status, label }) => (
          <button
            key={status}
            type="button"
            onClick={() => setActiveTab(status)}
            className={cn(
              'flex-1 py-3 rounded-xl font-semibold transition-all text-sm',
              activeTab === status
                ? 'bg-magenta-500 text-white shadow-md shadow-magenta-500/20'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {label}
            {counts[status] > 0 && (
              <span
                className={cn(
                  'ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold',
                  activeTab === status
                    ? 'bg-white/25 text-white'
                    : 'bg-gray-200 text-gray-500'
                )}
              >
                {counts[status]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Trade list */}
      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse"
            >
              <div className="flex justify-between mb-3">
                <div className="h-3 w-32 bg-gray-200 rounded" />
                <div className="h-5 w-20 bg-gray-200 rounded-full" />
              </div>
              <div className="h-4 w-40 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-48 bg-gray-200 rounded mb-3" />
              <div className="border-t border-gray-100 pt-2 flex justify-between">
                <div className="h-3 w-32 bg-gray-200 rounded" />
                <div className="h-3 w-24 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredTrades.length > 0 ? (
        <div className="space-y-3">
          {filteredTrades.map((trade, index) => (
            <FadeIn key={trade.id} delay={index * 0.05}>
              <TradeCard
                trade={trade}
                onTap={() => setSelectedTrade(trade)}
              />
            </FadeIn>
          ))}
        </div>
      ) : (
        <FadeIn>
          <EmptyState
            icon={
              activeTab === 'active' ? (
                <Clock className="w-14 h-14 text-gray-300" />
              ) : activeTab === 'completed' ? (
                <ArrowDownRight className="w-14 h-14 text-gray-300" />
              ) : (
                <AlertTriangle className="w-14 h-14 text-gray-300" />
              )
            }
            title={emptyMessages[activeTab].title}
            description={emptyMessages[activeTab].description}
            actionText={emptyMessages[activeTab].action}
            onAction={
              emptyMessages[activeTab].action
                ? () => router.push('/trade')
                : undefined
            }
          />
        </FadeIn>
      )}

      {/* Trade detail sheet */}
      <TradeDetailSheet
        trade={selectedTrade}
        open={selectedTrade !== null}
        onClose={() => setSelectedTrade(null)}
      />
    </>
  );
}

// ============================================
// MARKETPLACE VIEW (existing — for Market Makers)
// ============================================

function MarketplaceView() {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('sell');
  const [isLoading, setIsLoading] = useState(true);
  const orders = useStore((s) => s.orders);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'buy') {
      return order.type === 'sell' && order.status === 'open';
    } else {
      return order.type === 'buy' && order.status === 'open';
    }
  });

  return (
    <>
      <h1 className="text-h3 text-black mb-6">Marketplace</h1>

      <div className="flex gap-6 border-b border-gray-200 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('buy')}
          className={`text-body pb-3 -mb-px transition-colors ${
            activeTab === 'buy'
              ? 'text-primary-600 font-semibold border-b-2 border-primary-500'
              : 'text-gray-500 font-medium hover:text-primary-500'
          }`}
        >
          Buy USDC
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('sell')}
          className={`text-body pb-3 -mb-px transition-colors ${
            activeTab === 'sell'
              ? 'text-primary-600 font-semibold border-b-2 border-primary-500'
              : 'text-gray-500 font-medium hover:text-primary-500'
          }`}
        >
          Sell USDC
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <OrderCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order, index) => (
            <FadeIn key={order.id} delay={index * 0.05}>
              <OrderCard order={order} />
            </FadeIn>
          ))}
        </div>
      ) : (
        <FadeIn>
          <EmptyState
            icon={<Package className="w-16 h-16 text-gray-300" />}
            title="No orders available. Check back later or create your own order."
          />
        </FadeIn>
      )}
    </>
  );
}

// ============================================
// MAIN PAGE (role-aware)
// ============================================

export default function OrdersPage() {
  const { isFreelancer, loading } = useUser();

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse"
          >
            <div className="h-4 w-32 bg-gray-200 rounded mb-3" />
            <div className="h-4 w-48 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return isFreelancer ? <FreelancerTradesView /> : <MarketplaceView />;
}
````

## File: app/pro/page.tsx
````typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';

export default function ProDashboardPage() {
  const router = useRouter();
  const { user, loading } = useUser();

  // Debug logs
  console.log('ProDashboard - loading:', loading);
  console.log('ProDashboard - user:', user);
  console.log('ProDashboard - user?.role:', user?.role);

  // Protección: solo market makers (usando useEffect para evitar el redirect durante render)
  useEffect(() => {
    if (!loading && (!user || user.role !== 'MARKET_MAKER')) {
      console.log('ProDashboard - Redirecting to / because not MM');
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="flex items-center justify-center py-20">Cargando...</div>;
  }

  // Si no hay usuario o no es MM, mostrar loading mientras redirige
  if (!user || user.role !== 'MARKET_MAKER') {
    return <div className="flex items-center justify-center py-20">Redirigiendo...</div>;
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Market Maker Dashboard</h1>
        <p className="text-sm text-gray-600">Gestiona tus órdenes de liquidez</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="text-sm text-gray-600">Órdenes Activas</div>
          <div className="text-2xl font-bold mt-2">0</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="text-sm text-gray-600">Volumen 24h</div>
          <div className="text-2xl font-bold mt-2">$0</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="text-sm text-gray-600">Profit Estimado</div>
          <div className="text-2xl font-bold mt-2 text-green-600">+$0</div>
        </div>
      </div>

      {/* Orders Table Placeholder */}
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Tus Órdenes</h2>
        <div className="text-center text-gray-500 py-12">
          <p>Dashboard de Market Maker</p>
          <p className="text-sm mt-2">La tabla de órdenes y formulario de creación irán aquí</p>
        </div>
      </div>
    </>
  );
}
````

## File: components/QuickActions.tsx
````typescript
'use client';

import { useState } from 'react';
import { useAuth } from '@crossmint/client-sdk-react-ui';
import {
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  HelpCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import WalletModal from '@/components/WalletModal';
import DepositModal from '@/components/DepositModal';

const actions = [
  { icon: Wallet, label: 'Wallet', id: 'wallet' },
  { icon: ArrowDownToLine, label: 'Deposit', id: 'deposit' },
  { icon: ArrowUpFromLine, label: 'Withdraw', id: 'withdraw' },
  { icon: HelpCircle, label: 'Support', id: 'support' },
] as const;

export default function QuickActions() {
  const { user, disconnectWallet } = useStore();
  const { logout } = useAuth();
  const [walletOpen, setWalletOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const walletAddress = user.walletAddress ?? '';

  const handleDisconnect = async () => {
    try {
      await logout();
    } catch {}

    disconnectWallet();
  };

  const handleAction = (id: string) => {
    switch (id) {
      case 'wallet':
        setWalletOpen(true);
        break;
      case 'deposit':
        setDepositOpen(true);
        break;
      default:
        toast.info(`${id.charAt(0).toUpperCase() + id.slice(1)} coming soon`);
    }
  };

  return (
    <>
      <div className="mt-6 grid grid-cols-4 gap-2">
        {actions.map(({ icon: Icon, label, id }) => (
          <Button
            key={id}
            variant="ghost"
            onClick={() => handleAction(id)}
            className="group flex flex-col items-center gap-2 py-3 h-auto text-gray-600 border-1 border-primary-500 rounded-xl hover:bg-gray-50 hover:text-magenta-600 hover:scale-105 transition-all duration-200"
          >
            <Icon className="w-8 h-8 text-magenta-500 group-hover:text-magenta-600" />
            <span className="text-body-sm font-medium">{label}</span>
          </Button>
        ))}
      </div>

      <WalletModal
        isOpen={walletOpen}
        onClose={() => setWalletOpen(false)}
        walletAddress={walletAddress}
        balanceUsdc={user.balance.usdc}
        balanceXlm={5.5}
        onDisconnect={() => void handleDisconnect()}
      />

      <DepositModal
        isOpen={depositOpen}
        onClose={() => setDepositOpen(false)}
        walletAddress={walletAddress}
      />
    </>
  );
}
````

## File: app/quick-trade/page.tsx
````typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import BalanceCard from '@/components/BalanceCard';
import QuickActions from '@/components/QuickActions';
import HowItWorks from '@/components/HowItWorks';
import RecentActivity from '@/components/RecentActivity';

// Mock: returns completed trades from localStorage (or empty array for new users)
function getCompletedTrades(): { amount: number; arsTotal: number; date: string }[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('peerlypay_completed_trades');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function QuickTradePage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [hasCompletedTrades, setHasCompletedTrades] = useState(false);
  const [activityStats, setActivityStats] = useState({
    weeklyTrades: 0,
    totalConverted: 0,
    avgPerTrade: 0,
  });

  useEffect(() => {
    const trades = getCompletedTrades();
    if (trades.length > 0) {
      setHasCompletedTrades(true);
      const totalArs = trades.reduce((sum, t) => sum + t.arsTotal, 0);
      const totalUsdc = trades.reduce((sum, t) => sum + t.amount, 0);
      setActivityStats({
        weeklyTrades: trades.length,
        totalConverted: totalArs,
        avgPerTrade: Math.round(totalUsdc / trades.length),
      });
    }
  }, []);

  // Protección: solo freelancers
  if (!loading && (!user || user.role !== 'FREELANCER')) {
    router.push('/');
    return null;
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20">Cargando...</div>;
  }

  return (
    <>
      <BalanceCard />
      <QuickActions />
      {hasCompletedTrades ? (
        <RecentActivity
          weeklyTrades={activityStats.weeklyTrades}
          totalConverted={activityStats.totalConverted}
          avgPerTrade={activityStats.avgPerTrade}
        />
      ) : (
        <HowItWorks />
      )}
    </>
  );
}
````

## File: components/BottomNav.tsx
````typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, User, LayoutDashboard, Activity, Zap } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { user, isFreelancer, isMarketMaker, loading } = useUser();

  // No mostrar si está cargando o no hay usuario
  if (loading || !user) return null;

  const freelancerTabs = [
    { href: '/quick-trade', icon: Home, label: 'Home' },
    { href: '/trade', icon: Zap, label: 'Trade' },
    { href: '/orders', icon: FileText, label: 'Orders' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  const marketMakerTabs = [
    { href: '/pro', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/monitor', icon: Activity, label: 'Monitor' },
    { href: '/orders', icon: FileText, label: 'Trades' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  // CRITICAL: usar la condición correcta
  const tabs = isFreelancer ? freelancerTabs : marketMakerTabs;

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-40 w-full max-w-120 -translate-x-1/2 border-t border-gray-200 bg-white shadow-lg pb-safe"
      aria-label="Bottom navigation"
    >
      <div className="flex items-center justify-around h-16 px-1">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-1 px-4 py-2 transition-colors ${
                isActive
                  ? 'text-pink-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
````

## File: app/layout.tsx
````typescript
import type { Metadata } from "next";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import LayoutShell from "@/components/LayoutShell";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { UserProvider } from "@/contexts/UserContext";
import { Providers } from "./providers";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "PeerlyPay",
  description: "P2P Exchange on Stellar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${spaceGrotesk.variable} font-sans`}>
        <Providers>
          <UserProvider>
            <LayoutShell>{children}</LayoutShell>
            <Toaster />
          </UserProvider>
        </Providers>
      </body>
    </html>
  );
}
````

## File: app/page.tsx
````typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { RoleSelection } from '@/components/RoleSelection';
import type { UserRole } from '@/types/user';

export default function RootPage() {
  const router = useRouter();
  const { user, setUser, loading } = useUser();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'FREELANCER') {
        router.replace('/quick-trade');
      } else if (user.role === 'MARKET_MAKER') {
        router.replace('/pro');
      }
    }
  }, [user, loading, router]);

  const handleRoleSelected = (role: UserRole) => {
    const newUser = {
      id: crypto.randomUUID(),
      walletAddress: 'mock-wallet',
      role,
      createdAt: new Date(),
    };

    setUser(newUser);

    if (role === 'FREELANCER') {
      router.replace('/quick-trade');
    } else {
      router.replace('/pro');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return <RoleSelection onSelectRole={handleRoleSelected} />;
  }

  // Logged-in users get redirected by the useEffect above.
  // Show nothing while the redirect happens.
  return null;
}
````
