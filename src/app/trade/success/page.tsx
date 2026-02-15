'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  X,
  Copy,
  Check,
  Star,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { useTradeHistory } from '@/contexts/TradeHistoryContext';

// Mock trade data
const MOCK_MAKER = 'crypto_trader_ar';
const MOCK_RATE = 1_485;
const FEE_RATE = 0.005;
const MOCK_TXN_ID = '#TXN123456';
const MOCK_DURATION = '2m 34s';

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
// CONFETTI
// ============================================
const CONFETTI_COLORS = [
  '#d946ef', '#a855f7', '#6366f1', '#8b5cf6',
  '#10b981', '#f59e0b', '#ec4899', '#84cc16',
];

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 6 + Math.random() * 6,
        duration: 2.5 + Math.random() * 2,
        delay: Math.random() * 0.8,
        shape: Math.random() > 0.5 ? 'circle' : 'rect',
      })),
    []
  );

  return (
    <div className="fixed inset-0 z-[70] pointer-events-none overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti"
          style={{
            left: `${p.left}%`,
            top: '-10px',
            '--confetti-duration': `${p.duration}s`,
            '--confetti-delay': `${p.delay}s`,
            width: p.shape === 'circle' ? p.size : p.size * 0.6,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.shape === 'circle' ? '50%' : '2px',
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

// ============================================
// STAR RATING
// ============================================
function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
          className="transition-transform active:scale-90 hover:scale-110 p-0.5"
        >
          <Star
            className={cn(
              'size-8 transition-colors',
              (hover || value) >= star
                ? 'fill-amber-400 text-amber-400'
                : 'fill-transparent text-gray-300'
            )}
          />
        </button>
      ))}
    </div>
  );
}

