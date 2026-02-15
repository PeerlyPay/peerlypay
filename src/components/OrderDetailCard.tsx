import { Building2, Clock } from 'lucide-react';
import type { Order } from '@/types';

interface OrderDetailCardProps {
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

function formatAmount(value: number, decimals = 2): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export default function OrderDetailCard({ order }: OrderDetailCardProps) {
  const total = order.amount * order.rate;
  const currencyLabel = order.fiatCurrencyLabel;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6">
      {/* Seller/Buyer info */}
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-sm font-bold text-white">
            {getAddressInitial(order.createdBy)}
          </div>
          {order.status === 'AwaitingFiller' && (
            <span
              className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-white bg-green-500"
              aria-hidden
            />
          )}
        </div>
        <div className="min-w-0">
          <span className="text-mono-code font-medium text-dark-500 block truncate">
            {shortenAddress(order.createdBy)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-cyan-50 px-2 py-0.5 text-xs font-semibold text-cyan-600 mt-0.5">
            ⭐ {(order.reputation_score ?? 0) === 0 ? 'New trader' : `${order.reputation_score} trades`}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="my-4 border-t border-neutral-200" />

      {/* Details grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Amount */}
        <div>
          <p className="text-sm text-gray-600 mb-1">Amount</p>
          <p className="font-mono text-2xl font-bold text-primary-600 tabular-nums">
            {formatAmount(order.amount)} USDC
          </p>
        </div>

        {/* Exchange Rate */}
        <div>
          <p className="text-sm text-gray-600 mb-1">Rate</p>
          <p className="text-mono-amount-sm text-dark-500">
            1 USDC = {formatAmount(order.rate)} {currencyLabel}
          </p>
        </div>

        {/* Total */}
        <div>
          <p className="text-sm text-gray-600 mb-1">Total</p>
          <p className="text-mono-amount font-semibold text-dark-500">
            {formatAmount(total)} {currencyLabel}
          </p>
        </div>

        {/* Payment Method */}
        <div>
          <p className="text-sm text-gray-600 mb-1">Payment Method</p>
          <p className="flex items-center gap-1.5 text-body-sm text-dark-500">
            <Building2 className="h-4 w-4 text-gray-400" />
            {order.paymentMethodLabel}
          </p>
        </div>

        {/* Duration */}
        <div>
          <p className="text-sm text-gray-600 mb-1">Payment Window</p>
          <p className="flex items-center gap-1.5 text-body-sm text-dark-500">
            <Clock className="h-4 w-4 text-gray-400" />
            {order.durationLabel || '30 min'}
          </p>
        </div>
      </div>
    </div>
  );
}
