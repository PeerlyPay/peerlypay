import { create } from 'zustand';
import { User, Order, CreateOrderInput, P2POrderStatus, FiatCurrencyCode, PaymentMethodCode } from '@/types';
import { durationLabel, fiatCurrencyLabel, paymentMethodLabel } from '@/lib/order-mapper';

interface AppState {
  user: User;
  orders: Order[];
  connectWallet: (walletAddress: string, walletOwner?: string | null, walletStatus?: string | null) => void;
  setWalletStatus: (walletStatus: string | null) => void;
  disconnectWallet: () => void;
  setBalance: (usdc: number) => void;
  addBalance: (amount: number) => void;
  subtractBalance: (amount: number) => boolean;
  createOrder: (input: CreateOrderInput) => void;
  updateOrderStatus: (orderId: string, status: P2POrderStatus) => void;
}

export const useStore = create<AppState>((set) => ({
  user: {
    walletAddress: null,
    walletOwner: null,
    walletStatus: 'logged-out',
    isConnected: false,
    balance: {
      usd: 0,
      usdc: 0,
    },
    reputation_score: 12,
  },
  orders: [
    {
      id: 'order_1',
      orderId: BigInt(1),
      type: 'sell',
      amount: 100,
      rate: 950,
      fiatCurrencyCode: FiatCurrencyCode.Ars,
      fiatCurrencyLabel: fiatCurrencyLabel(FiatCurrencyCode.Ars),
      paymentMethodCode: PaymentMethodCode.BankTransfer,
      paymentMethodLabel: paymentMethodLabel(PaymentMethodCode.BankTransfer),
      durationSecs: 86400,
      durationLabel: durationLabel(86400),
      status: 'AwaitingFiller',
      createdAt: new Date(),
      createdBy: '0x1234...5678',
      reputation_score: 47,
    },
    {
      id: 'order_2',
      orderId: BigInt(2),
      type: 'sell',
      amount: 50,
      rate: 955,
      fiatCurrencyCode: FiatCurrencyCode.Ars,
      fiatCurrencyLabel: fiatCurrencyLabel(FiatCurrencyCode.Ars),
      paymentMethodCode: PaymentMethodCode.MobileWallet,
      paymentMethodLabel: paymentMethodLabel(PaymentMethodCode.MobileWallet),
      durationSecs: 259200,
      durationLabel: durationLabel(259200),
      status: 'AwaitingFiller',
      createdAt: new Date(),
      createdBy: '0x9876...4321',
      reputation_score: 0,
    },
    {
      id: 'order_3',
      orderId: BigInt(3),
      type: 'buy',
      amount: 200,
      rate: 945,
      fiatCurrencyCode: FiatCurrencyCode.Ars,
      fiatCurrencyLabel: fiatCurrencyLabel(FiatCurrencyCode.Ars),
      paymentMethodCode: PaymentMethodCode.BankTransfer,
      paymentMethodLabel: paymentMethodLabel(PaymentMethodCode.BankTransfer),
      durationSecs: 86400,
      durationLabel: durationLabel(86400),
      status: 'AwaitingFiller',
      createdAt: new Date(),
      createdBy: '0xABCD...EF01',
      reputation_score: 23,
    },
    {
      id: 'order_4',
      orderId: BigInt(4),
      type: 'buy',
      amount: 75,
      rate: 948,
      fiatCurrencyCode: FiatCurrencyCode.Ars,
      fiatCurrencyLabel: fiatCurrencyLabel(FiatCurrencyCode.Ars),
      paymentMethodCode: PaymentMethodCode.MobileWallet,
      paymentMethodLabel: paymentMethodLabel(PaymentMethodCode.MobileWallet),
      durationSecs: 604800,
      durationLabel: durationLabel(604800),
      status: 'AwaitingFiller',
      createdAt: new Date(),
      createdBy: '0x5555...6666',
      reputation_score: 89,
    },
  ],
  
  connectWallet: (walletAddress, walletOwner = null, walletStatus = 'logged-in') => {
    set((state) => ({
      user: {
        ...state.user,
        walletAddress,
        walletOwner,
        walletStatus,
        isConnected: true,
        reputation_score: state.user.reputation_score ?? 12,
      },
    }));
  },

  setWalletStatus: (walletStatus) => {
    set((state) => ({
      user: {
        ...state.user,
        walletStatus,
      },
    }));
  },
  
  disconnectWallet: () => {
    set((state) => ({
      user: {
        ...state.user,
        walletAddress: null,
        walletOwner: null,
        walletStatus: 'logged-out',
        isConnected: false,
        balance: {
          usd: 0,
          usdc: 0,
        },
      },
    }));
  },

  setBalance: (usdc) => {
    const normalized = Math.max(0, Math.round(usdc * 100) / 100);

    set((state) => ({
      user: {
        ...state.user,
        balance: {
          usd: normalized,
          usdc: normalized,
        },
      },
    }));
  },

  addBalance: (amount) => {
    set((state) => {
      const next = Math.max(0, Math.round((state.user.balance.usdc + amount) * 100) / 100);

      return {
        user: {
          ...state.user,
          balance: {
            usd: next,
            usdc: next,
          },
        },
      };
    });
  },

  subtractBalance: (amount) => {
    let success = false;

    set((state) => {
      if (state.user.balance.usdc < amount) {
        return state;
      }

      success = true;
      const next = Math.max(0, Math.round((state.user.balance.usdc - amount) * 100) / 100);

      return {
        user: {
          ...state.user,
          balance: {
            usd: next,
            usdc: next,
          },
        },
      };
    });

    return success;
  },

  createOrder: (input: CreateOrderInput) => {
    set((state) => ({
      orders: [
        ...state.orders,
        {
          id: `${Date.now()}`,
          orderId: BigInt(Date.now()),
          ...input,
          fiatCurrencyLabel: fiatCurrencyLabel(input.fiatCurrencyCode),
          paymentMethodLabel: paymentMethodLabel(input.paymentMethodCode),
          durationLabel: durationLabel(input.durationSecs),
          status: 'AwaitingFiller',
          createdAt: new Date(),
          createdBy: state.user.walletAddress ?? 'wallet-not-connected',
          reputation_score: state.user.reputation_score ?? 12,
        },
      ],
    }));
  },

  updateOrderStatus: (orderId: string, status: P2POrderStatus) => {
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId ? { ...order, status } : order
      ),
    }));
  },
}));
