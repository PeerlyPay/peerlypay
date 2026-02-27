"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Info, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { FiatCurrencyCode, PaymentMethodCode } from "@/types";

const LATAM_CURRENCIES = [
  { code: FiatCurrencyCode.Ars, label: "ARS", marketRate: 1400 },
  { code: FiatCurrencyCode.Cop, label: "COP", marketRate: 4150 },
  { code: FiatCurrencyCode.Ves, label: "VES", marketRate: 36 },
  { code: FiatCurrencyCode.Brl, label: "BRL", marketRate: 5.05 },
  { code: FiatCurrencyCode.Mxn, label: "MXN", marketRate: 17.2 },
  { code: FiatCurrencyCode.Clp, label: "CLP", marketRate: 940 },
  { code: FiatCurrencyCode.Pen, label: "PEN", marketRate: 3.75 },
] as const;

const TRANSFER_METHODS = [
  { code: PaymentMethodCode.BankTransfer, label: "Bank Transfer" },
  { code: PaymentMethodCode.MercadoPago, label: "Mercado Pago" },
  { code: PaymentMethodCode.Nequi, label: "Nequi" },
  { code: PaymentMethodCode.PagoMovil, label: "Pago Movil" },
  { code: PaymentMethodCode.Zelle, label: "Zelle" },
  { code: PaymentMethodCode.Wise, label: "Wise" },
  { code: PaymentMethodCode.Cash, label: "Cash" },
] as const;

type OfferForm = {
  currencyCode: number;
  paymentMethodCode: number;
  rate: string;
  fiatAmount: string;
  minTrade: string;
  maxTrade: string;
};

const initialForm: OfferForm = {
  currencyCode: FiatCurrencyCode.Ars,
  paymentMethodCode: PaymentMethodCode.BankTransfer,
  rate: "",
  fiatAmount: "",
  minTrade: "",
  maxTrade: "",
};

