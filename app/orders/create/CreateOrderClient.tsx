'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@crossmint/client-sdk-react-ui';
import { Wallet, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import FadeIn from '@/components/FadeIn';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import CreateOrderForm from './CreateOrderForm';
import OrderTypeSelector from './OrderTypeSelector';

export default function CreateOrderClient() {
  const searchParams = useSearchParams();
  const user = useStore((s) => s.user);
  const { login } = useAuth();
  const initialType = (searchParams.get('type') as 'buy' | 'sell') || 'sell';
  const [orderType, setOrderType] = useState<'buy' | 'sell'>(initialType);
  const [isConnecting, setIsConnecting] = useState(false);

  const isWalletReady = user.isConnected && Boolean(user.walletAddress);

  const handleConnectWallet = async () => {
    setIsConnecting(true);

    try {
      await login();
      toast.success('Crossmint login iniciado');
    } catch {
      toast.error('No se pudo iniciar el login');
    } finally {
      setIsConnecting(false);
    }
  };

  if (!isWalletReady) {
    return (
      <FadeIn>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="font-display text-xl font-semibold text-amber-900">Connect your wallet first</p>
          <p className="mt-2 text-sm text-amber-800">
            You need an active Stellar wallet to create orders.
          </p>
          <Button
            type="button"
            onClick={handleConnectWallet}
            disabled={isConnecting}
            className="mt-4 w-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:opacity-90 disabled:opacity-70"
          >
            {isConnecting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="size-4" />
                Connect Wallet
              </>
            )}
          </Button>
        </div>
      </FadeIn>
    );
  }

  return (
    <>
      <FadeIn>
        <h1 className="text-h3 text-black mb-6">Create Order</h1>
        <OrderTypeSelector selected={orderType} onSelect={setOrderType} />
      </FadeIn>
      <FadeIn delay={0.1}>
        <CreateOrderForm orderType={orderType} />
      </FadeIn>
    </>
  );
}
