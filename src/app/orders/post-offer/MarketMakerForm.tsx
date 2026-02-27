'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Info, Lock, Loader2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { FiatCurrencyCode, PaymentMethodCode } from '@/types';
import { paymentMethodLabel } from '@/lib/order-mapper';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import OfferPreviewCard from './OfferPreviewCard';

// ─── Static data ────────────────────────────────────────────────────────────

const LATAM_CURRENCIES = [
  { code: FiatCurrencyCode.Ars, label: 'ARS', country: 'Argentina', marketRate: 950   },
  { code: FiatCurrencyCode.Cop, label: 'COP', country: 'Colombia',  marketRate: 4150  },
  { code: FiatCurrencyCode.Ves, label: 'VES', country: 'Venezuela', marketRate: 36    },
  { code: FiatCurrencyCode.Brl, label: 'BRL', country: 'Brazil',    marketRate: 5.05  },
  { code: FiatCurrencyCode.Mxn, label: 'MXN', country: 'Mexico',    marketRate: 17.2  },
  { code: FiatCurrencyCode.Clp, label: 'CLP', country: 'Chile',     marketRate: 940   },
  { code: FiatCurrencyCode.Pen, label: 'PEN', country: 'Peru',      marketRate: 3.75  },
] as const;

const TRANSFER_METHODS = [
  { code: PaymentMethodCode.BankTransfer, label: 'Bank Transfer' },
  { code: PaymentMethodCode.MercadoPago,  label: 'Mercado Pago' },
  { code: PaymentMethodCode.Nequi,        label: 'Nequi' },
  { code: PaymentMethodCode.PagoMovil,    label: 'Pago Móvil' },
  { code: PaymentMethodCode.Zelle,        label: 'Zelle' },
  { code: PaymentMethodCode.Wise,         label: 'Wise' },
  { code: PaymentMethodCode.Cash,         label: 'Cash' },
] as const;

// ─── Form state ──────────────────────────────────────────────────────────────

interface OfferForm {
  currencyCode: number;
  country: string;
  paymentMethodCodes: number[];
  rate: string;
  fiatAmount: string;
  minTrade: string;
  maxTrade: string;
}

