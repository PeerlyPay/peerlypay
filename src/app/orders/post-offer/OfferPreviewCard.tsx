'use client';

import { Clock, BadgeCheck } from 'lucide-react';

export interface OfferPreviewCardProps {
  currencyLabel: string;
  rate: number;
  usdcAmount: number;
  minTrade: number;
  maxTrade: number;
  paymentMethodLabels: string[];
  sellerAddress: string;
  reputationScore: number;
}

function shortenAddress(address: string): string {
  if (!address || address.length <= 14) return address || '0x????...????';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getInitial(address: string): string {
  return (address.replace(/^0x/i, '').slice(0, 1) || '?').toUpperCase();
}

const MAX_BADGES = 3;

export default function OfferPreviewCard({
  currencyLabel,
  rate,
  usdcAmount,
  minTrade,
  maxTrade,
  paymentMethodLabels,
  sellerAddress,
  reputationScore,
}: OfferPreviewCardProps) {
  const hasRate = rate > 0;
  const hasAmount = usdcAmount > 0;

  // Limits line: fiat range if both sides set, otherwise USDC total
  const limitsText = (() => {
    if (minTrade > 0 && maxTrade > 0 && hasRate) {
      return `Limits: ${(minTrade * rate).toLocaleString('en-US')} – ${(maxTrade * rate).toLocaleString('en-US')} ${currencyLabel}`;
    }
    if (hasAmount) {
      return `Available: ${usdcAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })} USDC`;
    }
    return `Available: — USDC`;
  })();

  const visibleMethods = paymentMethodLabels.slice(0, MAX_BADGES);
  const overflow = paymentMethodLabels.length - MAX_BADGES;

  return (
    <div className="relative rounded-[6px] border border-primary-200 bg-white px-6 py-4 shadow-[0px_4px_4px_0px_rgba(174,174,174,0.25)] ring-2 ring-primary-100">
      {/* Preview badge */}
      <span className="absolute right-3 top-3 rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary-600">
        Preview
      </span>

      {/* ── Row 1: User information ──────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        {/* Avatar + online dot */}
        <div className="relative shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 font-display text-sm font-bold text-white">
            {getInitial(sellerAddress)}
          </div>
          <span
            className="absolute bottom-0 right-0 h-[7px] w-[7px] rounded-full border-[1.5px] border-white bg-green-500"
            aria-hidden
          />
        </div>

        {/* Name + stats */}
        <div className="flex min-w-0 flex-col gap-0.5 pr-16">
          {/* Name row */}
          <div className="flex items-center gap-1">
            <span className="font-display text-[18px] font-semibold leading-[1.5] text-black truncate">
              {shortenAddress(sellerAddress)}
            </span>
            <BadgeCheck className="size-4 shrink-0 text-primary-500" strokeWidth={2} />
          </div>

          {/* Stats */}
          <div className="flex items-center gap-1.5">
            <span className="font-body text-[10px] font-semibold uppercase tracking-[0.5px] text-neutral-700">
              {reputationScore} Orders (100.00%)
            </span>
            <span className="h-3 w-px bg-gray-300" aria-hidden />
            <Clock className="size-3 shrink-0 text-neutral-700" strokeWidth={2} />
            <span className="font-body text-[10px] font-semibold uppercase tracking-[0.5px] text-neutral-700">
              24 h
            </span>
          </div>
        </div>
      </div>

      {/* ── Row 2: Pricing + CTA ────────────────────────────────────────── */}
      <div className="mt-3 flex items-center justify-between gap-3">
        {/* Rate + limits */}
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-1 leading-[1.5]">
            {hasRate ? (
              <>
                <span className="font-display text-[18px] font-semibold text-gray-900">
                  {rate.toLocaleString('en-US')} {currencyLabel}
                </span>
                <span className="font-body text-[13px] font-normal text-gray-400">
                  /USDC
                </span>
              </>
            ) : (
              <span className="font-display text-[18px] font-semibold text-gray-300">
                — {currencyLabel} /USDC
              </span>
            )}
          </div>
          <p className="font-body text-[12px] font-medium text-[#0f172a]">
            {limitsText}
          </p>
        </div>

        {/* Disabled preview button */}
        <button
          type="button"
          disabled
          className="shrink-0 cursor-default rounded-[8px] bg-green-600 px-3 py-2 text-xs font-semibold text-white opacity-70"
        >
          Buy Now
        </button>
      </div>

      {/* ── Row 3: Payment method badges ────────────────────────────────── */}
      <div className="mt-3 flex flex-wrap gap-1">
        {visibleMethods.length > 0 ? (
          <>
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
          </>
        ) : (
          <span className="font-body text-[10px] text-gray-300 italic">
            No methods selected yet
          </span>
        )}
      </div>
    </div>
  );
}
