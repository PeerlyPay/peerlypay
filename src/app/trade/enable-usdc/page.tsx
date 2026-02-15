'use client';

import { useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Loader2,
  ChevronDown,
  ArrowLeft,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
          Why is this needed?
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
        <div className="px-4 pb-4">
          <p className="text-body-sm text-gray-500">
            Stellar wallets need permission to hold each token type. This is a one-time setup for USDC.
          </p>
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

  const amount = searchParams.get('amount') || '0';
  const requestedAmount = searchParams.get('requestedAmount') || amount;
  const mode = searchParams.get('mode') || 'buy';
  const orderId = searchParams.get('orderId') || '';
  const [isEnabling, setIsEnabling] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  const handleEnable = useCallback(async () => {
    setIsEnabling(true);

    // Mock: simulate trustline creation (2s delay)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Navigate to payment
    router.push(`/trade/payment?amount=${amount}&requestedAmount=${requestedAmount}&mode=${mode}&orderId=${orderId}`);
  }, [amount, mode, orderId, requestedAmount, router]);

  const handleCancel = useCallback(() => {
    setShowCancel(false);
    router.push('/trade');
  }, [router]);

  return (
    <div className="flex flex-col min-h-dvh bg-white">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 pt-4 pb-3">
        <button
          type="button"
          onClick={() => setShowCancel(true)}
          disabled={isEnabling}
          className="flex items-center justify-center size-6 text-gray-900"
        >
          <ArrowLeft className="size-5" />
        </button>
        <span className="font-[family-name:var(--font-space-grotesk)] text-[19px] font-semibold text-gray-900">
          Enable USDC
        </span>
      </header>

      {/* Main content — centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Icon */}
        <img
          src="/icons/enable-usdc.svg"
          alt="Enable USDC"
          className="size-28 mb-8"
        />

        {/* Text */}
        <h1 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold text-gray-900 mb-3 text-center">
          One-time setup
        </h1>
        <p className="text-body text-gray-500 text-center max-w-[300px]">
          Allow your wallet to receive USDC tokens.
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
              : 'bg-fuchsia-500 hover:bg-fuchsia-600 shadow-lg shadow-fuchsia-500/25'
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
