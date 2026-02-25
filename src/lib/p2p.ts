import {
  Client,
  networks,
  type FiatCurrency,
  type Order as ContractOrder,
  type OrderStatus,
  type PaymentMethod,
} from '@/contracts/p2p/src';
import { chainToUiOrder } from '@/lib/order-mapper';
import type { ChainOrder, P2POrderStatus, UiOrder } from '@/types';

// Network configuration and client bootstrap
const DEFAULT_RPC_URL = 'https://soroban-testnet.stellar.org';
const DEFAULT_PASSPHRASE = 'Test SDF Network ; September 2015';

const client = new Client({
  ...networks.testnet,
  contractId: process.env.NEXT_PUBLIC_P2P_CONTRACT_ID?.trim() || networks.testnet.contractId,
  rpcUrl: process.env.NEXT_PUBLIC_SOROBAN_RPC_URL?.trim() || DEFAULT_RPC_URL,
  networkPassphrase:
    process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE?.trim() || DEFAULT_PASSPHRASE,
});

// Contract result normalization helpers
function unwrapResult<T>(value: unknown): T {
  if (value === undefined) {
    throw new Error('Missing contract result');
  }

  if (value && typeof value === 'object') {
    const resultLike = value as {
      unwrap?: () => unknown;
      isErr?: () => boolean;
      unwrapErr?: () => unknown;
      error?: unknown;
    };

    if (typeof resultLike.unwrap === 'function') {
      if (typeof resultLike.isErr === 'function' && resultLike.isErr()) {
        throw new Error(`Contract read failed: ${String(resultLike.unwrapErr?.() ?? resultLike.error)}`);
      }

      return resultLike.unwrap() as T;
    }

    if ('ok' in value) {
      return (value as { ok: T }).ok;
    }

    if ('error' in value) {
      throw new Error(`Contract read failed: ${String((value as { error: unknown }).error)}`);
    }
  }

  return value as T;
}

// Primitive conversion helpers
function toBigInt(value: unknown): bigint {
  if (typeof value === 'bigint') return value;
  if (typeof value === 'number') return BigInt(Math.trunc(value));
  if (typeof value === 'string') return BigInt(value);
  throw new Error(`Unsupported numeric value: ${String(value)}`);
}

function toOptionalNumber(value: unknown): number | undefined {
  if (value === null || value === undefined) return undefined;
  return Number(toBigInt(value));
}

function toOptionalAddress(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

// Contract enum to frontend code mapping
function fiatCurrencyCode(value: FiatCurrency): number {
  switch (value.tag) {
    case 'Usd':
      return 0;
    case 'Eur':
      return 1;
    case 'Ars':
      return 2;
    case 'Cop':
      return 3;
    case 'Gbp':
      return 4;
    case 'Other':
      return Number(value.values[0]);
  }
}

function paymentMethodCode(value: PaymentMethod): number {
  switch (value.tag) {
    case 'BankTransfer':
      return 0;
    case 'MobileWallet':
      return 1;
    case 'Cash':
      return 2;
    case 'Other':
      return Number(value.values[0]);
  }
}

function orderStatus(value: OrderStatus): P2POrderStatus {
  return value.tag;
}

// Contract model to app model mapping
function toChainOrder(order: ContractOrder): ChainOrder {
  return {
    order_id: toBigInt(order.order_id),
    creator: order.creator,
    filler: toOptionalAddress(order.filler),
    amount: toBigInt(order.amount),
    remaining_amount: toBigInt(order.remaining_amount),
    filled_amount: toBigInt(order.filled_amount),
    active_fill_amount:
      order.active_fill_amount === null || order.active_fill_amount === undefined
        ? undefined
        : toBigInt(order.active_fill_amount),
    exchange_rate: toBigInt(order.exchange_rate),
    from_crypto: order.from_crypto,
    fiat_currency_code: fiatCurrencyCode(order.fiat_currency),
    payment_method_code: paymentMethodCode(order.payment_method),
    status: orderStatus(order.status),
    created_at: Number(toBigInt(order.created_at)),
    deadline: Number(toBigInt(order.deadline)),
    fiat_transfer_deadline: toOptionalNumber(order.fiat_transfer_deadline),
  };
}

// Public read API
export async function loadChainOrdersFromContract(): Promise<ChainOrder[]> {
  const countTx = await client.get_order_count();
  const count = Number(toBigInt(unwrapResult(countTx.result)));

  console.info('[p2p] order_count', { count });

  if (!Number.isFinite(count) || count <= 0) {
    console.warn('[p2p] no readable orders', { count });
    return [];
  }

  const reads = Array.from({ length: count }, (_, orderId) => orderId).map(async (orderId) => {
    try {
      const tx = await client.get_order({ order_id: BigInt(orderId) });
      return toChainOrder(unwrapResult(tx.result));
    } catch (error) {
      console.warn('[p2p] skipping order read', { orderId, error });
      return null;
    }
  });

  const orders = (await Promise.all(reads)).filter((order): order is ChainOrder => order !== null);
  console.info('[p2p] loaded orders', { requested: count, loaded: orders.length });
  return orders.sort((a, b) => Number(b.order_id - a.order_id));
}

export async function loadChainOrderByIdFromContract(orderId: string | number | bigint): Promise<ChainOrder> {
  const normalized = typeof orderId === 'bigint' ? orderId : BigInt(String(orderId));
  const tx = await client.get_order({ order_id: normalized });
  return toChainOrder(unwrapResult(tx.result));
}

// UI-friendly projection API
export async function loadOrdersFromContract(): Promise<UiOrder[]> {
  const orders = await loadChainOrdersFromContract();
  return orders.map((order) => chainToUiOrder(order));
}
