import type { ChainOrder, CreateOrderInput, OrderType, UiOrder } from '@/types';
import { FiatCurrencyCode, PaymentMethodCode } from '@/types';

const FIAT_LABELS: Record<number, string> = {
  [FiatCurrencyCode.Usd]: 'USD',
  [FiatCurrencyCode.Eur]: 'EUR',
  [FiatCurrencyCode.Ars]: 'ARS',
  [FiatCurrencyCode.Cop]: 'COP',
  [FiatCurrencyCode.Gbp]: 'GBP',
};

const PAYMENT_LABELS: Record<number, string> = {
  [PaymentMethodCode.BankTransfer]: 'Bank Transfer',
  [PaymentMethodCode.MobileWallet]: 'Mobile Wallet',
  [PaymentMethodCode.Cash]: 'Cash',
};

const DURATION_LABELS: Record<number, string> = {
  900: '15 min',
  1800: '30 min',
  3600: '1 hour',
  86400: '1 day',
  259200: '3 days',
  604800: '7 days',
};

export function fiatCurrencyLabel(code: number): string {
  return FIAT_LABELS[code] ?? `FIAT-${code}`;
}

export function paymentMethodLabel(code: number): string {
  return PAYMENT_LABELS[code] ?? `Method-${code}`;
}

export function durationLabel(durationSecs: number): string {
  return DURATION_LABELS[durationSecs] ?? `${durationSecs}s`;
}

export function durationSecsFromLabel(label: string): number {
  const entry = Object.entries(DURATION_LABELS).find(([, value]) => value === label);
  return entry ? Number(entry[0]) : 1800;
}

export function orderTypeToFromCrypto(type: OrderType): boolean {
  return type === 'sell';
}

export function fromCryptoToOrderType(fromCrypto: boolean): OrderType {
  return fromCrypto ? 'sell' : 'buy';
}

export function chainToUiOrder(chain: ChainOrder): UiOrder {
  return {
    id: chain.order_id.toString(),
    orderId: chain.order_id,
    type: fromCryptoToOrderType(chain.from_crypto),
    amount: Number(chain.amount),
    rate: Number(chain.exchange_rate),
    fiatCurrencyCode: chain.fiat_currency_code,
    fiatCurrencyLabel: fiatCurrencyLabel(chain.fiat_currency_code),
    paymentMethodCode: chain.payment_method_code,
    paymentMethodLabel: paymentMethodLabel(chain.payment_method_code),
    durationSecs: Math.max(0, chain.deadline - chain.created_at),
    durationLabel: durationLabel(Math.max(0, chain.deadline - chain.created_at)),
    status: chain.status,
    createdAt: new Date(chain.created_at * 1000),
    createdBy: chain.creator,
    filler: chain.filler,
  };
}

export function createOrderInputToContractArgs(input: CreateOrderInput): {
  fiat_currency_code: number;
  payment_method_code: number;
  from_crypto: boolean;
  amount: bigint;
  exchange_rate: bigint;
  duration_secs: number;
} {
  return {
    fiat_currency_code: input.fiatCurrencyCode,
    payment_method_code: input.paymentMethodCode,
    from_crypto: orderTypeToFromCrypto(input.type),
    amount: BigInt(Math.round(input.amount)),
    exchange_rate: BigInt(Math.round(input.rate)),
    duration_secs: input.durationSecs,
  };
}
