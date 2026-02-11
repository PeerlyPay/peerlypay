export type OrderType = 'buy' | 'sell';
export type OrderStatus = 'open' | 'active' | 'completed' | 'cancelled' | 'disputed';
export type PaymentMethod = 'Bank Transfer' | 'MercadoPago';
export type Currency = 'ARS' | 'USD';

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

export interface Order {
  id: string;
  type: OrderType;
  amount: number;
  rate: number;
  currency: Currency;
  paymentMethod: PaymentMethod;
  duration: string;
  status: OrderStatus;
  createdAt: Date;
  createdBy: string;
  paymentMethods?: string[];
  displayName?: string;
  isVerified?: boolean;
  /** Mock: order creator's completed trades (Stellar will provide later) */
  reputation_score?: number;
  completionRate?: number;
}

export interface CreateOrderInput {
  type: OrderType;
  amount: number;
  rate: number;
  currency: Currency;
  paymentMethod: PaymentMethod;
  duration: string;
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
  matchedOrder: Order;
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
  currency: Currency;
}
