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
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Copy CBU
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(MOCK_PAYMENT.cbu);
    } catch {
      // clipboard unavailable
    } finally {
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
