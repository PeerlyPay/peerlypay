'use client';

import { Wallet, ArrowLeftRight } from 'lucide-react';

export interface OrderTypeSelectorProps {
  selected: 'buy' | 'sell';
  onSelect: (type: 'buy' | 'sell') => void;
}

const options: { type: 'buy' | 'sell'; label: string; Icon: typeof Wallet }[] = [
  { type: 'sell', label: 'Sell USDC', Icon: Wallet },
  { type: 'buy', label: 'Buy USDC', Icon: ArrowLeftRight },
];

export default function OrderTypeSelector({ selected, onSelect }: OrderTypeSelectorProps) {
  return (
    <div className="flex gap-6 border-b border-gray-200 mb-6">
      {options.map(({ type, label, Icon }) => {
        const isSelected = selected === type;
        return (
          <button
            key={type}
            type="button"
            onClick={() => onSelect(type)}
            className={`flex items-center gap-2 text-body pb-3 -mb-px transition-colors ${
              isSelected
                ? 'text-primary-600 font-semibold border-b-2 border-primary-500'
                : 'text-gray-500 font-medium hover:text-primary-500'
            }`}
          >
            <Icon className="w-5 h-5 shrink-0" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
