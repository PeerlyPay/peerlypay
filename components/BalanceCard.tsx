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

  const meshGradient =
    'radial-gradient(at 0% 0%, rgb(255 182 193 / 60%) 0px, transparent 50%), radial-gradient(at 100% 0%, rgb(173 216 255 / 60%) 0px, transparent 50%), radial-gradient(at 100% 100%, rgb(221 160 255 / 60%) 0px, transparent 50%), radial-gradient(at 0% 100%, rgb(152 251 200 / 50%) 0px, transparent 50%)';
  const borderGradient =
    'linear-gradient(135deg, rgb(255 182 193 / 80%), rgb(173 216 255 / 80%), rgb(221 160 255 / 80%), rgb(152 251 200 / 60%))';

  return (
    <div className="group relative mt-6 overflow-hidden rounded-3xl shadow-balance-card transition-all duration-300 hover:scale-105 hover:shadow-2xl">
      {/* Vibrant mesh gradient background */}
      <div className="absolute inset-0" style={{ background: meshGradient }} aria-hidden />

      {/* 2px gradient border wrapper — gradient shows in the ring around the glass */}
      <div className="relative z-10 rounded-3xl bg-balance-border p-0.5" style={{ background: borderGradient }}>
        {/* Glass overlay with content */}
        <div className="rounded-balance-inner border border-white/30 bg-white/50 px-6 py-10 text-center backdrop-blur-3xl transition-all duration-300">
          <p className="text-caption uppercase tracking-wide text-gray-500">
            TOTAL BALANCE
          </p>
          <p className="mt-2 text-6xl font-display font-bold text-gray-900">
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
