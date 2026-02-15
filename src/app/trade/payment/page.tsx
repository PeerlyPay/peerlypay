'use client';

import { useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Copy, Check, MessageCircle } from 'lucide-react';
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

function formatFiat(value: number): string {
  return value.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const amount = parseFloat(searchParams.get('amount') || '100');
  const fiatAmount = amount * MOCK_RATE;
  const feeArs = amount * FEE_RATE * MOCK_RATE;
  const totalToPay = fiatAmount - feeArs;

  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(MOCK_PAYMENT.cbu);
    } catch {
    } finally {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

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
          Make Payment
        </h2>
      </div>

      {/* Centered content */}
      <div className="flex-1 flex flex-col items-center px-6 pt-8">
        {/* Icon */}
        <img
          src="/icons/payment-sent.svg"
          alt="Send payment"
          className="w-32 h-32 mb-8"
        />

        {/* Heading */}
        <h1 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold text-gray-900 mb-2">
          Send payment
        </h1>

        {/* Amount */}
        <p className="font-[family-name:var(--font-jetbrains-mono)] text-lg font-semibold text-gray-600 tabular-nums mb-8">
          Transfer ${formatFiat(totalToPay)} ARS
        </p>

        {/* Payment Details Card */}
        <div className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-5">
          <p className="text-body-sm text-gray-500 mb-2">Transfer to:</p>
          <p className="text-body font-semibold text-gray-900 mb-1">
            {MOCK_PAYMENT.accountHolder} — {MOCK_PAYMENT.bank}
          </p>
          <div className="flex items-center gap-2">
            <span className="font-[family-name:var(--font-jetbrains-mono)] text-sm text-gray-900 tabular-nums">
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

      {/* Bottom actions */}
      <div className="p-4 pb-6 space-y-4">
        <button
          type="button"
          onClick={() => router.push(`/trade/waiting?amount=${amount}`)}
          className="w-full h-14 rounded-2xl font-[family-name:var(--font-space-grotesk)] text-base font-bold text-white bg-gradient-to-r from-primary-500 to-primary-600 shadow-lg shadow-primary-500/25 hover:opacity-90 transition-all active:scale-[0.98]"
        >
          Payment sent
        </button>
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 text-body-sm font-medium text-fuchsia-600 hover:text-fuchsia-700 transition-colors"
        >
          <MessageCircle className="size-4" />
          Message seller
        </button>
      </div>
    </div>
  );
}

export default function TradePaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">Loading...</div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
