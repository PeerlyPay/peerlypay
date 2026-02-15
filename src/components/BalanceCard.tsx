'use client';

import { useStore } from '@/lib/store';

export default function BalanceCard() {
  const { isConnected, balance } = useStore((state) => state.user);
  const usd = balance.usd;
  const usdc = balance.usdc;

  const formattedUsd = usd.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formattedUsdc = usdc.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="bg-balance-soft-fuchsia mt-6 flex w-full flex-col items-center justify-center rounded-[10px] border border-[#efdff3] p-5 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)]">
      <div className="flex w-full flex-col items-center justify-center gap-0 p-2.5">
        <div className="flex flex-col items-center">
          <p className="font-sans text-[10px] font-semibold uppercase leading-[1.5] tracking-[0.5px] text-[#585d69]">
            TOTAL BALANCE
          </p>
          <div className="flex items-center gap-1 text-[#191919]">
            <span className="font-display text-[30px] font-semibold tracking-[-1.2px]">
              $
            </span>
            <span className="font-display text-[60px] font-semibold tracking-[-3px]">
              {isConnected ? formattedUsd : '—'}
            </span>
          </div>
          <p className="font-mono text-base leading-[1.5] text-[#585d69]">
            ≈ {isConnected ? formattedUsdc : '—'} USDC
          </p>
        </div>
      </div>
    </div>
  );
}