// ============================================
// SUCCESS CONTENT
// ============================================
function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subtractBalance = useStore((state) => state.subtractBalance);
  const { addTrade } = useTradeHistory();

  const amount = parseFloat(searchParams.get('amount') || '0.11');
  const fiatAmount = amount * MOCK_RATE;
  const feeArs = amount * FEE_RATE * MOCK_RATE;
  const totalPaid = fiatAmount - feeArs;

  const [showConfetti, setShowConfetti] = useState(true);
  const [rating, setRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  const timestamp = useMemo(() => {
    return new Date().toLocaleString('es-AR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }, []);

  // Deduct balance and save trade on mount
  useEffect(() => {
    const processed = sessionStorage.getItem(`trade_processed_${amount}`);
    if (processed) return;

    subtractBalance(amount);
    addTrade({
      amount,
      arsReceived: totalPaid,
      rate: MOCK_RATE,
      marketMaker: MOCK_MAKER,
      paymentMethod: 'MercadoPago',
      txnId: MOCK_TXN_ID,
    });

    sessionStorage.setItem(`trade_processed_${amount}`, 'true');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Trigger mount animation
  useEffect(() => {
    const timeout = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timeout);
  }, []);

  // Hide confetti after animation completes
  useEffect(() => {
    const timeout = setTimeout(() => setShowConfetti(false), 4500);
    return () => clearTimeout(timeout);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(MOCK_TXN_ID);
    } catch {
      // clipboard unavailable
    } finally {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmitRating = () => {
    if (rating > 0) {
      setRatingSubmitted(true);
    }
  };

  return (
    <div className="flex flex-col min-h-dvh bg-white">
      {showConfetti && <Confetti />}

      {/* Close button */}
      <div className="flex items-center justify-end px-4 pt-4 pb-0">
        <button
          type="button"
          onClick={() => router.push('/')}
          className="flex items-center justify-center size-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <X className="size-5 text-gray-500" />
        </button>
      </div>

      <div className="flex-1 px-4 pb-4 overflow-y-auto">
        {/* Success Hero */}
        <div className="flex flex-col items-center text-center pt-4 pb-6">
          {/* Animated checkmark */}
          <div
            className={cn(
              'flex items-center justify-center size-24 rounded-full bg-emerald-50 mb-5',
              mounted ? 'animate-scaleIn' : 'opacity-0'
            )}
          >
            <div className="flex items-center justify-center size-16 rounded-full bg-emerald-500">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path
                  d="M9 16.5L14 21.5L23 11.5"
                  stroke="white"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="48"
                  strokeDashoffset="48"
                  className="animate-checkDraw"
                />
              </svg>
            </div>
          </div>

          <h2
            className={cn(
              'font-[family-name:var(--font-space-grotesk)] text-2xl font-bold text-gray-900 mb-2 transition-all duration-500',
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            )}
            style={{ transitionDelay: '0.3s' }}
          >
            Trade Completado!
          </h2>
          <p
            className={cn(
              'text-body text-gray-500 transition-all duration-500',
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            )}
            style={{ transitionDelay: '0.45s' }}
          >
            Tu USDC ha sido liberado
          </p>
        </div>

        <div className="space-y-4">
          {/* Transaction Summary */}
          <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
            {/* Amount received — prominent */}
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-gray-500">Recibiste</span>
              <span className="font-[family-name:var(--font-jetbrains-mono)] text-xl font-bold text-emerald-600 tabular-nums">
                {formatUsdc(amount)} USDC
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-gray-500">Pagaste</span>
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
              <span className="text-body-sm text-gray-500">Tiempo</span>
              <span className="text-body-sm font-semibold text-gray-900">
                {MOCK_DURATION}
              </span>
            </div>

            <div className="border-t border-gray-200 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-body-sm text-gray-500">ID</span>
                <div className="flex items-center gap-2">
                  <span className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-gray-400 tabular-nums">
                    {MOCK_TXN_ID}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className={cn(
                      'flex items-center justify-center size-7 rounded-md transition-all active:scale-95',
                      copied
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-white text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                    )}
                  >
                    {copied ? (
                      <Check className="size-3.5" strokeWidth={2.5} />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </button>
                </div>
              </div>
              <p className="text-caption text-gray-400 mt-2 text-right">{timestamp}</p>
            </div>
          </div>

          {/* Wallet info */}
          <div className="flex items-center gap-2.5 px-4 py-3.5 bg-emerald-50 rounded-2xl">
            <Wallet className="size-5 text-emerald-600 shrink-0" />
            <span className="text-body-sm font-medium text-emerald-700">
              Your USDC is now available in your wallet
            </span>
          </div>

          {/* Market Maker Rating */}
          <div className="bg-gray-50 rounded-2xl p-5">
            {ratingSubmitted ? (
              <div className="flex flex-col items-center text-center py-2">
                <div className="flex items-center justify-center size-10 rounded-full bg-emerald-100 mb-2">
                  <Check className="size-5 text-emerald-600" strokeWidth={2.5} />
                </div>
                <p className="text-body-sm font-semibold text-gray-900">
                  Gracias por tu calificación!
                </p>
                <p className="text-caption text-gray-400 mt-0.5">
                  Tu feedback ayuda a la comunidad
                </p>
              </div>
            ) : (
              <>
                <p className="text-body-sm text-gray-500 text-center mb-3">
                  Como fue tu experiencia con <strong className="text-gray-900">@{MOCK_MAKER}</strong>?
                </p>
                <div className="flex justify-center mb-4">
                  <StarRating value={rating} onChange={setRating} />
                </div>
                {rating > 0 && (
                  <button
                    type="button"
                    onClick={handleSubmitRating}
                    className="w-full h-10 rounded-xl font-[family-name:var(--font-space-grotesk)] text-sm font-semibold text-fuchsia-600 bg-fuchsia-50 hover:bg-fuchsia-100 transition-colors active:scale-[0.98]"
                  >
                    Enviar calificación
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 pb-6 border-t border-gray-100 space-y-3">
        <button
          type="button"
          onClick={() => router.push('/trade')}
          className="w-full h-14 rounded-2xl font-[family-name:var(--font-space-grotesk)] text-base font-bold text-white bg-gradient-to-r from-fuchsia-500 to-purple-600 shadow-lg shadow-fuchsia-500/25 hover:opacity-90 transition-all active:scale-[0.98]"
        >
          Hacer otro trade
        </button>
        <button
          type="button"
          onClick={() => router.push('/orders')}
          className="w-full h-12 rounded-2xl font-[family-name:var(--font-space-grotesk)] text-base font-semibold text-gray-500 border border-gray-200 bg-white hover:bg-gray-50 transition-all active:scale-[0.98]"
        >
          Ver mis órdenes
        </button>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="w-full h-10 font-[family-name:var(--font-space-grotesk)] text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}

export default function TradeSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">Cargando...</div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
