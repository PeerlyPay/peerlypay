'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowDownUp,
  Delete,
  Loader2,
  Shield,
  Star,
  BadgeCheck,
  Clock,
  AlertCircle,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { estimateQuickTrade } from '@/lib/match-order';
import type { OrderType, MatchOrderResult, QuickTradeEstimate } from '@/types';

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

// ============================================
// NUMERIC KEYPAD (p2p.me style)
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
    <div className="grid grid-cols-3 gap-2.5 px-1">
      {KEYPAD_KEYS.map((key) => (
        <button
          key={key}
          type="button"
          disabled={disabled}
          onClick={() => onKey(key)}
          className={cn(
            'flex items-center justify-center h-[52px] rounded-2xl transition-all active:scale-[0.96]',
            'font-[family-name:var(--font-space-grotesk)] text-[22px] font-semibold',
            key === 'delete'
              ? 'bg-[#D4CAFE] text-[#6B5B95] active:bg-[#C4B8F0]'
              : 'bg-white/60 text-[#2D2150] hover:bg-white/80 active:bg-white/90',
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
// CONFIRMATION SCREEN
// ============================================
interface ConfirmationProps {
  match: MatchOrderResult;
  tradeType: OrderType;
  usdcAmount: number;
  fiatAmount: number;
  onConfirm: () => void;
  onBack: () => void;
  loading: boolean;
}

function ConfirmationScreen({
  match,
  tradeType,
  usdcAmount,
  fiatAmount,
  onConfirm,
  onBack,
  loading,
}: ConfirmationProps) {
  return (
    <div className="flex flex-col min-h-[calc(100dvh-64px)] bg-white">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center size-10 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors"
        >
          <ArrowLeft className="size-5 text-base-black" />
        </button>
        <h2 className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold text-base-black">
          Confirmar Orden
        </h2>
      </div>

      <div className="flex-1 px-4 pb-4 space-y-4 overflow-y-auto">
        {/* Maker card */}
        <div className="bg-neutral-50 rounded-2xl p-5">
          <p className="text-body-sm text-neutral-500 mb-3">
            {tradeType === 'buy' ? 'Comprando de' : 'Vendiendo a'}
          </p>
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="relative">
              <div className="flex size-12 items-center justify-center rounded-full bg-gradient-peerlypay">
                <span className="text-white font-[family-name:var(--font-space-grotesk)] text-lg font-bold">
                  {(match.maker.displayName ?? match.maker.address)[0].toUpperCase()}
                </span>
              </div>
              {match.maker.isVerified && (
                <BadgeCheck className="absolute -bottom-0.5 -right-0.5 size-5 fill-cyan-500 text-white" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <span className="font-[family-name:var(--font-space-grotesk)] text-base font-bold text-base-black truncate block">
                @{match.maker.displayName ?? match.maker.address}
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                <span className="text-body-sm text-neutral-600">
                  {match.maker.completionRate}% positivo
                </span>
                <span className="text-neutral-300">|</span>
                <span className="text-body-sm text-neutral-600">
                  {match.maker.totalOrders} trades
                </span>
              </div>
            </div>
          </div>

          {/* Estimated time */}
          <div className="flex items-center gap-2 mt-4 px-3 py-2.5 bg-white rounded-xl">
            <Clock className="size-4 text-neutral-400" />
            <span className="text-body-sm text-neutral-500">
              Tiempo estimado:
            </span>
            <span className="text-body-sm font-semibold text-base-black">
              ~3 minutos
            </span>
          </div>
        </div>

        {/* Trade summary */}
        <div className="bg-neutral-50 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-body-sm text-neutral-500">
              {tradeType === 'buy' ? 'Comprarás' : 'Venderás'}
            </span>
            <span className="text-mono-amount-sm font-semibold text-base-black">
              {formatUsdc(usdcAmount)} USDC
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-body-sm text-neutral-500">Tasa</span>
            <span className="text-mono-code text-base-black">
              1 USDC = {formatFiatCompact(match.rate)} ARS
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-body-sm text-neutral-500">Comisión (0.5%)</span>
            <span className="text-mono-code text-neutral-400">
              {formatFiat(match.fee)} ARS
            </span>
          </div>
          <div className="border-t border-neutral-200 pt-3 flex items-center justify-between">
            <span className="text-body font-bold text-base-black">
              {tradeType === 'buy' ? 'Pagarás' : 'Recibirás'}
            </span>
            <span className="font-[family-name:var(--font-jetbrains-mono)] text-xl font-bold text-base-black tabular-nums">
              ${formatFiatCompact(match.total)} ARS
            </span>
          </div>
        </div>

        {/* Escrow badge */}
        <div className="flex items-center gap-2.5 px-4 py-3.5 bg-emerald-50 rounded-2xl">
          <Shield className="size-5 text-emerald-600 shrink-0" />
          <span className="text-body-sm font-medium text-emerald-700">
            Protegido por escrow en Stellar
          </span>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="p-4 pb-6 border-t border-neutral-100">
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={cn(
            'w-full h-14 rounded-2xl font-[family-name:var(--font-space-grotesk)] text-base font-bold text-white transition-all active:scale-[0.98]',
            'bg-gradient-peerlypay shadow-peerlypay hover:opacity-90',
            loading && 'opacity-60 pointer-events-none'
          )}
        >
          {loading ? (
            <Loader2 className="size-5 animate-spin mx-auto" />
          ) : (
            'Confirmar Orden'
          )}
        </button>
      </div>
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
  const [matchResult, setMatchResult] = useState<MatchOrderResult | null>(null);
  const [step, setStep] = useState<'input' | 'confirm'>('input');
  const [isCalculating, setIsCalculating] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const numericValue = parseFloat(inputValue) || 0;

  // Derive trade type from input mode
  const tradeType: OrderType = inputMode === 'fiat' ? 'buy' : 'sell';

  // Calculate USDC amount for matching
  // In fiat mode: we need to convert ARS → USDC using best rate
  // In usdc mode: the input IS the USDC amount
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
        // SELL: user typed USDC, estimate ARS
        const result = estimateQuickTrade(orders, numericValue, 'sell');
        if (result) {
          setEstimate(result);
          setError(null);
        } else {
          setEstimate(null);
          setError('No hay órdenes disponibles para este monto');
        }
      } else {
        // BUY: user typed ARS, need to find best rate and reverse-calculate USDC
        // First get an estimate for a small amount to find the best rate
        const rateProbe = estimateQuickTrade(orders, 1, 'buy');
        if (rateProbe) {
          const impliedUsdc = numericValue / rateProbe.rate;
          // Now verify this USDC amount is actually available
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
      // Fiat mode allows larger numbers (up to 999,999.99)
      if (prev.replace('.', '').length >= 8) return prev;
      if (key === '.' && prev === '') return '0.';
      if (prev === '0' && key !== '.') return key;
      return prev + key;
    });
  }, []);

  // Swap input mode (the circular swap button)
  const handleSwap = useCallback(() => {
    setInputMode((prev) => (prev === 'fiat' ? 'usdc' : 'fiat'));
    setInputValue('');
    setEstimate(null);
    setError(null);
  }, []);

  // Set max amount
  const handleMax = useCallback(() => {
    if (inputMode === 'usdc') {
      // Max USDC from wallet balance or limit
      const maxUsdc = Math.min(user.balance.usdc, USDC_LIMIT);
      setInputValue(maxUsdc > 0 ? String(maxUsdc) : String(USDC_LIMIT));
    } else {
      // Max ARS: USDC_LIMIT * best rate
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

  // Match with best order
  const handleContinue = useCallback(async () => {
    if (!hasValidAmount || !user.walletAddress) return;

    const matchAmount = inputMode === 'usdc'
      ? numericValue
      : (estimate ? numericValue / estimate.rate : 0);

    if (matchAmount <= 0) return;

    setIsMatching(true);
    setError(null);

    try {
      const res = await fetch('/api/match-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: matchAmount,
          type: tradeType,
          userId: user.walletAddress,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'No se pudo encontrar una orden');
        setIsMatching(false);
        return;
      }

      const result: MatchOrderResult = await res.json();
      setMatchResult(result);
      setStep('confirm');
    } catch {
      setError('Error de conexión. Intentá de nuevo.');
    } finally {
      setIsMatching(false);
    }
  }, [hasValidAmount, numericValue, inputMode, tradeType, estimate, user.walletAddress]);

  // Confirm and redirect to escrow
  const handleConfirm = useCallback(() => {
    if (!matchResult) return;
    router.push(`/orders/${matchResult.matchedOrder.id}`);
  }, [matchResult, router]);

  // Back to input
  const handleBack = useCallback(() => {
    setStep('input');
    setMatchResult(null);
  }, []);

  // ============================================
  // DERIVED DISPLAY VALUES
  // ============================================
  const displayPrimary = inputValue || '0';

  // Secondary display: the converted amount
  let displaySecondary = '0.00';
  if (estimate && !isCalculating) {
    if (inputMode === 'fiat') {
      // User typed ARS → show USDC equivalent
      displaySecondary = formatUsdc(numericValue / estimate.rate);
    } else {
      // User typed USDC → show ARS equivalent
      displaySecondary = formatFiatCompact(estimate.total);
    }
  }

  // For confirmation screen
  const confirmUsdcAmount = inputMode === 'usdc'
    ? numericValue
    : (estimate ? numericValue / estimate.rate : 0);
  const confirmFiatAmount = inputMode === 'fiat'
    ? numericValue
    : (estimate ? estimate.total : 0);

  // ============================================
  // CONFIRMATION STEP
  // ============================================
  if (step === 'confirm' && matchResult) {
    return (
      <ConfirmationScreen
        match={matchResult}
        tradeType={tradeType}
        usdcAmount={confirmUsdcAmount}
        fiatAmount={confirmFiatAmount}
        onConfirm={handleConfirm}
        onBack={handleBack}
        loading={false}
      />
    );
  }

  // ============================================
  // INPUT STEP — p2p.me style
  // ============================================
  return (
    <div className="flex flex-col min-h-[calc(100dvh-64px)] bg-[#E5DEFF]">
      {/* Mode label */}
      <div className="pt-5 pb-2 px-6 text-center">
        <span className="font-[family-name:var(--font-dm-sans)] text-sm font-medium text-[#6B5B95]">
          {inputMode === 'fiat' ? 'Comprar USDC' : 'Vender USDC'}
        </span>
      </div>

      {/* ============================================
          AMOUNT DISPLAY AREA
          ============================================ */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-1 min-h-0">
        {/* Primary amount (what user is typing) */}
        <div className="flex items-center gap-1.5">
          {inputMode === 'fiat' && (
            <span className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold text-[#2D2150]/40">
              $
            </span>
          )}
          <span
            className={cn(
              'font-[family-name:var(--font-jetbrains-mono)] font-bold tracking-tight tabular-nums text-[#2D2150] transition-all',
              displayPrimary.length > 8
                ? 'text-3xl'
                : displayPrimary.length > 5
                  ? 'text-[42px] leading-none'
                  : 'text-[52px] leading-none'
            )}
          >
            {displayPrimary}
          </span>
          {inputMode === 'usdc' && (
            <span className="font-[family-name:var(--font-space-grotesk)] text-xl font-semibold text-[#2D2150]/40 self-end mb-1">
              USDC
            </span>
          )}
        </div>

        {/* Swap button */}
        <button
          type="button"
          onClick={handleSwap}
          className="my-2 flex items-center justify-center size-10 rounded-full bg-white/70 border border-white/90 shadow-sm hover:bg-white/90 active:scale-95 transition-all"
          aria-label="Cambiar moneda"
        >
          <ArrowDownUp className="size-[18px] text-[#6B5B95]" strokeWidth={2.5} />
        </button>

        {/* Secondary amount (calculated) */}
        <div className="flex items-center gap-1.5 h-8">
          {isCalculating && numericValue > 0 ? (
            <div className="flex items-center gap-2 text-[#6B5B95]/60">
              <Loader2 className="size-4 animate-spin" />
              <span className="text-body-sm">Calculando...</span>
            </div>
          ) : (
            <>
              <span className="font-[family-name:var(--font-space-grotesk)] text-lg font-medium text-[#6B5B95]/70">
                {inputMode === 'fiat' ? '≈' : '≈ $'}
              </span>
              <span className="font-[family-name:var(--font-jetbrains-mono)] text-lg font-semibold text-[#6B5B95] tabular-nums">
                {displaySecondary}
              </span>
              <span className="font-[family-name:var(--font-space-grotesk)] text-sm font-medium text-[#6B5B95]/50">
                {inputMode === 'fiat' ? 'USDC' : 'ARS'}
              </span>
            </>
          )}
        </div>

        {/* Rate chip */}
        {estimate && !isCalculating && (
          <div className="mt-1 px-3 py-1 rounded-full bg-white/50">
            <span className="text-mono-code-sm text-[#6B5B95]/70">
              1 USDC = {formatFiatCompact(estimate.rate)} ARS
            </span>
          </div>
        )}

        {/* Error / over limit */}
        {isOverLimit && (
          <p className="mt-2 flex items-center gap-1.5 text-body-sm text-red-500 bg-white/60 px-3 py-1.5 rounded-lg">
            <AlertCircle className="size-3.5 shrink-0" />
            Excede el límite de {USDC_LIMIT} USDC
          </p>
        )}

        {!isCalculating && error && !isOverLimit && (
          <p className="mt-2 flex items-center gap-1.5 text-body-sm text-amber-700 bg-white/60 px-3 py-1.5 rounded-lg">
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
          className="w-full flex items-center justify-between px-4 py-2.5 bg-white/50 rounded-xl hover:bg-white/70 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center size-5 rounded-full bg-[#6B5B95]/10">
              <Shield className="size-3 text-[#6B5B95]" />
            </div>
            <span className="font-[family-name:var(--font-dm-sans)] text-xs font-medium text-[#6B5B95]">
              Tu Límite de Transacción: {USDC_LIMIT} USDC
            </span>
          </div>
          <ChevronRight className="size-4 text-[#6B5B95]/50" />
        </button>

        {/* Máx / Limpiar actions */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleMax}
            className="px-4 py-1.5 rounded-full bg-white/60 border border-white/80 font-[family-name:var(--font-dm-sans)] text-xs font-semibold text-[#6B5B95] hover:bg-white/80 active:scale-95 transition-all"
          >
            Máx
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={!inputValue}
            className={cn(
              'px-4 py-1.5 rounded-full bg-white/60 border border-white/80 font-[family-name:var(--font-dm-sans)] text-xs font-semibold text-[#6B5B95] hover:bg-white/80 active:scale-95 transition-all',
              !inputValue && 'opacity-40 pointer-events-none'
            )}
          >
            Limpiar
          </button>
        </div>

        {/* Numpad */}
        <Numpad onKey={handleKey} disabled={isMatching} />

        {/* CTA Button */}
        <button
          type="button"
          onClick={handleContinue}
          disabled={!hasValidAmount || isMatching || !!error}
          className={cn(
            'w-full h-14 rounded-2xl font-[family-name:var(--font-space-grotesk)] text-base font-bold text-white transition-all active:scale-[0.98]',
            hasValidAmount && !error
              ? 'bg-gradient-peerlypay shadow-peerlypay hover:opacity-90'
              : 'bg-[#B8ACE0] cursor-not-allowed shadow-none'
          )}
        >
          {isMatching ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="size-5 animate-spin" />
              Buscando mejor oferta...
            </span>
          ) : (
            'Continuar'
          )}
        </button>
      </div>
    </div>
  );
}
