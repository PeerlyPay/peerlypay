"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@crossmint/client-sdk-react-ui";
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
import { createOrderWithCrossmint } from "@/lib/p2p-crossmint";
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
  offerSide: "crypto" | "fiat";
  currencyCode: number;
  paymentMethodCode: number;
  rate: string;
  fiatAmount: string;
  minTrade: string;
  maxTrade: string;
};

const initialForm: OfferForm = {
  offerSide: "crypto",
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
  const { wallet } = useWallet();
  const user = useStore((state) => state.user);
  const refreshOrdersFromChain = useStore((state) => state.refreshOrdersFromChain);

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
  const isCryptoSide = form.offerSide === "crypto";

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

    const effectiveMinTrade = hasLimits ? minTrade : 0;
    const effectiveMaxTrade = hasLimits ? maxTrade : 0;

    if (effectiveMinTrade > 0 && effectiveMaxTrade > 0 && effectiveMinTrade > effectiveMaxTrade) {
      const message = "Minimum per trade cannot be greater than maximum.";
      setSubmitError(message);
      toast.error(message);
      return;
    }

    if (effectiveMaxTrade > usdcEscrow) {
      const message = "Maximum per trade cannot exceed the total offer size.";
      setSubmitError(message);
      toast.error(message);
      return;
    }

    if (isCryptoSide && user.balance.usdc < usdcEscrow) {
      const message = `Insufficient balance. You need ${usdcEscrow.toFixed(2)} USDC and have ${user.balance.usdc.toFixed(2)} USDC.`;
      setSubmitError(message);
      toast.error(message);
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    try {
      await createOrderWithCrossmint({
        wallet,
        caller: user.walletAddress as string,
        input: {
          type: isCryptoSide ? "sell" : "buy",
          amount: usdcEscrow,
          rate,
          fiatCurrencyCode: form.currencyCode,
          paymentMethodCode: form.paymentMethodCode,
          paymentMethodCodes: [form.paymentMethodCode],
          minTradeAmount: effectiveMinTrade > 0 ? effectiveMinTrade : undefined,
          maxTradeAmount: effectiveMaxTrade > 0 ? effectiveMaxTrade : undefined,
          durationSecs: 86400,
        },
      });

      await refreshOrdersFromChain();

      const successMessage = isCryptoSide
        ? `Offer posted on-chain. ${usdcEscrow.toFixed(2)} USDC is locked in escrow.`
        : "Offer posted on-chain. USDC escrow will be locked when a taker accepts.";
      toast.success(successMessage);
      router.push("/orders");
    } catch (error) {
      console.error("Failed to post offer on-chain", error);
      const message = "Failed to post offer on-chain. Please try again.";
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col pb-8">
      <div className="flex items-start gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700"
          aria-label="Go back"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div>
          <h1 className="text-h3 font-display font-bold text-gray-900">
            Post an offer
          </h1>
          <p className="mt-1 text-body-sm text-gray-500">
            Choose CRYPTO or FIAT, then set your price and amount.
          </p>
        </div>
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
                Offer side
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, offerSide: "crypto" }))}
                  className={`h-11 rounded-xl border text-sm font-semibold transition-colors ${
                    isCryptoSide
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-gray-200 bg-white text-gray-600"
                  }`}
                >
                  CRYPTO
                </button>
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, offerSide: "fiat" }))}
                  className={`h-11 rounded-xl border text-sm font-semibold transition-colors ${
                    !isCryptoSide
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-gray-200 bg-white text-gray-600"
                  }`}
                >
                  FIAT
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {isCryptoSide
                  ? "CRYPTO: you lock USDC now and receive fiat from a buyer."
                  : "FIAT: USDC is locked by the taker when your offer is matched."}
              </p>
            </div>

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
            {isCryptoSide ? "You will lock " : "Offer size "}
            <strong className="text-gray-900">
              {usdcEscrow.toFixed(2)} USDC
            </strong>
          </p>
          {isCryptoSide ? (
            <p className="text-xs text-gray-500">
              Balance: {user.balance.usdc.toFixed(2)} USDC
            </p>
          ) : (
            <p className="text-xs text-gray-500">
              Escrow is funded by the taker after match.
            </p>
          )}
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

      <div className="mt-6 border-t border-gray-200 bg-white pt-3">
        <div className="flex w-full items-center pb-2">
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
