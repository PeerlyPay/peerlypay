export type OrderType = 'buy' | 'sell';
export type OrderStatus = 'open' | 'active' | 'completed' | 'cancelled' | 'disputed';
export type PaymentMethod = 'Bank Transfer' | 'MercadoPago';
export type Currency = 'ARS' | 'USD';

export interface User {
  walletAddress: string | null;
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
  /** Mock: order creator's completed trades (Stellar will provide later) */
  reputation_score?: number;
}

export interface CreateOrderInput {
  type: OrderType;
  amount: number;
  rate: number;
  currency: Currency;
  paymentMethod: PaymentMethod;
  duration: string;
}