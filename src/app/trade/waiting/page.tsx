'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Check,
  Loader2,
  MessageCircle,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const MOCK_MAKER = 'crypto_trader_ar';

/** Demo: auto-confirm after this many seconds */
const MOCK_CONFIRM_DELAY_S = 10;

// ============================================
// WAITING CONTENT
// ============================================
function WaitingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const amount = parseFloat(searchParams.get('amount') || '0.11');

  const [elapsed, setElapsed] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

  // Elapsed timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Mock "poll" every 5 seconds
  useEffect(() => {
    if (elapsed > 0 && elapsed % 5 === 0) {
      setIsChecking(true);
      const timeout = setTimeout(() => setIsChecking(false), 800);
      return () => clearTimeout(timeout);
    }
  }, [elapsed]);

  // Mock auto-confirm
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

      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-4">
        {/* Progress Steps */}
        <div className="flex items-center gap-3 w-full max-w-xs mb-10">
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
        <div className="flex flex-col items-center text-center">
          {/* Animated spinner ring */}
          <div className="relative flex items-center justify-center size-24 mb-6">
            <div className="absolute inset-0 rounded-full bg-fuchsia-100 animate-pulse" />
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
          <p className="text-caption text-gray-400 mb-5">
            Generalmente toma ~3 minutos
          </p>

          {/* Polling indicator */}
          <div className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300',
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
