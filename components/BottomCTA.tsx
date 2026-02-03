'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function BottomCTA() {
  const router = useRouter();

  return (
    <div className="flex gap-3 w-full">
      <button
        type="button"
        onClick={() => router.push('/create-order?type=buy')}
        className="flex-1 py-4 px-6 rounded-full bg-gradient-to-r from-magenta to-magenta-600 text-white font-semibold text-base hover:opacity-90 transition-all duration-200 font-[family-name:var(--font-space-grotesk)]"
      >
        + Buy USDC
      </button>
      <button
        type="button"
        onClick={() => router.push('/create-order?type=sell')}
        className="flex-1 py-4 px-6 rounded-full bg-white border border-gray-300 text-gray-600 font-semibold text-base hover:bg-gray-50 transition-all duration-200 font-[family-name:var(--font-space-grotesk)]"
      >
        ⇄ Sell USDC
      </button>
    </div>
  );
}
