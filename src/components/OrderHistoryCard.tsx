'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Check, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OrderHistoryItem, OrderHistoryStatus } from '@/types';

// ============================================
// TYPES
// ============================================

export interface OrderHistoryCardProps {
  order: OrderHistoryItem;
  onChat?: (orderId: string) => void;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getTypeBadge(type: 'buy' | 'sell'): { label: string; className: string } {
  if (type === 'buy') {
    return {
      label: 'Buy USDC',
      className: 'bg-green-50 text-green-700 border border-green-300',
    };
  }
  return {
    label: 'Sell USDC',
    className: 'bg-red-50 text-red-700 border border-red-300',
  };
}

function getStatusBadge(status: OrderHistoryStatus): { label: string; className: string } {
  const statusMap: Record<OrderHistoryStatus, { label: string; className: string }> = {
    awaiting_payment: {
      label: 'Awaiting Payment',
      className: 'bg-yellow-100 text-yellow-700',
    },
    payment_sent: {
      label: 'Paid',
      className: 'bg-blue-100 text-blue-700',
    },
    releasing: {
      label: 'Please Release',
      className: 'bg-yellow-100 text-yellow-700',
    },
    completed: {
      label: 'Completed',
      className: 'bg-green-100 text-green-700',
    },
    cancelled: {
      label: 'Cancelled',
      className: 'bg-gray-100 text-gray-600',
    },
    disputed: {
      label: 'In Dispute',
      className: 'bg-red-100 text-red-700',
    },
    expired: {
      label: 'Expired',
      className: 'bg-gray-100 text-gray-500',
    },
  };

  return statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-600' };
}

function formatAmount(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatFiatAmount(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

function formatTimestamp(dateString: string): string {
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function truncateOrderId(id: string): string {
  if (id.length <= 12) return id;
  return `${id.slice(0, 9)}...`;
}

function shortenAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// ============================================
// COMPONENT
// ============================================

export function OrderHistoryCard({ order, onChat }: OrderHistoryCardProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const typeBadge = getTypeBadge(order.type);
  const statusBadge = getStatusBadge(order.status);
  const counterpartyName = order.counterparty.username || shortenAddress(order.counterparty.address);

  const handleCopyOrderId = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(order.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCardClick = () => {
    router.push(`/orders/${order.id}`);
  };

  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChat?.(order.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };

  // Check if action is needed (for highlighting)
  const needsAction = order.status === 'releasing' || order.status === 'awaiting_payment';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'w-full bg-white rounded-xl border border-gray-200 p-4 cursor-pointer',
        'transition-all duration-200 hover:border-gray-300 hover:shadow-sm',
        'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:ring-offset-2',
        needsAction && 'border-l-4 border-l-yellow-400'
      )}
      aria-label={`${order.type} order for ${order.usdc_amount} USDC`}
    >
      {/* Row 1: Type Badge + Status Badge */}
      <div className="flex items-center justify-between mb-4">
        <span
          className={cn(
            'inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold',
            typeBadge.className
          )}
        >
          {typeBadge.label}
        </span>

        <span
          className={cn(
            'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
            statusBadge.className
          )}
        >
          {statusBadge.label}
        </span>
      </div>

      {/* Info Grid - 2 columns */}
      <div className="space-y-2.5">
        {/* Amount */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Amount</span>
          <span className="text-sm font-semibold font-[family-name:var(--font-jetbrains-mono)] tabular-nums text-gray-900">
            $ {formatFiatAmount(order.fiat_amount)}
          </span>
        </div>

        {/* Rate */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Price</span>
          <span className="text-sm font-semibold font-[family-name:var(--font-jetbrains-mono)] tabular-nums text-gray-900">
            $ {formatAmount(order.rate)}
          </span>
        </div>

        {/* Total Quantity */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Total quantity</span>
          <span className="text-sm font-semibold font-[family-name:var(--font-jetbrains-mono)] tabular-nums text-gray-900">
            {formatAmount(order.usdc_amount)} USDC
          </span>
        </div>

        {/* Order ID */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Order</span>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium font-[family-name:var(--font-jetbrains-mono)] text-gray-900">
              {truncateOrderId(order.id)}
            </span>
            <button
              type="button"
              onClick={handleCopyOrderId}
              className="p-1 rounded hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
              aria-label={copied ? 'Copied!' : 'Copy order ID'}
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-green-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-gray-500" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="my-3 border-t border-gray-100" />

      {/* Footer: Username + Timestamp */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleChatClick}
          className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:underline"
          aria-label={`Chat with ${counterpartyName}`}
        >
          <span className="font-medium">{counterpartyName}</span>
          <MessageSquare className="w-3.5 h-3.5" />
        </button>

        <span className="text-xs text-gray-500 font-[family-name:var(--font-jetbrains-mono)] tabular-nums">
          {formatTimestamp(order.updated_at)}
        </span>
      </div>
    </div>
  );
}

export default OrderHistoryCard;
