'use client';

import { useStore } from '@/lib/store';

export default function BalanceCard() {
  const { user } = useStore();
  const { usd, usdc } = user.balance;

  const formattedUsd = usd.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formattedUsdc = usdc.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const meshGradient = `
    radial-gradient(at 0% 0%, rgba(255, 182, 193, 0.6) 0px, transparent 50%),
    radial-gradient(at 100% 0%, rgba(173, 216, 255, 0.6) 0px, transparent 50%),
    radial-gradient(at 100% 100%, rgba(221, 160, 255, 0.6) 0px, transparent 50%),
    radial-gradient(at 0% 100%, rgba(152, 251, 200, 0.5) 0px, transparent 50%)
  `;
  const borderGradient = 'linear-gradient(135deg, rgba(255,182,193,0.8), rgba(173,216,255,0.8), rgba(221,160,255,0.8), rgba(152,251,200,0.6))';

  return (
    <div className="group relative mt-6 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
      {/* Vibrant mesh gradient background */}
      <div
        className="absolute inset-0"
        style={{ background: meshGradient }}
        aria-hidden
      />

      {/* 2px gradient border wrapper — gradient shows in the ring around the glass */}
      <div
        className="relative z-10 rounded-3xl p-[2px]"
        style={{ background: borderGradient }}
      >
        {/* Glass overlay with content */}
        <div className="rounded-[22px] backdrop-blur-3xl bg-white/50 border border-white/30 py-10 px-6 text-center transition-all duration-300">
          <p className="text-caption uppercase tracking-wide text-gray-500">
            TOTAL BALANCE
          </p>
          <p className="mt-2 text-6xl font-bold text-gray-900 font-[family-name:var(--font-space-grotesk)]">
            {formattedUsd}
          </p>
          <p className="mt-1 text-lg text-gray-400">
            ≈ {formattedUsdc} USDC
          </p>
        </div>
      </div>
    </div>
  );
}
