import { StellarWallet } from '@crossmint/client-sdk-react-ui';
import { createOrderInputToContractArgs } from '@/lib/order-mapper';
import type { CreateOrderInput } from '@/types';

const DEFAULT_P2P_CONTRACT_ID = 'CA6I2J5MTYR525JMGMPRXAFNDBNWPRNB6GFWIW2S5VR6JD6QILJ53Q2V';
type CrossmintWalletLike = unknown;

function resolveContractId(): string {
  return process.env.NEXT_PUBLIC_P2P_CONTRACT_ID?.trim() || DEFAULT_P2P_CONTRACT_ID;
}

function normalizeOrderId(orderId: string | number | bigint): string {
  if (typeof orderId === 'bigint') {
    return orderId.toString();
  }

  return String(orderId).trim();
}

const TOKEN_SCALE = 10_000_000;

function usdcToContractAmount(value: number): string {
  return BigInt(Math.round(value * TOKEN_SCALE)).toString();
}

export async function takeOrderWithCrossmint(params: {
  wallet: CrossmintWalletLike | null | undefined;
  caller: string;
  orderId: string | number | bigint;
  fillAmount: number;
}) {
  const { wallet, caller, orderId, fillAmount } = params;

  if (!wallet) {
    throw new Error('Wallet is not connected');
  }

  const stellarWallet = StellarWallet.from(wallet as never);
  return stellarWallet.sendTransaction({
    contractId: resolveContractId(),
    method: 'take_order_with_amount',
    args: {
      caller,
      order_id: normalizeOrderId(orderId),
      fill_amount: usdcToContractAmount(fillAmount),
    },
  });
}

export async function submitFiatPaymentWithCrossmint(params: {
  wallet: CrossmintWalletLike | null | undefined;
  caller: string;
  orderId: string | number | bigint;
}) {
  const { wallet, caller, orderId } = params;

  if (!wallet) {
    throw new Error('Wallet is not connected');
  }

  const stellarWallet = StellarWallet.from(wallet as never);
  return stellarWallet.sendTransaction({
    contractId: resolveContractId(),
    method: 'submit_fiat_payment',
    args: {
      caller,
      order_id: normalizeOrderId(orderId),
    },
  });
}

export async function confirmFiatPaymentWithCrossmint(params: {
  wallet: CrossmintWalletLike | null | undefined;
  caller: string;
  orderId: string | number | bigint;
}) {
  const { wallet, caller, orderId } = params;

  if (!wallet) {
    throw new Error('Wallet is not connected');
  }

  const stellarWallet = StellarWallet.from(wallet as never);
  return stellarWallet.sendTransaction({
    contractId: resolveContractId(),
    method: 'confirm_fiat_payment',
    args: {
      caller,
      order_id: normalizeOrderId(orderId),
    },
  });
}

export async function createOrderWithCrossmint(params: {
  wallet: CrossmintWalletLike | null | undefined;
  caller: string;
  input: CreateOrderInput;
}) {
  const { wallet, caller, input } = params;

  if (!wallet) {
    throw new Error('Wallet is not connected');
  }

  const contractArgs = createOrderInputToContractArgs(input);
  const stellarWallet = StellarWallet.from(wallet as never);

  return stellarWallet.sendTransaction({
    contractId: resolveContractId(),
    method: 'create_order_cli',
    args: {
      caller,
      fiat_currency_code: contractArgs.fiat_currency_code,
      payment_method_code: contractArgs.payment_method_code,
      from_crypto: contractArgs.from_crypto,
      amount: contractArgs.amount.toString(),
      exchange_rate: contractArgs.exchange_rate.toString(),
      duration_secs: String(contractArgs.duration_secs),
    },
  });
}
