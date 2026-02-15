import { StellarWallet } from '@crossmint/client-sdk-react-ui';

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

export async function takeOrderWithCrossmint(params: {
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
    method: 'take_order',
    args: {
      caller,
      order_id: normalizeOrderId(orderId),
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
