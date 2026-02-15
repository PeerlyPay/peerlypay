'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWallet } from '@crossmint/client-sdk-react-ui';
import {
  ArrowLeft,
  Loader2,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';
import TradeChatDrawer from '@/components/trade/TradeChatDrawer';
import { confirmFiatPaymentWithCrossmint } from '@/lib/p2p-crossmint';
import { loadChainOrderByIdFromContract } from '@/lib/p2p';
import type { P2POrderStatus } from '@/types';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const POLL_INTERVAL_MS = 5000;

// ============================================
// WAITING CONTENT
// ============================================
function WaitingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { wallet } = useWallet();
  const walletAddress = useStore((state) => state.user.walletAddress);
  const refreshOrdersFromChain = useStore((state) => state.refreshOrdersFromChain);

  const amount = parseFloat(searchParams.get('amount') || '0.11');
  const mode = (searchParams.get('mode') || 'buy') as 'buy' | 'sell';
  const orderId = searchParams.get('orderId') || '';
  const isTakerSeller = mode === 'sell';

  const [isChecking, setIsChecking] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [orderStatus, setOrderStatus] = useState<P2POrderStatus | null>(null);
  const [makerLabel, setMakerLabel] = useState('counterparty');
  const makerHandle = makerLabel.startsWith('@') ? makerLabel : `@${makerLabel}`;

  const pollOrder = useCallback(async () => {
    if (!orderId) {
      return;
    }

    setIsChecking(true);

    try {
      const order = await loadChainOrderByIdFromContract(orderId);
      setOrderStatus(order.status);
      setMakerLabel(`${order.creator.slice(0, 6)}...${order.creator.slice(-4)}`);

      if (order.status === 'Completed') {
        router.push(`/trade/success?amount=${amount}&mode=${mode}&orderId=${orderId}`);
      }
    } catch (error) {
      console.error('Failed to poll order status', error);
    } finally {
      setIsChecking(false);
    }
  }, [amount, mode, orderId, router]);

  useEffect(() => {
    void pollOrder();
    const interval = setInterval(() => {
      void pollOrder();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [pollOrder]);

  const handleConfirmReceipt = useCallback(async () => {
    if (!walletAddress) {
      toast.error('Connect wallet first');
      return;
    }

    if (!orderId) {
      toast.error('No order selected');
      return;
    }

    setIsConfirming(true);

    try {
      await confirmFiatPaymentWithCrossmint({
        wallet,
        caller: walletAddress,
        orderId,
      });
      await refreshOrdersFromChain();
      await pollOrder();
    } catch (error) {
      console.error('Failed to confirm fiat payment', error);
      toast.error('Failed to confirm fiat payment');
    } finally {
      setIsConfirming(false);
    }
  }, [orderId, pollOrder, refreshOrdersFromChain, wallet, walletAddress]);

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
          Waiting for Confirmation
        </h2>
      </div>

      <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-4 pb-4">
        {/* Central Status */}
        <div className="flex flex-col items-center text-center">
          {/* Animated spinner ring */}
          <div className="relative flex items-center justify-center size-24 mb-6">
            <div className="absolute inset-0 rounded-full bg-fuchsia-100 animate-pulse" />
            <svg className="absolute inset-0 size-24 animate-spin" style={{ animationDuration: '3s' }} viewBox="0 0 96 96">
              <circle
                cx="48" cy="48" r="42"
                fill="none"
                stroke="#d946ef"
                strokeWidth="3"
                strokeDasharray="180 264"
                strokeLinecap="round"
              />
            </svg>
            <div className="relative z-10 flex items-center justify-center size-16 rounded-full bg-white shadow-sm">
              <Shield className="size-8 text-fuchsia-500" />
            </div>
          </div>

          <h3 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-gray-900 mb-1.5">
            Waiting for confirmation
          </h3>
          <p className="text-body-sm text-gray-500 mb-1">
            Seller is verifying your payment
          </p>
          <p className="text-caption text-gray-400 mb-5">
            Once confirmed, your USDC will be released
          </p>

          {/* Polling indicator */}
          <div className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300',
            isChecking
              ? 'bg-fuchsia-50 text-fuchsia-600'
              : 'bg-gray-50 text-gray-400'
          )}>
            <Loader2 className={cn(
              'size-3.5',
              isChecking ? 'animate-spin' : ''
            )} />
            <span className="text-caption font-medium">
              {isChecking ? 'Checking...' : 'Live updates'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 pb-6 border-t border-gray-100 space-y-3">
        {isTakerSeller && orderStatus === 'AwaitingConfirmation' && (
          <button
            type="button"
            onClick={handleConfirmReceipt}
            disabled={isConfirming}
            className="w-full h-12 rounded-2xl font-[family-name:var(--font-space-grotesk)] text-base font-semibold text-white bg-fuchsia-500 hover:bg-fuchsia-600 transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {isConfirming ? 'Confirming...' : 'Confirm payment received'}
          </button>
        )}
        <TradeChatDrawer
          key={makerHandle}
          triggerLabel="Message seller"
          sellerLabel={makerHandle}
          triggerClassName="w-full h-12 rounded-2xl font-[family-name:var(--font-space-grotesk)] text-base font-semibold text-fuchsia-600 border border-fuchsia-200 bg-white hover:bg-fuchsia-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        />
        <button
          type="button"
          className="w-full h-10 font-[family-name:var(--font-space-grotesk)] text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
        >
          Report issue
        </button>
      </div>
    </div>
  );
}

export default function TradeWaitingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">Loading...</div>
      }
    >
      <WaitingContent />
    </Suspense>
  );
}
