'use client';

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
  const methodsText =
    paymentMethodLabels.length > 0
      ? paymentMethodLabels.join(' · ')
      : 'No method selected';

  const hasRate = rate > 0;
  const hasAmount = usdcAmount > 0;

  return (
    <div className="relative rounded-xl border border-primary-200 bg-white p-4 shadow-sm ring-2 ring-primary-100">
      {/* Preview badge */}
      <span className="absolute right-3 top-3 rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary-600">
        Preview
      </span>

      {/* Row 1: Avatar + username + online */}
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-sm font-display font-bold text-white">
            {getInitial(sellerAddress)}
          </div>
          <span
            className="absolute bottom-0 right-0 h-2 w-2 rounded-full border-2 border-white bg-green-500"
            aria-hidden
          />
        </div>
        <span className="text-base font-semibold text-gray-900 truncate pr-16">
          {shortenAddress(sellerAddress)}
        </span>
      </div>

      {/* Row 2: Reputation | Payment window */}
      <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
        <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2 py-1 text-xs font-semibold text-cyan-700">
          ⭐ {reputationScore === 0 ? 'New trader' : `${reputationScore} trades`}
        </span>
        <span aria-hidden>|</span>
        <span>Payment window: 24 h</span>
      </div>

      {/* Row 3: Exchange rate - prominent */}
      <p className="mt-2 text-3xl font-display font-bold text-gray-900">
        {hasRate
          ? `1 USDC = ${rate.toLocaleString('en-US')} ${currencyLabel}`
          : <span className="text-gray-300">1 USDC = — {currencyLabel}</span>}
      </p>

      {/* Row 4: Available */}
      <p className="mt-1 text-sm text-gray-600">
        {hasAmount ? (
          <>Available: <span className="font-semibold">{usdcAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })} USDC</span></>
        ) : (
          <span className="text-gray-300">Available: — USDC</span>
        )}
      </p>

      {/* Row 4b: Limits */}
      {(minTrade > 0 || maxTrade > 0) && (
        <p className="mt-0.5 text-xs text-gray-500">
          Limit per trade:{' '}
          <span className="font-medium">
            {minTrade > 0 ? `${minTrade.toLocaleString('en-US')} USDC` : '—'}
            {' – '}
            {maxTrade > 0 ? `${maxTrade.toLocaleString('en-US')} USDC` : '—'}
          </span>
        </p>
      )}

      {/* Row 5: Payment methods + button */}
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-sm text-gray-700 truncate min-w-0">{methodsText}</span>
        <button
          type="button"
          disabled
          className="shrink-0 cursor-default rounded-full bg-gradient-to-r from-primary-500 to-primary-600 px-5 py-2.5 text-sm font-display font-bold text-white opacity-70"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
