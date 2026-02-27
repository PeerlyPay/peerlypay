'use client';

import { useRouter } from 'next/navigation';
import { Clock, BadgeCheck } from 'lucide-react';
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

const MAX_BADGES = 3;

export default function OrderCard({ order }: OrderCardProps) {
  const router = useRouter();

  const availableAmount = order.remainingAmount ?? order.amount;
  const currencyLabel = order.fiatCurrencyLabel;
  const actionLabel = order.type === 'sell' ? 'Buy Now' : 'Sell Now';
  const tradeCount = order.reputation_score ?? 0;
  const completionRate = order.completionRate ?? 100;

  // Payment method badges — support multi-method orders
  const methods: string[] = order.paymentMethodLabels?.length
    ? order.paymentMethodLabels
    : [order.paymentMethodLabel];
  const visibleMethods = methods.slice(0, MAX_BADGES);
  const overflow = methods.length - MAX_BADGES;

  // Limits line: show fiat range if available, otherwise USDC available amount
  const limitsText =
    order.minTradeAmount && order.maxTradeAmount
      ? `Limits: ${(order.minTradeAmount * order.rate).toLocaleString('en-US')} – ${(order.maxTradeAmount * order.rate).toLocaleString('en-US')} ${currencyLabel}`
      : `Available: ${availableAmount.toLocaleString('en-US')} USDC`;

  const handleClick = () => router.push(`/orders/${order.id}`);

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
      className="cursor-pointer rounded-[6px] border border-gray-200 bg-white px-6 py-4 text-left shadow-[0px_4px_4px_0px_rgba(174,174,174,0.25)] transition-all duration-200 hover:border-primary-200 hover:shadow-md"
    >
      {/* ── Row 1: User information ──────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        {/* Avatar + online dot */}
        <div className="relative shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 font-display text-sm font-bold text-white">
            {getAddressInitial(order.createdBy)}
          </div>
          <span
            className="absolute bottom-0 right-0 h-[7px] w-[7px] rounded-full border-[1.5px] border-white bg-green-500"
            aria-hidden
          />
        </div>

        {/* Name + stats */}
        <div className="flex min-w-0 flex-col gap-0.5">
          {/* Name row */}
          <div className="flex items-center gap-1">
            <span className="font-display text-[18px] font-semibold leading-[1.5] text-black">
              {order.displayName ?? shortenAddress(order.createdBy)}
            </span>
            {order.isVerified && (
              <BadgeCheck className="size-4 shrink-0 text-primary-500" strokeWidth={2} />
            )}
          </div>

          {/* Stats: order count · completion · clock · duration */}
          <div className="flex items-center gap-1.5">
            <span className="font-body text-[10px] font-semibold uppercase tracking-[0.5px] text-neutral-700">
              {tradeCount} Orders ({completionRate.toFixed(2)}%)
            </span>
            <span className="h-3 w-px bg-gray-300" aria-hidden />
            <Clock className="size-3 shrink-0 text-neutral-700" strokeWidth={2} />
            <span className="font-body text-[10px] font-semibold uppercase tracking-[0.5px] text-neutral-700">
              {order.durationLabel || '30 min'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Row 2: Pricing + CTA ────────────────────────────────────────── */}
      <div className="mt-3 flex items-center justify-between gap-3">
        {/* Rate + limits */}
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-1 leading-[1.5]">
            <span className="font-display text-[18px] font-semibold text-gray-900">
              {order.rate.toLocaleString('en-US')} {currencyLabel}
            </span>
            <span className="font-body text-[13px] font-normal text-gray-400">
              /USDC
            </span>
          </div>
          <p className="font-body text-[12px] font-medium text-[#0f172a]">
            {limitsText}
          </p>
        </div>

        {/* CTA button */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleClick(); }}
          className={
            order.type === 'sell'
              ? 'shrink-0 rounded-[8px] bg-green-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-green-700'
              : 'shrink-0 rounded-[8px] bg-gradient-to-r from-primary-500 to-primary-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90'
          }
        >
          {actionLabel}
        </button>
      </div>

      {/* ── Row 3: Payment method badges ────────────────────────────────── */}
      <div className="mt-3 flex flex-wrap gap-1">
        {visibleMethods.map((method, i) => (
          <span
            key={i}
            className="rounded-[8px] border border-[#e2e8f0] px-2 py-0.5 font-body text-[10px] font-semibold uppercase tracking-[0.3px] text-gray-900"
          >
            {method}
          </span>
        ))}
        {overflow > 0 && (
          <span className="rounded-[8px] border border-[#e2e8f0] px-2 py-0.5 font-body text-[10px] font-semibold text-gray-900">
            +{overflow}
          </span>
        )}
      </div>
    </article>
  );
}
