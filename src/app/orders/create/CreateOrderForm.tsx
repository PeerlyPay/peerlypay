'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@crossmint/client-sdk-react-ui';
import { toast } from 'sonner';
import { Minus, Plus, Loader2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { FiatCurrencyCode, PaymentMethodCode } from '@/types';
import type { CreateOrderInput } from '@/types';
import { durationLabel } from '@/lib/order-mapper';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createOrderWithCrossmint } from '@/lib/p2p-crossmint';

export interface FormData {
  amount: number;
  fiatCurrencyCode: number;
  rate: number;
  paymentMethodCode: number;
  durationSecs: number;
}

const CURRENCIES = [
  { label: 'USD', code: FiatCurrencyCode.Usd },
  { label: 'ARS', code: FiatCurrencyCode.Ars },
  { label: 'EUR', code: FiatCurrencyCode.Eur },
];
const PAYMENT_METHODS = [
  { label: 'Bank Transfer', code: PaymentMethodCode.BankTransfer },
  { label: 'Mobile Wallet', code: PaymentMethodCode.MobileWallet },
  { label: 'Cash', code: PaymentMethodCode.Cash },
];
const DURATIONS = [900, 1800, 3600, 86400, 259200, 604800];

interface CreateOrderFormProps {
  orderType: 'buy' | 'sell';
}

const initialFormData: FormData = {
  amount: 0,
  fiatCurrencyCode: FiatCurrencyCode.Usd,
  rate: 0,
  paymentMethodCode: PaymentMethodCode.BankTransfer,
  durationSecs: 86400,
};

function NumberField({
  value,
  onChange,
  min = 0,
  step = 1,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  step?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - step))}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all duration-200"
        aria-label="Decrease"
      >
        <Minus className="size-4" />
      </button>
      <Input
        type="number"
        min={min}
        step={step}
        value={value || ''}
        onChange={(e) => {
          const v = e.target.value === '' ? min : parseFloat(e.target.value);
          onChange(isNaN(v) ? min : Math.max(min, v));
        }}
        className="flex-1 rounded-xl border border-gray-200 bg-gray-50 text-center text-body"
      />
      <button
        type="button"
        onClick={() => onChange(value + step)}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all duration-200"
        aria-label="Increase"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}

export default function CreateOrderForm({ orderType }: CreateOrderFormProps) {
  const router = useRouter();
  const { wallet } = useWallet();
  const user = useStore((state) => state.user);
  const refreshOrdersFromChain = useStore((state) => state.refreshOrdersFromChain);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const isWalletReady = user.isConnected && Boolean(user.walletAddress);

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault?.();

    if (!isWalletReady) {
      toast.error('Connect your wallet before creating an order.');
      return;
    }

    const { amount, rate, fiatCurrencyCode, paymentMethodCode, durationSecs } = formData;
    if (amount <= 0) {
      toast.error('Amount must be greater than 0.');
      return;
    }
    if (rate < 0) {
      toast.error('Rate must be 0 or greater.');
      return;
    }
    if (durationSecs <= 0) {
      toast.error('Please complete all required fields.');
      return;
    }

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));

    const input: CreateOrderInput = {
      type: orderType,
      amount,
      rate,
      fiatCurrencyCode,
      paymentMethodCode,
      durationSecs,
    };

    try {
      await createOrderWithCrossmint({
        wallet,
        caller: user.walletAddress as string,
        input,
      });
      await refreshOrdersFromChain();
      toast.success('Order created on-chain successfully!');
      router.push('/');
    } catch (error) {
      console.error('Failed to create order on-chain', error);
      toast.error('Failed to create order on-chain. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(e);
      }}
      className="flex flex-col gap-6"
    >
      {/* USDC Amount */}
      <div>
        <Label className="mb-2 block text-body font-semibold text-gray-700">
          USDC Amount
        </Label>
        <NumberField
          value={formData.amount}
          onChange={(v) => update('amount', v)}
          min={0}
          step={10}
        />
      </div>

      {/* Currency + Rate */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="mb-2 block text-body font-semibold text-gray-700">
            Fiat Currency
          </Label>
          <Select
            value={String(formData.fiatCurrencyCode)}
            onValueChange={(v) => update('fiatCurrencyCode', Number(v))}
          >
            <SelectTrigger className="w-full rounded-xl border border-gray-200 bg-gray-50">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c.code} value={String(c.code)}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-2 block text-body font-semibold text-gray-700">
            Exchange Rate
          </Label>
          <NumberField
            value={formData.rate}
            onChange={(v) => update('rate', v)}
            min={0}
            step={0.01}
          />
        </div>
      </div>

      {/* Payment + Duration */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="mb-2 block text-body font-semibold text-gray-700">
            Payment Method
          </Label>
          <Select
            value={String(formData.paymentMethodCode)}
            onValueChange={(v) => update('paymentMethodCode', Number(v))}
          >
            <SelectTrigger className="w-full rounded-xl border border-gray-200 bg-gray-50">
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map((m) => (
                <SelectItem key={m.code} value={String(m.code)}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-2 block text-body font-semibold text-gray-700">
            Duration
          </Label>
          <Select
            value={String(formData.durationSecs)}
            onValueChange={(v) => update('durationSecs', Number(v))}
          >
            <SelectTrigger className="w-full rounded-xl border border-gray-200 bg-gray-50">
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              {DURATIONS.map((d) => (
                <SelectItem key={d} value={String(d)}>
                  {durationLabel(d)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Warning */}
      <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800 [&_svg]:text-yellow-600">
        <AlertTitle className="text-body-sm font-bold">Important</AlertTitle>
        <AlertDescription className="text-body-sm text-yellow-800/90">
          Orders are binding. Ensure your payment details are correct before
          submitting.
        </AlertDescription>
      </Alert>

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading || !isWalletReady}
        className="mt-6 w-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 py-4 text-body font-bold text-white hover:opacity-90 transition-all duration-200 disabled:opacity-70"
      >
        {isLoading ? (
          <>
            <Loader2 className="size-5 animate-spin" />
            Creating...
          </>
        ) : (
          isWalletReady
            ? `Create ${orderType === 'sell' ? 'Sell' : 'Buy'} Order`
            : 'Connect wallet to continue'
        )}
      </Button>
    </form>
  );
}