const initialForm: OfferForm = {
  currencyCode: FiatCurrencyCode.Ars,
  country: 'Argentina',
  paymentMethodCodes: [],
  rate: '',
  fiatAmount: '',
  minTrade: '',
  maxTrade: '',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseNum(v: string): number {
  const n = parseFloat(v.replace(/,/g, '.'));
  return isNaN(n) ? 0 : n;
}

function getCurrencyMeta(code: number) {
  return LATAM_CURRENCIES.find((c) => c.code === code) ?? LATAM_CURRENCIES[0];
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function MarketMakerForm() {
  const router = useRouter();
  const { user, createOrder, subtractBalance } = useStore();

  const [form, setForm] = useState<OfferForm>(initialForm);
  const [isLoading, setIsLoading] = useState(false);

  const isWalletReady = user.isConnected && Boolean(user.walletAddress);
  const currencyMeta = getCurrencyMeta(form.currencyCode);

  // Derived numeric values
  const rate       = parseNum(form.rate);
  const fiatAmount = parseNum(form.fiatAmount);
  const minTrade   = parseNum(form.minTrade);
  const maxTrade   = parseNum(form.maxTrade);
  const usdcEscrow = rate > 0 && fiatAmount > 0 ? fiatAmount / rate : 0;

  // Payment method labels for preview
  const selectedMethodLabels = useMemo(
    () => form.paymentMethodCodes.map((c) => paymentMethodLabel(c)),
    [form.paymentMethodCodes],
  );

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleCurrencyChange = (value: string) => {
    const code = Number(value);
    const meta = getCurrencyMeta(code);
    setForm((prev) => ({ ...prev, currencyCode: code, country: meta.country }));
  };

  const toggleMethod = (code: number) => {
    setForm((prev) => ({
      ...prev,
      paymentMethodCodes: prev.paymentMethodCodes.includes(code)
        ? prev.paymentMethodCodes.filter((c) => c !== code)
        : [...prev.paymentMethodCodes, code],
    }));
  };

  const useMarketRate = () => {
    setForm((prev) => ({ ...prev, rate: String(currencyMeta.marketRate) }));
    toast.info(`Market rate applied: 1 USDC = ${currencyMeta.marketRate} ${currencyMeta.label}`);
  };

  const handleSubmit = async () => {
    if (!isWalletReady) {
      toast.error('Connect your wallet before posting an offer.');
      return;
    }
    if (form.paymentMethodCodes.length === 0) {
      toast.error('Select at least one transfer method.');
      return;
    }
    if (rate <= 0) {
      toast.error('Enter a valid exchange rate.');
      return;
    }
    if (fiatAmount <= 0) {
      toast.error('Enter the available fiat amount.');
      return;
    }
    if (usdcEscrow <= 0) {
      toast.error('The calculated USDC amount is not valid.');
      return;
    }
    if (minTrade > 0 && maxTrade > 0 && minTrade > maxTrade) {
      toast.error('Minimum per trade cannot be greater than the maximum.');
      return;
    }
    if (maxTrade > usdcEscrow) {
      toast.error('Maximum per trade cannot exceed the total escrow amount.');
      return;
    }
    if (user.balance.usdc < usdcEscrow) {
      toast.error(
        `Insufficient balance. You need ${usdcEscrow.toFixed(2)} USDC but have ${user.balance.usdc.toFixed(2)} USDC.`,
      );
      return;
    }

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));

    const escrowed = subtractBalance(usdcEscrow);
    if (!escrowed) {
      toast.error('Could not reserve balance. Please try again.');
      setIsLoading(false);
      return;
    }

    createOrder({
      type: 'sell',
      amount: usdcEscrow,
      rate,
      fiatCurrencyCode: form.currencyCode,
      paymentMethodCode: form.paymentMethodCodes[0],
      paymentMethodCodes: form.paymentMethodCodes,
      minTradeAmount: minTrade > 0 ? minTrade : undefined,
      maxTradeAmount: maxTrade > 0 ? maxTrade : undefined,
      durationSecs: 86400,
    });

    toast.success(`Offer posted! ${usdcEscrow.toFixed(2)} USDC moved to escrow.`);
    router.push('/orders/mine');
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6 pb-8">

      {/* Back header */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div>
          <h1 className="text-h3 font-display font-bold text-gray-900">Post Offer</h1>
          <p className="text-body-sm text-gray-500">Sell USDC for local currency</p>
        </div>
      </div>

      {/* ── Section 1: Currency & Country ─────────────────────────────────── */}
      <section className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
        <h2 className="text-caption text-gray-500 uppercase tracking-wider">Currency & Location</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="mb-1.5 block text-body-sm font-semibold text-gray-700">
              Fiat Currency
            </Label>
            <Select
              value={String(form.currencyCode)}
              onValueChange={handleCurrencyChange}
            >
              <SelectTrigger className="w-full rounded-xl border border-gray-200 bg-white">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {LATAM_CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={String(c.code)}>
                    {c.label} — {c.country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-1.5 block text-body-sm font-semibold text-gray-700">
              Country
            </Label>
            <Input
              type="text"
              value={form.country}
              onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
              className="rounded-xl border border-gray-200 bg-white"
              placeholder="Country"
            />
          </div>
        </div>
      </section>

      {/* ── Section 2: Transfer methods (chip multi-select) ────────────────── */}
      <section className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
        <h2 className="text-caption text-gray-500 uppercase tracking-wider">Transfer Methods</h2>
        <div className="flex flex-wrap gap-2">
          {TRANSFER_METHODS.map((m) => {
            const selected = form.paymentMethodCodes.includes(m.code);
            return (
              <button
                key={m.code}
                type="button"
                onClick={() => toggleMethod(m.code)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-150',
                  selected
                    ? 'border-primary-500 bg-primary-500 text-white shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-primary-300 hover:text-primary-600',
                )}
              >
                {m.label}
              </button>
            );
          })}
        </div>
        {form.paymentMethodCodes.length === 0 && (
          <p className="text-xs text-gray-400">Select one or more methods.</p>
        )}
      </section>

      {/* ── Section 3: Exchange rate ───────────────────────────────────────── */}
      <section className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
        <h2 className="text-caption text-gray-500 uppercase tracking-wider">Exchange Rate</h2>

        <div>
          <Label className="mb-1.5 block text-body-sm font-semibold text-gray-700">
            1 USDC =
          </Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              step="any"
              value={form.rate}
              onChange={(e) => setForm((p) => ({ ...p, rate: e.target.value }))}
              placeholder={`e.g. ${currencyMeta.marketRate}`}
              className="flex-1 rounded-xl border border-gray-200 bg-white font-mono text-lg"
            />
            <span className="shrink-0 text-base font-bold text-gray-700">
              {currencyMeta.label}
            </span>
          </div>
        </div>

        {/* Market rate helper */}
        <button
          type="button"
          onClick={useMarketRate}
          className="flex items-center gap-1.5 self-start rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-700 hover:bg-cyan-100 transition-colors"
        >
          <Info className="size-3.5" />
          Use market rate: 1 USDC ≈ {currencyMeta.marketRate.toLocaleString('en-US')} {currencyMeta.label}
        </button>
      </section>

      {/* ── Section 4: Capacity ───────────────────────────────────────────── */}
      <section className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
        <h2 className="text-caption text-gray-500 uppercase tracking-wider">Offer Capacity</h2>

        <div>
          <Label className="mb-1.5 block text-body-sm font-semibold text-gray-700">
            Available fiat amount (max. you can receive)
          </Label>
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-sm font-bold text-gray-500">{currencyMeta.label}</span>
            <Input
              type="number"
              min={0}
              step="any"
              value={form.fiatAmount}
              onChange={(e) => setForm((p) => ({ ...p, fiatAmount: e.target.value }))}
              placeholder={`e.g. ${currencyMeta.code === FiatCurrencyCode.Ars ? '500000' : '1000'}`}
              className="flex-1 rounded-xl border border-gray-200 bg-white font-mono"
            />
          </div>
        </div>

        {/* Computed USDC escrow */}
        {usdcEscrow > 0 && (
          <div className="flex items-center gap-2 rounded-xl border border-lime-200 bg-lime-50 px-3 py-2.5">
            <Lock className="size-4 shrink-0 text-lime-600" />
            <div>
              <p className="text-xs font-semibold text-lime-700">USDC to lock in escrow</p>
              <p className="font-mono text-base font-bold text-lime-800">
                {usdcEscrow.toLocaleString('en-US', { maximumFractionDigits: 4 })} USDC
              </p>
            </div>
          </div>
        )}

        {/* Balance warning */}
        {usdcEscrow > 0 && usdcEscrow > user.balance.usdc && (
          <p className="text-xs text-red-500">
            Insufficient balance. You have {user.balance.usdc.toFixed(2)} USDC available.
          </p>
        )}
      </section>

      {/* ── Section 5: Per-trade limits ───────────────────────────────────── */}
      <section className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
        <h2 className="text-caption text-gray-500 uppercase tracking-wider">Limits per Trade</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="mb-1.5 block text-body-sm font-semibold text-gray-700">
              Minimum (USDC)
            </Label>
            <Input
              type="number"
              min={0}
              step="any"
              value={form.minTrade}
              onChange={(e) => setForm((p) => ({ ...p, minTrade: e.target.value }))}
              placeholder="e.g. 10"
              className="rounded-xl border border-gray-200 bg-white font-mono"
            />
          </div>
          <div>
            <Label className="mb-1.5 block text-body-sm font-semibold text-gray-700">
              Maximum (USDC)
            </Label>
            <Input
              type="number"
              min={0}
              step="any"
              value={form.maxTrade}
              onChange={(e) => setForm((p) => ({ ...p, maxTrade: e.target.value }))}
              placeholder="e.g. 200"
              className="rounded-xl border border-gray-200 bg-white font-mono"
            />
          </div>
        </div>
        {minTrade > 0 && maxTrade > 0 && minTrade > maxTrade && (
          <p className="text-xs text-red-500">Minimum cannot exceed maximum.</p>
        )}
      </section>

      {/* ── Section 6: Live preview ───────────────────────────────────────── */}
      <section className="flex flex-col gap-3">
        <h2 className="text-caption text-gray-500 uppercase tracking-wider">
          How your offer will look in the marketplace
        </h2>
        <OfferPreviewCard
          currencyLabel={currencyMeta.label}
          rate={rate}
          usdcAmount={usdcEscrow}
          minTrade={minTrade}
          maxTrade={maxTrade}
          paymentMethodLabels={selectedMethodLabels}
          sellerAddress={user.walletAddress ?? ''}
          reputationScore={user.reputation_score ?? 0}
        />
      </section>

      {/* ── Submit ───────────────────────────────────────────────────────── */}
      <Button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading || !isWalletReady}
        className="w-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 py-4 text-body font-bold text-white hover:opacity-90 transition-all duration-200 disabled:opacity-70"
      >
        {isLoading ? (
          <>
            <Loader2 className="size-5 animate-spin" />
            Posting offer…
          </>
        ) : isWalletReady ? (
          usdcEscrow > 0
            ? `Post Offer · lock ${usdcEscrow.toFixed(2)} USDC`
            : 'Post Offer'
        ) : (
          'Connect wallet to continue'
        )}
      </Button>
    </div>
  );
}
