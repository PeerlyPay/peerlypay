'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Delete,
  Loader2,
  Shield,
  AlertCircle,
  ArrowLeft,
  HelpCircle,
  ChevronRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { estimateQuickTrade } from '@/lib/match-order';
import type { QuickTradeEstimate } from '@/types';

/** Transaction limit in USDC */
const USDC_LIMIT = 500;

/** Debounce delay for rate calculation (ms) */
const DEBOUNCE_MS = 500;

type TradeMode = 'sell' | 'buy';

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
// SEGMENTED TOGGLE
// ============================================
interface SegmentedToggleProps {
  mode: TradeMode;
  onChange: (mode: TradeMode) => void;
}

function SegmentedToggle({ mode, onChange }: SegmentedToggleProps) {
  return (
    <div className="relative flex bg-gray-100 rounded-xl p-1 w-[200px]">
      {/* Sliding background */}
      <div
        className={cn(
          'absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-fuchsia-500 shadow-sm transition-transform duration-300 ease-out',
          mode === 'buy' && 'translate-x-[calc(100%+4px)]'
        )}
      />
      <button
        type="button"
        onClick={() => onChange('sell')}
        className={cn(
          'relative z-10 flex-1 py-2 text-sm font-semibold font-[family-name:var(--font-space-grotesk)] rounded-lg transition-colors duration-200',
          mode === 'sell' ? 'text-white' : 'text-gray-500'
        )}
      >
        Vender
      </button>
      <button
        type="button"
        onClick={() => onChange('buy')}
        className={cn(
          'relative z-10 flex-1 py-2 text-sm font-semibold font-[family-name:var(--font-space-grotesk)] rounded-lg transition-colors duration-200',
          mode === 'buy' ? 'text-white' : 'text-gray-500'
        )}
      >
        Comprar
      </button>
    </div>
  );
}

// ============================================
// MAIN QUICK TRADE COMPONENT
// ============================================
export default function QuickTradeInput() {
  const router = useRouter();
  const { user, orders } = useStore();
  const [mode, setMode] = useState<TradeMode>('sell');
  const [inputValue, setInputValue] = useState('');
  const [estimate, setEstimate] = useState<QuickTradeEstimate | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const numericValue = parseFloat(inputValue) || 0;
  const isOverLimit = numericValue > USDC_LIMIT;
  const hasValidAmount = numericValue > 0 && !isOverLimit;

  // Reset when mode changes
  const handleModeChange = useCallback((newMode: TradeMode) => {
    setMode(newMode);
    setInputValue('');
    setEstimate(null);
    setError(null);
  }, []);

  // Debounced estimate calculation — always input USDC
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
      const result = estimateQuickTrade(orders, numericValue, mode);
      if (result) {
        setEstimate(result);
        setError(null);
      } else {
        setEstimate(null);
        setError('No hay órdenes disponibles para este monto');
      }
      setIsCalculating(false);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [numericValue, mode, orders]);

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

  // Set max amount
  const handleMax = useCallback(() => {
    if (mode === 'sell') {
      const maxUsdc = Math.min(user.balance.usdc, USDC_LIMIT);
      setInputValue(maxUsdc > 0 ? String(maxUsdc) : String(USDC_LIMIT));
    } else {
      setInputValue(String(USDC_LIMIT));
    }
  }, [mode, user.balance.usdc]);

  // Clear input
  const handleClear = useCallback(() => {
    setInputValue('');
    setEstimate(null);
    setError(null);
  }, []);

  // Navigate to confirmation page
  const handleContinue = useCallback(() => {
    if (!hasValidAmount || !estimate) return;
    router.push(`/trade/confirm?amount=${numericValue.toFixed(2)}&mode=${mode}`);
  }, [hasValidAmount, numericValue, mode, estimate, router]);

  // ============================================
  // DERIVED DISPLAY VALUES
  // ============================================
  const displayPrimary = inputValue || '0';

  const displaySecondary = estimate && !isCalculating
    ? formatFiatCompact(estimate.total)
    : '0';

  const isSell = mode === 'sell';

  // ============================================
  // FULLSCREEN LIGHT UI
  // ============================================
  return (
    <div className="fixed inset-0 z-50 flex flex-col h-dvh bg-white">
      {/* ============================================
          TOP BAR: back + toggle + help
          ============================================ */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <button
          type="button"
          onClick={() => router.push('/quick-trade')}
          className="flex items-center justify-center size-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="size-5 text-gray-600" />
        </button>

        <SegmentedToggle mode={mode} onChange={handleModeChange} />

        <button
          type="button"
          className="flex items-center justify-center size-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <HelpCircle className="size-5 text-gray-400" />
        </button>
      </div>

      {/* ============================================
          TITLE / SUBTITLE
          ============================================ */}
      <div className="text-center px-6 pt-3 pb-1">
        <h2 className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold text-gray-900">
          {isSell ? '¿Cuánto USDC querés vender?' : '¿Cuánto USDC querés comprar?'}
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          {isSell ? 'Recibirás ARS al instante' : 'Pagarás con ARS'}
        </p>
      </div>

      {/* ============================================
          AMOUNT DISPLAY AREA
          ============================================ */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-1 min-h-0">
        {/* Primary USDC amount */}
        <div className="flex items-baseline gap-2">
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
          <span className="font-[family-name:var(--font-space-grotesk)] text-xl font-semibold text-gray-300 self-end mb-1.5">
            USDC
          </span>
        </div>

        {/* Secondary ARS amount */}
        <div className="flex items-center gap-1.5 h-8 mt-2">
          {isCalculating && numericValue > 0 ? (
            <div className="flex items-center gap-2 text-gray-400">
              <Loader2 className="size-4 animate-spin" />
              <span className="text-body-sm">Calculando...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {isSell ? (
                <TrendingDown className={cn('size-4', numericValue > 0 && estimate ? 'text-emerald-500' : 'text-gray-300')} />
              ) : (
                <TrendingUp className={cn('size-4', numericValue > 0 && estimate ? 'text-blue-500' : 'text-gray-300')} />
              )}
              <span
                className={cn(
                  'font-[family-name:var(--font-jetbrains-mono)] text-lg font-semibold tabular-nums',
                  numericValue > 0 && estimate
                    ? isSell ? 'text-emerald-600' : 'text-blue-600'
                    : 'text-gray-400'
                )}
              >
                ≈ ${displaySecondary} ARS
              </span>
              <span className="font-[family-name:var(--font-space-grotesk)] text-xs font-medium text-gray-400">
                {isSell ? 'recibirás' : 'pagarás'}
              </span>
            </div>
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
