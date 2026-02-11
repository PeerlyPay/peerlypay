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
