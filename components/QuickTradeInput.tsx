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
