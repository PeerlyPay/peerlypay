'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useWallet } from '@crossmint/client-sdk-react-ui';
import { ArrowLeft, ArrowUpCircle, ArrowDownCircle, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmTradeIcon from '@/components/icons/ConfirmTradeIcon';
import { takeOrderWithCrossmint } from '@/lib/p2p-crossmint';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

async function checkUSDCTrustline(): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return true;
}

const MOCK_RATE = 1_485;
const FEE_RATE = 0.005;

function formatUsdc(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatFiatCompact(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function ConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { wallet } = useWallet();
  const walletAddress = useStore((state) => state.user.walletAddress);
  const refreshOrdersFromChain = useStore((state) => state.refreshOrdersFromChain);
  const [isChecking, setIsChecking] = useState(false);

  const amount = parseFloat(searchParams.get('amount') || '100');
  const mode = (searchParams.get('mode') || 'sell') as 'sell' | 'buy';
  const orderId = searchParams.get('orderId') || '';
  const isSell = mode === 'sell';

  const rate = MOCK_RATE;
  const fiatAmount = amount * rate;
  const feeArs = amount * FEE_RATE * rate;
  const feeUsdc = amount * FEE_RATE;
  // Fee already deducted from receive amount
  const receiveArs = isSell ? fiatAmount - feeArs : fiatAmount;
  const receiveUsdc = isSell ? amount : amount - feeUsdc;

  const sendLabel = isSell ? `${formatUsdc(amount)} USDC` : `~${formatFiatCompact(fiatAmount)} ARS`;
  const receiveLabel = isSell ? `~${formatFiatCompact(receiveArs)} ARS` : `${formatUsdc(receiveUsdc)} USDC`;

  const handleConfirm = useCallback(async () => {
    if (!walletAddress) {
      toast.error('Connect wallet first');
      return;
    }

    if (!orderId) {
      toast.error('No order selected');
      return;
    }

    setIsChecking(true);

    try {
      const hasTrustline = await checkUSDCTrustline();
      if (!hasTrustline) {
        router.push(`/trade/enable-usdc?amount=${amount}&mode=${mode}&orderId=${orderId}`);
        return;
      }

      await takeOrderWithCrossmint({
        wallet,
        caller: walletAddress,
        orderId,
      });

      await refreshOrdersFromChain();

      if (mode === 'buy') {
        router.push(`/trade/payment?amount=${amount}&mode=${mode}&orderId=${orderId}`);
      } else {
        router.push(`/trade/waiting?amount=${amount}&mode=${mode}&orderId=${orderId}`);
      }
    } catch (error) {
      console.error('Failed to take order', error);
      toast.error('Failed to take order');
    } finally {
      setIsChecking(false);
    }
  }, [amount, mode, orderId, refreshOrdersFromChain, router, wallet, walletAddress]);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
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
          {isSell ? 'Confirm Sale' : 'Confirm Purchase'}
        </h2>
      </div>

      <div className="flex-1 px-4 pb-4 flex flex-col items-center overflow-y-auto">
        {/* Trade Icon */}
        <div className="mt-8 mb-8">
          <ConfirmTradeIcon />
        </div>

        {/* Trade Summary */}
        <div className="w-full rounded-md border border-neutral-400 bg-white p-4 flex flex-col gap-3">
          {/* You send */}
          <div className="flex items-center justify-between">
            <span className="font-[family-name:var(--font-dm-sans)] text-[15px] text-gray-900">You send</span>
            <span className="flex items-center gap-0.5 font-[family-name:var(--font-jetbrains-mono)] text-[13px] text-gray-900 tabular-nums">
              <ArrowUpCircle className="size-4 text-gray-900" />
              {sendLabel}
            </span>
          </div>

          {/* You receive */}
          <div className="flex items-center justify-between">
            <span className="font-[family-name:var(--font-dm-sans)] text-[15px] text-gray-900">You receive</span>
            <span className="flex items-center gap-0.5 font-[family-name:var(--font-jetbrains-mono)] text-[13px] text-gray-900 tabular-nums">
              <ArrowDownCircle className="size-4 text-gray-900" />
              {receiveLabel}
            </span>
          </div>

          {/* Network */}
          <div className="flex items-center justify-between">
            <span className="font-[family-name:var(--font-dm-sans)] text-[15px] text-gray-900">Network</span>
            <span className="font-[family-name:var(--font-jetbrains-mono)] text-[13px] text-gray-900">Stellar</span>
          </div>

          {/* Estimated time */}
          <div className="flex items-center justify-between">
            <span className="font-[family-name:var(--font-dm-sans)] text-[15px] text-gray-900">Estimated time</span>
            <span className="flex items-center gap-0.5 font-[family-name:var(--font-jetbrains-mono)] text-[13px] text-gray-900 tabular-nums">
              <Clock className="size-4 text-gray-900" />
              2-10 mins
            </span>
          </div>
        </div>
      </div>

      {/* Confirm Button */}
      <div className="p-4 pb-6">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isChecking}
          className={cn(
            'w-full h-14 rounded-2xl font-[family-name:var(--font-space-grotesk)] text-base font-bold text-white transition-all active:scale-[0.98]',
            isChecking
              ? 'bg-magenta-500/70 cursor-wait'
              : 'bg-magenta-500 shadow-lg shadow-magenta-500/25 hover:bg-magenta-600'
          )}
        >
          {isChecking ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="size-5 animate-spin" />
              Checking wallet...
            </span>
          ) : (
            'Confirm Trade'
          )}
        </button>
      </div>
    </div>
  );
}

export default function TradeConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">Loading...</div>
      }
    >
      <ConfirmContent />
    </Suspense>
  );
}
