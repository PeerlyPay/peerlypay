export type OrderType = 'buy' | 'sell';

export type P2POrderStatus =
  | 'Created'
  | 'AwaitingFiller'
  | 'AwaitingPayment'
  | 'AwaitingConfirmation'
  | 'Completed'
  | 'Disputed'
  | 'Refunded'
  | 'Cancelled';

export const P2P_ORDER_STATUSES: ReadonlyArray<P2POrderStatus> = [
  'Created',
  'AwaitingFiller',
  'AwaitingPayment',
  'AwaitingConfirmation',
  'Completed',
  'Disputed',
  'Refunded',
  'Cancelled',
];

export enum FiatCurrencyCode {
  Usd = 0,
  Eur = 1,
  Ars = 2,
  Cop = 3,
  Gbp = 4,
}

export enum PaymentMethodCode {
  BankTransfer = 0,
  MobileWallet = 1,
  Cash = 2,
}

export type FiatCurrencyCodeValue = number;
export type PaymentMethodCodeValue = number;

export interface User {
  walletAddress: string | null;
  walletOwner?: string | null;
  walletStatus?: string | null;
  isConnected: boolean;
  balance: {
    usd: number;
    usdc: number;
  };
  /** Mock: completed trades count for reputation (Stellar will provide later) */
  reputation_score?: number;
}

export interface ChainOrder {
  order_id: bigint;
  creator: string;
  filler?: string;
  amount: bigint;
  remaining_amount: bigint;
  filled_amount: bigint;
  active_fill_amount?: bigint;
  exchange_rate: bigint;
  from_crypto: boolean;
  fiat_currency_code: FiatCurrencyCodeValue;
  payment_method_code: PaymentMethodCodeValue;
  status: P2POrderStatus;
  created_at: number;
  deadline: number;
  fiat_transfer_deadline?: number;
}

export interface UiOrder {
  id: string;
  orderId: bigint;
  type: OrderType;
  totalAmount: number;
  remainingAmount: number;
  filledAmount: number;
  activeFillAmount: number;
  amount: number;
  rate: number;
  fiatCurrencyCode: FiatCurrencyCodeValue;
  fiatCurrencyLabel: string;
  paymentMethodCode: PaymentMethodCodeValue;
  paymentMethodLabel: string;
  durationSecs: number;
  durationLabel: string;
  status: P2POrderStatus;
  createdAt: Date;
  createdBy: string;
  filler?: string;
  paymentMethodLabels?: string[];
  displayName?: string;
  isVerified?: boolean;
  reputation_score?: number;
  completionRate?: number;
}

export type Order = UiOrder;

export interface CreateOrderInput {
  type: OrderType;
  amount: number;
  rate: number;
  fiatCurrencyCode: FiatCurrencyCodeValue;
  paymentMethodCode: PaymentMethodCodeValue;
  durationSecs: number;
}

export interface MatchOrderInput {
  type: OrderType;
  amount: number;
  userId: string;
}

export type OrderHistoryStatus =
  | 'awaiting_payment'
  | 'payment_sent'
  | 'releasing'
  | 'completed'
  | 'cancelled'
  | 'disputed'
  | 'expired';

export interface OrderHistoryItem {
  id: string;
  type: OrderType;
  status: OrderHistoryStatus;
  usdc_amount: number;
  fiat_amount: number;
  rate: number;
  counterparty: {
    username?: string;
    address: string;
  };
  updated_at: string;
}

export interface MatchedMaker {
  address: string;
  displayName?: string;
  reputation_score: number;
  completionRate: number;
  isVerified: boolean;
  totalOrders: number;
}

export interface MatchOrderResult {
  matchedOrder: UiOrder;
  fillAmount: number;
  maker: MatchedMaker;
  estimatedAmount: number;
  rate: number;
  fee: number;
  total: number;
}

export interface QuickTradeEstimate {
  amount: number;
  rate: number;
  fiatAmount: number;
  fee: number;
  total: number;
  fiatCurrencyCode: FiatCurrencyCodeValue;
}
