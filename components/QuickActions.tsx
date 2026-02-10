'use client';

import { useState } from 'react';
import {
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  HelpCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import WalletModal from '@/components/WalletModal';
import DepositModal from '@/components/DepositModal';

const FULL_ADDRESS = 'GA29EBXKQMQHAECBR7NSMAQM6GHG3YPEESMUFEA';

const actions = [
  { icon: Wallet, label: 'Wallet', id: 'wallet' },
  { icon: ArrowDownToLine, label: 'Deposit', id: 'deposit' },
  { icon: ArrowUpFromLine, label: 'Withdraw', id: 'withdraw' },
  { icon: HelpCircle, label: 'Support', id: 'support' },
] as const;

export default function QuickActions() {
  const { user, disconnectWallet } = useStore();
  const [walletOpen, setWalletOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);

  const handleAction = (id: string) => {
    switch (id) {
      case 'wallet':
        setWalletOpen(true);
        break;
      case 'deposit':
        setDepositOpen(true);
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
        walletAddress={user.walletAddress || FULL_ADDRESS}
        balanceUsdc={user.balance.usdc}
        balanceXlm={5.5}
        onDisconnect={disconnectWallet}
      />

      <DepositModal
        isOpen={depositOpen}
        onClose={() => setDepositOpen(false)}
        walletAddress={user.walletAddress || FULL_ADDRESS}
      />
    </>
  );
}
