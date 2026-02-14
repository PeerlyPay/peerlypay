"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Delete,
  AlertCircle,
  ArrowLeft,
  HelpCircle,
  ArrowUpDown,
  ChevronRight,
  CircleDollarSign,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { estimateQuickTrade } from '@/lib/match-order';
import type { QuickTradeEstimate } from '@/types';

/** Transaction limit in USDC */
const USDC_LIMIT = 500;

/** Debounce delay for rate calculation (ms) */
const DEBOUNCE_MS = 500;

/** Fallback rate until first estimation */
const DEFAULT_RATE = 1200;

type TradeMode = 'sell' | 'buy';
type InputCurrency = 'ars' | 'usdc';

function formatArs(value: number): string {
  if (value === 0) return '0';
  return value.toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatUsdc(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getAmountSize(text: string): string {
  const len = text.length;
  if (len <= 3) return 'text-[80px] leading-none';
  if (len <= 5) return 'text-[60px] leading-none';
  if (len <= 7) return 'text-[48px] leading-none';
  if (len <= 9) return 'text-[36px] leading-none';
  return 'text-[28px] leading-none';
}

// ─── Numeric Keypad ───────────────────────────────
const KEYPAD_KEYS = [
  '1', '2', '3',
  '4', '5', '6',
  '7', '8', '9',
  ',', '0', 'delete',
] as const;

function Numpad({ onKey, disabled }: { onKey: (key: string) => void; disabled?: boolean }) {
  return (
    <div className="grid grid-cols-3 px-6">
      {KEYPAD_KEYS.map((key) => (
        <button
          key={key}
          type="button"
          disabled={disabled}
          onClick={() => onKey(key)}
          className={cn(
            'flex items-center justify-center h-[54px] rounded-xl transition-colors active:bg-gray-50',
            'font-[family-name:var(--font-space-grotesk)] text-[22px] font-medium select-none',
            key === 'delete' ? 'text-gray-400' : 'text-gray-800',
            disabled && 'opacity-40 pointer-events-none'
          )}
        >
          {key === 'delete' ? (
            <Delete className="size-[22px]" strokeWidth={1.5} />
          ) : (
            key
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────
export default function QuickTradeInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, orders } = useStore();

  const [mode, setMode] = useState<TradeMode>('buy');
  const [inputValue, setInputValue] = useState('');
  const [inputCurrency, setInputCurrency] = useState<InputCurrency>('usdc');
  const [estimate, setEstimate] = useState<QuickTradeEstimate | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentRate, setCurrentRate] = useState<number>(DEFAULT_RATE);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const rateRef = useRef<number>(DEFAULT_RATE);

  // Parse input (comma → dot for float)
  const numericValue = parseFloat(inputValue.replace(',', '.')) || 0;

  // Derive USDC amount for limit check / display
  const usdcAmount = inputCurrency === 'usdc'
    ? numericValue
    : currentRate > 0 ? numericValue / currentRate : 0;

  const isOverLimit = usdcAmount > USDC_LIMIT;
  const hasEnoughBalance = mode === 'buy' || usdcAmount <= user.balance.usdc;
  const hasValidAmount = numericValue > 0 && !isOverLimit && hasEnoughBalance;

  // Fetch initial rate on mount / mode change
  useEffect(() => {
    const result = estimateQuickTrade(orders, 1, mode);
    if (result) {
      rateRef.current = result.rate;
      setCurrentRate(result.rate);
    }
  }, [orders, mode]);

  // Debounced estimation — uses rateRef to avoid cascading re-renders
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setError(null);

    const usdcAmt = inputCurrency === 'usdc'
      ? numericValue
      : rateRef.current > 0 ? numericValue / rateRef.current : 0;

    if (usdcAmt <= 0) {
      setEstimate(null);
      setIsCalculating(false);
      return;
    }

    setIsCalculating(true);

    debounceRef.current = setTimeout(() => {
      const result = estimateQuickTrade(orders, usdcAmt, mode);
      if (result) {
        setEstimate(result);
        rateRef.current = result.rate;
        setCurrentRate(result.rate);
        setError(null);
      } else {
        setEstimate(null);
        setError('No orders available');
      }
      setIsCalculating(false);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [numericValue, inputCurrency, mode, orders]);

  // Numpad input handler
  const handleKey = useCallback((key: string) => {
    if (key === "delete") {
      setInputValue((prev) => prev.slice(0, -1));
      return;
    }

    setInputValue((prev) => {
      if (key === ',' && prev.includes(',')) return prev;
      if (prev.includes(',') && prev.split(',')[1].length >= 2) return prev;
      if (prev.replace(',', '').length >= 10) return prev;
      if (key === ',' && prev === '') return '0,';
      if (prev === '0' && key !== ',') return key;
      return prev + key;
    });
  }, []);

  // Swap between ARS / USDC input
  const handleSwapCurrency = useCallback(() => {
    const next: InputCurrency = inputCurrency === 'usdc' ? 'ars' : 'usdc';

    if (numericValue > 0 && currentRate > 0) {
      if (inputCurrency === 'usdc') {
        const arsValue = Math.round(numericValue * currentRate);
        setInputValue(String(arsValue));
      } else {
        const usdcValue = (numericValue / currentRate).toFixed(2);
        setInputValue(usdcValue.replace('.', ','));
      }
    }

    setInputCurrency(next);
  }, [inputCurrency, numericValue, currentRate]);

  // Navigate to confirmation
  const handleContinue = useCallback(() => {
    if (!hasValidAmount || !estimate) return;
    router.push(`/trade/confirm?amount=${usdcAmount.toFixed(2)}&mode=${mode}`);
  }, [hasValidAmount, usdcAmount, mode, estimate, router]);

  // ─── Display values ─────────────────────────────
  const displayAmount = inputValue || '0';
  const displayCurrency = inputCurrency === 'usdc' ? 'USDC' : 'ARS';

  const conversionText = (() => {
    if (isCalculating && numericValue > 0) return 'Calculando...';
    if (!estimate || numericValue <= 0) {
      return inputCurrency === 'usdc' ? '0 ARS' : '0,00 USDC';
    }
    return inputCurrency === 'usdc'
      ? `${formatArs(estimate.total)} ARS`
      : `${formatUsdc(usdcAmount)} USDC`;
  })();

  // ─── Render ─────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex flex-col h-dvh bg-white">
      {/* ─── Minimal header ─── */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center justify-center size-10 -ml-2 rounded-full active:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="size-5 text-gray-800" strokeWidth={2} />
        </button>

        <div className="bg-slate-100 flex items-center p-[5px] rounded-md">
          <button
            type="button"
            onClick={() => setMode('buy')}
            className={cn(
              'py-1.5 px-4 rounded-[3px] text-sm font-medium transition-colors',
              mode === 'buy' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-700'
            )}
          >
            Buy
          </button>
          <button
            type="button"
            onClick={() => setMode('sell')}
            className={cn(
              'py-1.5 px-4 rounded-[3px] text-sm font-medium transition-colors',
              mode === 'sell' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-700'
            )}
          >
            Sell
          </button>
        </div>

        <button
          type="button"
          className="flex items-center justify-center size-10 -mr-2 rounded-full active:bg-gray-100 transition-colors"
        >
          <HelpCircle className="size-5 text-gray-400" strokeWidth={1.5} />
        </button>
      </div>

      {/* ─── Amount display area ─── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 min-h-0">
        {/* Giant amount */}
        <div className="flex items-baseline gap-2">
          <span
            className={cn(
              'font-[family-name:var(--font-space-grotesk)] font-bold tracking-tight tabular-nums text-gray-900 transition-all',
              getAmountSize(displayAmount)
            )}
          >
            {displayAmount}
          </span>
          <span
            className={cn(
              'font-[family-name:var(--font-space-grotesk)] font-medium text-gray-300 transition-all',
              displayAmount.length > 7 ? 'text-base' : 'text-xl'
            )}
          >
            {displayCurrency}
          </span>
        </div>

        {/* Swap / conversion link */}
        <button
          type="button"
          onClick={handleSwapCurrency}
          className="flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full transition-colors hover:bg-blue-50/60 active:scale-95"
        >
          <ArrowUpDown className="size-3.5 text-blue-600" strokeWidth={2} />
          <span
            className={cn(
              'font-[family-name:var(--font-jetbrains-mono)] text-sm font-medium tabular-nums',
              isCalculating ? 'text-gray-400' : 'text-blue-600'
            )}
          >
            {conversionText}
          </span>
        </button>

        {/* Asset + balance row */}
        <div className="flex items-center gap-3 mt-8 w-full max-w-[320px] px-4 py-3 rounded-2xl bg-gray-50/80">
          <div className="flex items-center justify-center size-8 rounded-full bg-blue-50">
            <CircleDollarSign className="size-4 text-blue-500" strokeWidth={1.5} />
          </div>
          <span className="font-[family-name:var(--font-space-grotesk)] text-[15px] font-semibold text-gray-900">
            USDC
          </span>
          <span className="ml-auto font-[family-name:var(--font-dm-sans)] text-[13px] text-gray-400">
            {formatUsdc(user.balance.usdc)} available
          </span>
          <ChevronRight className="size-4 text-gray-300 -mr-1" />
        </div>

        {/* Error messages */}
        {!hasEnoughBalance && numericValue > 0 && (
          <div className="mt-4 flex items-center gap-2 w-full max-w-[320px] px-4 py-2.5 rounded-xl bg-red-50 border border-red-300">
            <AlertCircle className="size-4 text-red-800 shrink-0" />
            <span className="text-xs text-red-800">
              Insufficient balance. You need {formatUsdc(usdcAmount)} USDC but only have {formatUsdc(user.balance.usdc)} USDC.
            </span>
          </div>
        )}
        {isOverLimit && hasEnoughBalance && (
          <div className="mt-4 flex items-center gap-2 w-full max-w-[320px] px-4 py-2.5 rounded-xl bg-red-50 border border-red-300">
            <AlertCircle className="size-4 text-red-800 shrink-0" />
            <span className="text-xs text-red-800">
              Exceeds the {USDC_LIMIT} USDC limit
            </span>
          </div>
        )}
        {!isCalculating && error && !isOverLimit && hasEnoughBalance && (
          <p className="mt-4 flex items-center gap-1.5 text-xs text-amber-500">
            <AlertCircle className="size-3.5 shrink-0" />
            {error}
          </p>
        )}
      </div>

      {/* ─── Bottom: keypad + buttons ─── */}
      <div className="px-2 pb-5 space-y-2">
        <Numpad onKey={handleKey} />

        <div className="px-4 pt-1 pb-1">
          <button
            type="button"
            onClick={handleContinue}
            disabled={!hasValidAmount || !!error}
            className={cn(
              'w-full h-[52px] rounded-2xl font-[family-name:var(--font-space-grotesk)] text-[15px] font-semibold text-white transition-all active:scale-[0.98]',
              hasValidAmount && !error
                ? 'bg-fuchsia-500 hover:bg-fuchsia-600 shadow-lg shadow-fuchsia-500/20'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
            )}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
