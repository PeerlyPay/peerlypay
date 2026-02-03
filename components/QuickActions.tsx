'use client';

import {
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const actions = [
  { icon: Wallet, label: 'Wallet', id: 'wallet' },
  { icon: ArrowDownToLine, label: 'Deposit', id: 'deposit' },
  { icon: ArrowUpFromLine, label: 'Withdraw', id: 'withdraw' },
  { icon: HelpCircle, label: 'Support', id: 'support' },
] as const;

export default function QuickActions() {
  return (
    <div className="mt-6 grid grid-cols-4 gap-2">
      {actions.map(({ icon: Icon, label, id }) => (
        <Button
          key={id}
          variant="ghost"
          onClick={() => console.log(id)}
          className="group flex flex-col items-center gap-2 py-3 h-auto text-gray-600 border-1 border-primary-500 rounded-xl hover:bg-gray-50 hover:text-magenta-600 hover:scale-105 transition-all duration-200"
        >
          <Icon className="w-8 h-8 text-magenta-500 group-hover:text-magenta-600" />
          <span className="text-body-sm font-medium">{label}</span>
        </Button>
      ))}
    </div>
  );
}
