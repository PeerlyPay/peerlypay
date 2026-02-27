'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWallet } from '@crossmint/client-sdk-react-ui';
import {
  Copy,
  Check,
  ArrowLeft,
  Clock,
  Building2,
  Smartphone,
  X,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import TradeChatDrawer from '@/components/trade/TradeChatDrawer';
import { submitFiatPaymentWithCrossmint } from '@/lib/p2p-crossmint';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { PaymentMethodCode } from '@/types';

// ─── Static mock payment details by payment method ────────────────────────────

interface PaymentDetails {
  label: string;
  icon: 'bank' | 'mobile';
  accountHolder: string;
  bank?: string;
  cbu?: string;
  alias?: string;
  phone?: string;
}

const PAYMENT_DETAILS: Record<number, PaymentDetails> = {
  [PaymentMethodCode.BankTransfer]: {
    label: 'Bank Transfer',
    icon: 'bank',
    accountHolder: 'Juan Pérez',
    bank: 'Banco Galicia',
    cbu: '0000003100010123456789',
    alias: 'JUANPEREZ.GALICIA',
  },
  [PaymentMethodCode.MobileWallet]: {
    label: 'Mobile Wallet',
    icon: 'mobile',
    accountHolder: 'Juan Pérez',
    alias: 'juanperez.mp',
    phone: '+54 9 11 4567-8901',
  },
  [PaymentMethodCode.MercadoPago]: {
    label: 'Mercado Pago',
    icon: 'mobile',
    accountHolder: 'Juan Pérez',
    alias: 'juanperez.mp',
    phone: '+54 9 11 4567-8901',
  },
  [PaymentMethodCode.Nequi]: {
    label: 'Nequi',
    icon: 'mobile',
    accountHolder: 'Carlos Rodríguez',
    phone: '+57 300 123 4567',
  },
  [PaymentMethodCode.PagoMovil]: {
    label: 'Pago Móvil',
    icon: 'mobile',
    accountHolder: 'María González',
    phone: '+58 412 987 6543',
  },
  [PaymentMethodCode.Zelle]: {
    label: 'Zelle',
    icon: 'mobile',
    accountHolder: 'John Smith',
    phone: '+1 305 555 0123',
  },
  [PaymentMethodCode.Wise]: {
    label: 'Wise',
    icon: 'bank',
    accountHolder: 'Juan Pérez',
    alias: 'juanperez@wise.com',
  },
};

const MOCK_RATE = 1_485;
const FEE_RATE = 0.005;
const COUNTDOWN_SECONDS = 15 * 60; // 15 minutes

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFiat(value: number): string {
  return value.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function shortAddress(addr: string): string {
  if (addr.length <= 13) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

// ─── Countdown ring ───────────────────────────────────────────────────────────

function CountdownRing({ seconds, total }: { seconds: number; total: number }) {
  const radius = 27;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, seconds / total);
  const offset = circumference * (1 - progress);
  const isUrgent = seconds < 60;
  const isWarning = seconds < 300 && !isUrgent;

  return (
    <div className="flex flex-col items-center gap-0.5 shrink-0">
      <div className="relative size-[66px] flex items-center justify-center">
        <svg
          className="-rotate-90 absolute inset-0 size-full"
          viewBox="0 0 66 66"
          aria-hidden="true"
        >
          <circle
            cx="33"
            cy="33"
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="4"
          />
          <circle
            cx="33"
            cy="33"
            r={radius}
            fill="none"
            stroke={isUrgent ? '#ef4444' : isWarning ? '#f59e0b' : '#d946ef'}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <span
          className={cn(
            'font-[family-name:var(--font-jetbrains-mono)] text-[11px] font-bold tabular-nums z-10',
            isUrgent
              ? 'text-red-500'
              : isWarning
                ? 'text-amber-500'
                : 'text-gray-800',
          )}
        >
          {formatTime(seconds)}
        </span>
      </div>
      <span className="text-[10px] text-gray-400 font-medium">Time left</span>
    </div>
  );
}

// ─── Copy field row ───────────────────────────────────────────────────────────

function CopyRow({
  label,
  value,
  copyKey,
  activeCopy,
  onCopy,
  mono = true,
}: {
  label: string;
  value: string;
  copyKey: string;
  activeCopy: string | null;
  onCopy: (text: string, key: string) => void;
  mono?: boolean;
}) {
  const isCopied = activeCopy === copyKey;
  return (
    <div>
      <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
        {label}
      </p>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'flex-1 text-[13px] text-gray-900 break-all',
            mono
              ? 'font-[family-name:var(--font-jetbrains-mono)] tabular-nums'
              : 'font-medium',
          )}
        >
          {value}
        </span>
        <button
          type="button"
          onClick={() => onCopy(value, copyKey)}
          className={cn(
            'shrink-0 flex items-center justify-center size-8 rounded-lg transition-all active:scale-95',
            isCopied
              ? 'bg-lime-100 text-lime-600'
              : 'bg-white text-gray-400 hover:text-gray-600 hover:bg-gray-100',
          )}
          aria-label={`Copy ${label}`}
        >
          {isCopied ? (
            <Check className="size-4" strokeWidth={2.5} />
          ) : (
            <Copy className="size-4" />
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Main page content ────────────────────────────────────────────────────────

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { wallet } = useWallet();

  const walletAddress = useStore((s) => s.user.walletAddress);
  const orders = useStore((s) => s.orders);
  const updateOrderStatus = useStore((s) => s.updateOrderStatus);
  const refreshOrdersFromChain = useStore((s) => s.refreshOrdersFromChain);

  // URL params
  const flowId = searchParams.get('flowId') ?? '';
  const fillUsdc = parseFloat(
    searchParams.get('fillUsdc') ?? searchParams.get('amount') ?? '100',
  );
  const intentUsdc = parseFloat(
    searchParams.get('intentUsdc') ??
      searchParams.get('requestedAmount') ??
      String(fillUsdc),
  );
  const mode = (searchParams.get('mode') ?? 'buy') as 'buy' | 'sell';
  const orderId = searchParams.get('orderId') ?? '';

  // Resolve maker info and payment method from order store
  const order = orders.find((o) => o.id === orderId);
  const paymentMethodCode =
    order?.paymentMethodCode ?? PaymentMethodCode.BankTransfer;
  const payment =
    PAYMENT_DETAILS[paymentMethodCode] ??
    PAYMENT_DETAILS[PaymentMethodCode.BankTransfer];

  const makerName = order?.displayName ?? 'JuanC_AR';
  const makerAddress = order?.createdBy ?? '0x1234...5678';
  const makerScore = order?.reputation_score ?? 47;
  const makerRate = order?.completionRate ?? 98;
  const makerVerified = order?.isVerified ?? true;

  // Amounts
  const fiatGross = fillUsdc * MOCK_RATE;
  const feeArs = fillUsdc * FEE_RATE * MOCK_RATE;
  const totalToPay = fiatGross - feeArs;
  const isAdjusted = Math.abs(intentUsdc - fillUsdc) > 0.0001;

  // Local state
  const [activeCopy, setActiveCopy] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [expired, setExpired] = useState(false);

  // Countdown — runs once on mount
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopy = useCallback(async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* silent */
    }
    setActiveCopy(key);
    setTimeout(() => setActiveCopy(null), 2000);
  }, []);

  const handlePaymentSent = useCallback(async () => {
    if (!walletAddress) {
      toast.error('Connect your wallet first');
      return;
    }
    if (!orderId) {
      toast.error('No order selected');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitFiatPaymentWithCrossmint({
        wallet,
        caller: walletAddress,
        orderId,
      });
      updateOrderStatus(orderId, 'AwaitingConfirmation');
      await refreshOrdersFromChain();
      router.push(
        `/trade/waiting?flowId=${encodeURIComponent(flowId)}&fillUsdc=${fillUsdc}&intentUsdc=${intentUsdc}&mode=${mode}&orderId=${orderId}`,
      );
    } catch (err) {
      console.error('Failed to submit fiat payment', err);
      toast.error('Failed to submit payment');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    fillUsdc,
    flowId,
    intentUsdc,
    mode,
    orderId,
    refreshOrdersFromChain,
    router,
    updateOrderStatus,
    wallet,
    walletAddress,
  ]);

  const avatarInitials = makerName.slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      {/* ── Header ── */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center justify-center size-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors active:scale-95"
            aria-label="Go back"
          >
            <ArrowLeft className="size-5 text-gray-900" />
          </button>
          <div>
            <h2 className="font-[family-name:var(--font-space-grotesk)] text-[17px] font-bold text-gray-900 leading-tight">
              Send Payment
            </h2>
            <p className="text-[11px] text-gray-400 leading-none mt-0.5">
              Complete your fiat transfer
            </p>
          </div>
        </div>
        <CountdownRing seconds={countdown} total={COUNTDOWN_SECONDS} />
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-4 pb-2 space-y-3 animate-fadeIn">
        {/* Order summary card */}
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          {/* Seller row */}
          <div className="flex items-center gap-3 mb-3">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="size-11 rounded-full bg-gradient-to-br from-fuchsia-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold font-[family-name:var(--font-space-grotesk)] select-none">
                {avatarInitials}
              </div>
              <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-lime-400 border-2 border-white" />
            </div>
            {/* Name + address */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-[family-name:var(--font-space-grotesk)] text-sm font-semibold text-gray-900 truncate">
                  {makerName}
                </span>
                {makerVerified && (
                  <span className="shrink-0 size-[15px] rounded-full bg-indigo-500 flex items-center justify-center text-white text-[8px] font-bold">
                    ✓
                  </span>
                )}
              </div>
              <span className="font-[family-name:var(--font-jetbrains-mono)] text-[11px] text-gray-400 block truncate">
                {shortAddress(makerAddress)}
              </span>
            </div>
            {/* Reputation */}
            <div className="shrink-0 text-right">
              <span className="text-[11px] text-gray-500 block">
                ⭐ {makerScore} trades
              </span>
              <span className="text-[11px] font-semibold text-lime-600">
                {makerRate}% done
              </span>
            </div>
          </div>

          <div className="h-px bg-gray-200 mb-3" />

          {/* Trade breakdown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-gray-500">You receive</span>
              <span className="font-[family-name:var(--font-jetbrains-mono)] text-[13px] font-semibold text-gray-900 tabular-nums">
                {fillUsdc.toFixed(2)} USDC
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-gray-500">Exchange rate</span>
              <span className="font-[family-name:var(--font-jetbrains-mono)] text-[13px] text-gray-700 tabular-nums">
                1 USDC = {MOCK_RATE.toLocaleString('es-AR')} ARS
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-gray-500">
                Platform fee (0.5%)
              </span>
              <span className="font-[family-name:var(--font-jetbrains-mono)] text-[13px] text-gray-400 tabular-nums">
                −{formatFiat(feeArs)} ARS
              </span>
            </div>
          </div>

          <div className="h-px bg-gray-200 mt-3 mb-3" />

          {/* Total */}
          <div className="flex items-center justify-between">
            <span className="font-[family-name:var(--font-space-grotesk)] text-sm font-semibold text-gray-700">
              Total to send
            </span>
            <div className="text-right">
              <span className="font-[family-name:var(--font-jetbrains-mono)] text-2xl font-bold text-fuchsia-600 tabular-nums">
                ${formatFiat(totalToPay)}
              </span>
              <span className="font-[family-name:var(--font-jetbrains-mono)] text-sm font-semibold text-fuchsia-400 ml-1">
                ARS
              </span>
            </div>
          </div>
        </div>

        {/* Adjusted amount notice */}
        {isAdjusted && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
            <AlertCircle className="size-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-relaxed">
              Requested {intentUsdc.toFixed(2)} USDC — this swap executes{' '}
              {fillUsdc.toFixed(2)} USDC.
            </p>
          </div>
        )}

        {/* Payment instructions card */}
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 space-y-3">
          {/* Method header */}
          <div className="flex items-center gap-2">
            {payment.icon === 'bank' ? (
              <Building2 className="size-4 text-indigo-500 shrink-0" />
            ) : (
              <Smartphone className="size-4 text-indigo-500 shrink-0" />
            )}
            <span className="font-[family-name:var(--font-space-grotesk)] text-sm font-bold text-indigo-700">
              {payment.label}
            </span>
            <span className="ml-auto shrink-0 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-semibold uppercase tracking-wide">
              Transfer type
            </span>
          </div>

          <div className="h-px bg-indigo-100" />

          {/* Account holder — no copy needed */}
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
              Account holder
            </p>
            <p className="text-[13px] font-semibold text-gray-900">
              {payment.accountHolder}
            </p>
          </div>

          {payment.bank && (
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                Bank
              </p>
              <p className="text-[13px] font-medium text-gray-900">
                {payment.bank}
              </p>
            </div>
          )}

          {payment.cbu && (
            <CopyRow
              label="CBU"
              value={payment.cbu}
              copyKey="cbu"
              activeCopy={activeCopy}
              onCopy={handleCopy}
            />
          )}

          {payment.alias && (
            <CopyRow
              label="Alias / CVU"
              value={payment.alias}
              copyKey="alias"
              activeCopy={activeCopy}
              onCopy={handleCopy}
              mono={false}
            />
          )}

          {payment.phone && (
            <CopyRow
              label="Phone number"
              value={payment.phone}
              copyKey="phone"
              activeCopy={activeCopy}
              onCopy={handleCopy}
            />
          )}

          {/* Instruction note */}
          <div className="flex items-center gap-2 mt-1 pt-3 border-t border-indigo-100">
            <ShieldCheck className="size-4 text-indigo-400 shrink-0" />
            <p className="text-[11px] text-indigo-500 leading-snug">
              Complete this transfer in your banking app, then tap the button
              below.
            </p>
          </div>
        </div>

        {/* Expired warning */}
        {expired && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <Clock className="size-5 text-red-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-700">
                Time expired
              </p>
              <p className="text-xs text-red-500 mt-0.5">
                This trade window has closed. Cancel and try again.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom actions ── */}
      <div className="px-4 pt-3 pb-6 border-t border-gray-100 space-y-2 bg-white">
        <button
          type="button"
          onClick={handlePaymentSent}
          disabled={isSubmitting || expired}
          className={cn(
            'w-full h-14 rounded-2xl font-[family-name:var(--font-space-grotesk)] text-base font-bold text-white transition-all active:scale-[0.98]',
            isSubmitting || expired
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-fuchsia-500 to-fuchsia-600 shadow-lg shadow-fuchsia-500/25 hover:opacity-90',
          )}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="size-5 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />
              Submitting...
            </span>
          ) : (
            "I've sent the payment"
          )}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all active:scale-[0.98]"
        >
          <X className="size-4" />
          Cancel trade
        </button>
        <TradeChatDrawer
          triggerLabel="Message seller"
          sellerLabel={makerName}
          flowId={flowId}
          enableVendorRequest={mode === 'sell'}
          triggerClassName="w-full flex items-center justify-center gap-2 text-body-sm font-medium text-fuchsia-600 hover:text-fuchsia-700 transition-colors"
        />
      </div>
    </div>
  );
}

export default function TradePaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20 text-gray-400">
          Loading...
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