function parseNum(value: string): number {
  const parsed = parseFloat(value.replace(/,/g, "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function getCurrencyMeta(code: number) {
  return (
    LATAM_CURRENCIES.find((currency) => currency.code === code) ??
    LATAM_CURRENCIES[0]
  );
}

export default function MarketMakerForm() {
  const router = useRouter();
  const { user, createOrder, subtractBalance } = useStore();

  const [form, setForm] = useState<OfferForm>(initialForm);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hasLimits, setHasLimits] = useState(false);

  const isWalletReady = user.isConnected && Boolean(user.walletAddress);
  const currencyMeta = getCurrencyMeta(form.currencyCode);

  const rate = parseNum(form.rate);
  const fiatAmount = parseNum(form.fiatAmount);
  const minTrade = parseNum(form.minTrade);
  const maxTrade = parseNum(form.maxTrade);
  const usdcEscrow = rate > 0 && fiatAmount > 0 ? fiatAmount / rate : 0;

  const useMarketRate = () => {
    setForm((prev) => ({ ...prev, rate: String(currencyMeta.marketRate) }));
  };

  const handleSubmit = async () => {
    setSubmitError(null);

    if (!isWalletReady) {
      const message = "Connect your wallet before posting an offer.";
      setSubmitError(message);
      toast.error(message);
      return;
    }

    if (rate <= 0) {
      const message = "Enter a valid exchange rate.";
      setSubmitError(message);
      toast.error(message);
      return;
    }

    if (fiatAmount <= 0) {
      const message = "Enter the fiat amount you want to receive.";
      setSubmitError(message);
      toast.error(message);
      return;
    }

    if (usdcEscrow <= 0) {
      const message = "The USDC lock amount is invalid. Check your inputs.";
      setSubmitError(message);
      toast.error(message);
      return;
    }

    if (minTrade > 0 && maxTrade > 0 && minTrade > maxTrade) {
      const message = "Minimum per trade cannot be greater than maximum.";
      setSubmitError(message);
      toast.error(message);
      return;
    }

    if (maxTrade > usdcEscrow) {
      const message = "Maximum per trade cannot exceed the total offer size.";
      setSubmitError(message);
      toast.error(message);
      return;
    }

    if (user.balance.usdc < usdcEscrow) {
      const message = `Insufficient balance. You need ${usdcEscrow.toFixed(2)} USDC and have ${user.balance.usdc.toFixed(2)} USDC.`;
      setSubmitError(message);
      toast.error(message);
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    const escrowed = subtractBalance(usdcEscrow);
    if (!escrowed) {
      const message = "Could not reserve balance. Please try again.";
      setSubmitError(message);
      toast.error(message);
      setIsLoading(false);
      return;
    }

    createOrder({
      type: "sell",
      amount: usdcEscrow,
      rate,
      fiatCurrencyCode: form.currencyCode,
      paymentMethodCode: form.paymentMethodCode,
      paymentMethodCodes: [form.paymentMethodCode],
      minTradeAmount: minTrade > 0 ? minTrade : undefined,
      maxTradeAmount: maxTrade > 0 ? maxTrade : undefined,
      durationSecs: 86400,
    });

    toast.success(
      `Offer posted. ${usdcEscrow.toFixed(2)} USDC is locked in escrow.`,
    );
    router.push("/orders/mine");
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col pb-28">
      <div className="pt-2">
        <h1 className="text-h3 font-display font-bold text-gray-900">
          Post a sell offer
        </h1>
        <p className="mt-1 text-body-sm text-gray-500">
          Set your price and amount, then post.
        </p>
      </div>

      {submitError && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <div className="mt-5 space-y-4">
        <section>
          <h2 className="mb-2 text-sm font-semibold text-gray-900">
            Offer details
          </h2>

          <div className="space-y-3">
            <div>
              <Label className="mb-1.5 block text-body-sm text-gray-700">
                Currency
              </Label>
              <Select
                value={String(form.currencyCode)}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, currencyCode: Number(value) }))
                }
              >
                <SelectTrigger className="h-12 w-full rounded-xl border border-gray-200 bg-white">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {LATAM_CURRENCIES.map((currency) => (
                    <SelectItem
                      key={currency.code}
                      value={String(currency.code)}
                    >
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-1.5 block text-body-sm text-gray-700">
                Payment method
              </Label>
              <Select
                value={String(form.paymentMethodCode)}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    paymentMethodCode: Number(value),
                  }))
                }
              >
                <SelectTrigger className="h-12 w-full rounded-xl border border-gray-200 bg-white">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {TRANSFER_METHODS.map((method) => (
                    <SelectItem key={method.code} value={String(method.code)}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-1.5 block text-body-sm text-gray-700">
                Rate (1 USDC =)
              </Label>
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3">
                <Input
                  type="number"
                  min={0}
                  step="any"
                  value={form.rate}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, rate: event.target.value }))
                  }
                  placeholder={`e.g. ${currencyMeta.marketRate}`}
                  className="h-12 border-none bg-transparent px-0 font-mono shadow-none focus-visible:ring-0"
                />
                <span className="shrink-0 text-sm font-semibold text-gray-700">
                  {currencyMeta.label}
                </span>
              </div>
              <button
                type="button"
                onClick={useMarketRate}
                className="mt-2 inline-flex items-center gap-1 rounded-lg border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700"
              >
                <Info className="size-3.5" />
                Use market rate
              </button>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-semibold text-gray-900">Amount</h2>
          <Label className="mb-1.5 block text-body-sm text-gray-700">
            Fiat amount to receive
          </Label>
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3">
            <span className="shrink-0 text-sm font-semibold text-gray-500">
              {currencyMeta.label}
            </span>
            <Input
              type="number"
              min={0}
              step="any"
              value={form.fiatAmount}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, fiatAmount: event.target.value }))
              }
              placeholder="e.g. 500000"
              className="h-12 border-none bg-transparent px-0 font-mono shadow-none focus-visible:ring-0"
            />
          </div>
          <p className="mt-2 text-sm text-gray-600">
            You will lock{" "}
            <strong className="text-gray-900">
              {usdcEscrow.toFixed(2)} USDC
            </strong>
          </p>
          <p className="text-xs text-gray-500">
            Balance: {user.balance.usdc.toFixed(2)} USDC
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-semibold text-gray-900">
            Publishing
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className="h-11 rounded-xl border border-primary-500 bg-primary-50 text-sm font-semibold text-primary-700"
            >
              Post now
            </button>
            <button
              type="button"
              onClick={() => setHasLimits((prev) => !prev)}
              className="h-11 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600"
            >
              {hasLimits ? "Limits on" : "Set limits"}
            </button>
          </div>

          {hasLimits && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div>
                <Label className="mb-1.5 block text-xs text-gray-600">
                  Min USDC
                </Label>
                <Input
                  type="number"
                  min={0}
                  step="any"
                  value={form.minTrade}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      minTrade: event.target.value,
                    }))
                  }
                  placeholder="10"
                  className="h-11 rounded-xl border border-gray-200 bg-white font-mono"
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs text-gray-600">
                  Max USDC
                </Label>
                <Input
                  type="number"
                  min={0}
                  step="any"
                  value={form.maxTrade}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      maxTrade: event.target.value,
                    }))
                  }
                  placeholder="200"
                  className="h-11 rounded-xl border border-gray-200 bg-white font-mono"
                />
              </div>
            </div>
          )}
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-gray-200 bg-white px-4 pb-4 pt-3">
        <div className="mx-auto flex w-full max-w-md items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700"
            aria-label="Go back"
          >
            <ArrowLeft className="size-4" />
          </button>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !isWalletReady}
            className="h-11 flex-1 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Posting offer...
              </>
            ) : isWalletReady ? (
              "Post Offer"
            ) : (
              "Connect wallet"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
