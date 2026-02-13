'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@crossmint/client-sdk-react-ui';
import {
  Send,
  ArrowDownToLine,
  ShoppingCart,
  HandCoins,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import WalletModal from '@/components/WalletModal';
import DepositModal from '@/components/DepositModal';

const actions = [
  { icon: Send, label: 'Send', id: 'send' },
  { icon: ArrowDownToLine, label: 'Receive', id: 'receive' },
  { icon: ShoppingCart, label: 'Buy', id: 'buy' },
  { icon: HandCoins, label: 'Sell', id: 'sell' },
] as const;

export default function QuickActions() {
  const router = useRouter();
  const { user, disconnectWallet } = useStore();
  const { logout } = useAuth();
  const [walletOpen, setWalletOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const walletAddress = user.walletAddress ?? '';

  const handleDisconnect = async () => {
    try {
      await logout();
    } catch {}

    disconnectWallet();
  };

  const handleAction = (id: string) => {
    switch (id) {
      case 'send':
        toast.info('Send coming soon');
        break;
      case 'receive':
        setDepositOpen(true);
        break;
      case 'buy':
        router.push('/trade?mode=buy');
        break;
      case 'sell':
        router.push('/trade?mode=sell');
        break;
      default:
        toast.info(`${id.charAt(0).toUpperCase() + id.slice(1)} coming soon`);
    }
  };

  return (
    <>
      <div className="mt-6 grid grid-cols-4 gap-2">
        {actions.map(({ icon: Icon, label, id }) => (
          <Button
            key={id}
            variant="ghost"
            onClick={() => handleAction(id)}
            className="group flex flex-col items-center gap-2 py-3 h-auto text-gray-600 border-1 border-primary-500 rounded-xl hover:bg-gray-50 hover:text-magenta-600 hover:scale-105 transition-all duration-200"
          >
            <Icon className="w-8 h-8 text-magenta-500 group-hover:text-magenta-600" />
            <span className="text-body-sm font-medium">{label}</span>
          </Button>
        ))}
      </div>

      <WalletModal
        isOpen={walletOpen}
        onClose={() => setWalletOpen(false)}
        walletAddress={walletAddress}
        balanceUsdc={user.balance.usdc}
        balanceXlm={5.5}
        onDisconnect={() => void handleDisconnect()}
      />

      <DepositModal
        isOpen={depositOpen}
        onClose={() => setDepositOpen(false)}
        walletAddress={walletAddress}
      />
    </>
  );
}
