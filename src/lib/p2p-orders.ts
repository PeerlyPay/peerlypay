import type { FiatCurrency, Order as ContractOrder, OrderStatus, PaymentMethod } from '@/contracts/p2p/src';
import type { ChainOrder, P2POrderStatus, UiOrder } from '@/types';
import { chainToUiOrder } from '@/lib/order-mapper';
import { getP2pClient } from '@/lib/p2p-client';

function toBigIntValue(value: unknown): bigint {
  if (typeof value === 'bigint') {
    return value;
  }

  if (typeof value === 'number') {
    return BigInt(Math.trunc(value));
  }

  if (typeof value === 'string') {
    return BigInt(value);
  }

  throw new Error(`Unsupported numeric value: ${String(value)}`);
}

function toNumberValue(value: unknown): number {
  return Number(toBigIntValue(value));
}

function extractResult<T>(assembled: { result?: T }): T {
  if (assembled.result === undefined) {
    throw new Error('Missing simulated result');
  }

  return assembled.result;
}

function unwrapContractResult<T>(result: unknown): T {
  const toMessage = (value: unknown): string => {
    if (typeof value === 'string') {
      return value;
    }

    if (value instanceof Error) {
      return value.message;
    }

    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  };

  if (result && typeof result === 'object') {
    const maybeResult = result as {
      isOk?: () => boolean;
      isErr?: () => boolean;
      unwrap?: () => unknown;
      unwrapErr?: () => unknown;
      value?: unknown;
      error?: unknown;
    };

    if (typeof maybeResult.unwrap === 'function') {
      if (typeof maybeResult.isErr === 'function' && maybeResult.isErr()) {
        const err =
          typeof maybeResult.unwrapErr === 'function'
            ? maybeResult.unwrapErr()
            : maybeResult.error;
        throw new Error(`Contract read failed: ${toMessage(err)}`);
      }

      return maybeResult.unwrap() as T;
    }
  }

  if (result && typeof result === 'object') {
    if ('ok' in result) {
      return (result as { ok: T }).ok;
    }

    if ('error' in result) {
      throw new Error(`Contract read failed: ${toMessage((result as { error: unknown }).error)}`);
    }
  }

  return result as T;
}

function unwrapOptionAddress(value: unknown): string | undefined {
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }

  return undefined;
}

function unwrapOptionNumber(value: unknown): number | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  return toNumberValue(value);
}

function mapFiatCurrencyToCode(value: FiatCurrency): number {
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

function mapPaymentMethodToCode(value: PaymentMethod): number {
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

function mapOrderStatus(value: OrderStatus): P2POrderStatus {
  return value.tag;
}

function contractOrderToChainOrder(order: ContractOrder): ChainOrder {
  return {
    order_id: toBigIntValue(order.order_id),
    creator: order.creator,
    filler: unwrapOptionAddress(order.filler),
    amount: toBigIntValue(order.amount),
    exchange_rate: toBigIntValue(order.exchange_rate),
    from_crypto: order.from_crypto,
    fiat_currency_code: mapFiatCurrencyToCode(order.fiat_currency),
    payment_method_code: mapPaymentMethodToCode(order.payment_method),
    status: mapOrderStatus(order.status),
    created_at: toNumberValue(order.created_at),
    deadline: toNumberValue(order.deadline),
    fiat_transfer_deadline: unwrapOptionNumber(order.fiat_transfer_deadline),
  };
}

export async function loadOrdersFromContract(): Promise<UiOrder[]> {
  const chainOrders = await loadChainOrdersFromContract();
  return chainOrders.map((order) => chainToUiOrder(order));
}

export async function loadChainOrdersFromContract(): Promise<ChainOrder[]> {
  const client = getP2pClient();
  const countTx = await client.get_order_count();
  const rawCount = unwrapContractResult<unknown>(extractResult(countTx));
  const orderCount = Number(rawCount);

  console.info('[p2p-orders] get_order_count result', {
    rawCount,
    orderCount,
  });

  if (!Number.isFinite(orderCount) || orderCount <= 0) {
    console.warn('[p2p-orders] No readable orders from count', {
      rawCount,
      orderCount,
    });
    return [];
  }

  const reads = Array.from({ length: orderCount }, (_, index) => index).map(async (orderId) => {
    try {
      const tx = await client.get_order({ order_id: BigInt(orderId) });
      const contractOrder = unwrapContractResult<ContractOrder>(extractResult(tx));
      return contractOrderToChainOrder(contractOrder);
    } catch (error) {
      console.warn('[p2p-orders] Skipping order: unable to decode/read', {
        orderId,
        error,
      });
      return null;
    }
  });

  const orders = (await Promise.all(reads)).filter((order): order is ChainOrder => order !== null);

  console.info('[p2p-orders] Loaded chain orders', {
    requested: orderCount,
    loaded: orders.length,
  });

  return orders.sort((a, b) => Number(b.order_id - a.order_id));
}
