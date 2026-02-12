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
  const mode = (searchParams.get('mode') || 'sell') as 'sell' | 'buy';
  const isSell = mode === 'sell';
  const rate = MOCK_RATE;
  const fiatAmount = amount * rate;
  const feeUsdc = amount * FEE_RATE;
  const feeArs = feeUsdc * rate;
  const totalAfterFee = isSell ? fiatAmount - feeArs : fiatAmount + feeArs;

  const handleConfirm = useCallback(async () => {
    setIsChecking(true);
    const hasTrustline = await checkUSDCTrustline();
    setIsChecking(false);

    if (hasTrustline) {
      router.push(`/trade/payment?amount=${amount}&mode=${mode}`);
    } else {
      router.push(`/trade/enable-usdc?amount=${amount}&mode=${mode}`);
    }
  }, [router, amount, mode]);

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
          {isSell ? 'Confirmar Venta' : 'Confirmar Compra'}
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
            <span className="text-body-sm text-gray-500">{isSell ? 'Recibirás' : 'Pagarás'}</span>
            <span className={cn(
              'font-[family-name:var(--font-jetbrains-mono)] text-base font-semibold tabular-nums',
              isSell ? 'text-emerald-600' : 'text-blue-600'
            )}>
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
            <span className="text-body font-bold text-gray-900">
              {isSell ? 'Total a recibir' : 'Total a pagar'}
            </span>
            <span className={cn(
              'font-[family-name:var(--font-jetbrains-mono)] text-xl font-bold tabular-nums',
              isSell ? 'text-emerald-600' : 'text-blue-600'
            )}>
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
                  {isSell
                    ? 'Tu USDC irá a escrow hasta que el comprador confirme el pago'
                    : 'Tu ARS irá a escrow hasta que el vendedor libere los USDC'}
                </p>
                <p className="text-body-sm text-amber-700">
                  {isSell
                    ? 'Solo transfiere a la cuenta indicada'
                    : 'Solo paga al método indicado'}
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
            isSell ? 'Confirmar Venta' : 'Confirmar Compra'
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
