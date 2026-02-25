'use client';

import { useRouter } from 'next/navigation';
import type { Order } from '@/types';

export interface OrderCardProps {
  order: Order;
}

function shortenAddress(address: string): string {
  if (address.length <= 14) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getAddressInitial(address: string): string {
  const hex = address.replace(/^0x/i, '').slice(0, 1);
  return (hex || '?').toUpperCase();
}

export default function OrderCard({ order }: OrderCardProps) {
  const router = useRouter();
  const availableAmount = order.remainingAmount ?? order.amount;
  const totalAmount = order.totalAmount ?? order.amount;
  const total = availableAmount * order.rate;
  const actionLabel = order.type === 'sell' ? 'Buy Now' : 'Sell Now';
  const currencyLabel = order.fiatCurrencyLabel;

  const handleClick = () => {
    router.push(`/orders/${order.id}`);
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className="cursor-pointer rounded-xl border border-gray-200 bg-white p-4 text-left transition-all duration-200 hover:scale-105 hover:border-primary-200 hover:shadow-lg"
    >
      {/* Row 1: Avatar + username + online */}
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-sm font-display font-bold text-white">
            {getAddressInitial(order.createdBy)}
          </div>
          <span
            className="absolute bottom-0 right-0 h-2 w-2 rounded-full border-2 border-white bg-green-500"
            aria-hidden
          />
        </div>
        <span className="text-base font-semibold text-gray-900 truncate">
          {shortenAddress(order.createdBy)}
        </span>
      </div>

      {/* Row 2: Reputation | Payment window */}
      <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
        <span
          className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2 py-1 text-xs font-semibold text-cyan-700 cursor-pointer hover:bg-cyan-100/80 transition-colors"
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            // Future: show trade history
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') e.stopPropagation();
          }}
        >
          ⭐ {(order.reputation_score ?? 0) === 0 ? 'New trader' : `${order.reputation_score} trades`}
        </span>
        <span aria-hidden>|</span>
        <span>Payment window: {order.durationLabel || '30 min'}</span>
      </div>

      {/* Row 3: Exchange rate - prominent */}
      <p className="mt-2 text-3xl font-display font-bold text-dark-500">
        1 USDC = {order.rate.toLocaleString('en-US')} {currencyLabel}
      </p>

      {/* Row 4: Limits */}
      <p className="mt-1 text-sm text-gray-600">
        Available: {availableAmount.toLocaleString('en-US')} USDC (of {totalAmount.toLocaleString('en-US')} total)
      </p>

      {/* Row 5: Payment methods + compact button */}
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-sm text-gray-700 truncate min-w-0">
          {order.paymentMethodLabel}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          className="shrink-0 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-2.5 text-sm font-display font-bold text-white hover:opacity-90 transition-all duration-200"
        >
          {actionLabel}
        </button>
      </div>
    </article>
  );
}
