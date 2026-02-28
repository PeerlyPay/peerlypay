import type { MatchOrderResult, MatchedMaker, Order, OrderType } from "@/types";

/** Platform fee percentage (0.5%) */
const FEE_RATE = 0.005;
const ORDER_EXPIRY_BUFFER_MS = 120_000;

function isOrderAvailableForMatch(order: Order): boolean {
  const createdAtMs =
    order.createdAt instanceof Date
      ? order.createdAt.getTime()
      : new Date(order.createdAt).getTime();

  if (!Number.isFinite(createdAtMs) || order.durationSecs <= 0) {
    return false;
  }

  const expiresAtMs = createdAtMs + order.durationSecs * 1000;
  return expiresAtMs - Date.now() > ORDER_EXPIRY_BUFFER_MS;
}

function orderCreatedAtMs(order: Order): number {
  const value =
    order.createdAt instanceof Date
      ? order.createdAt.getTime()
      : new Date(order.createdAt).getTime();

  return Number.isFinite(value) ? value : 0;
}

function getMatchCandidates(
  orders: Order[],
  amount: number,
  userType: OrderType,
  userId?: string,
): Order[] {
  const oppositeType: OrderType = userType === "buy" ? "sell" : "buy";

  return orders.filter((order) => {
    const availableAmount = order.remainingAmount ?? order.amount;

    if (order.type !== oppositeType) return false;
    if (order.status !== "AwaitingFiller") return false;
    if (!isOrderAvailableForMatch(order)) return false;
    if (availableAmount < amount) return false;
    if ((order.activeFillAmount ?? 0) > 0) return false;
    if (userId && order.createdBy === userId) return false;

    return true;
  });
}

function sortByBestRateThenNewest(candidates: Order[], userType: OrderType): Order[] {
  return [...candidates].sort((a, b) => {
    if (a.rate !== b.rate) {
      return userType === "buy" ? a.rate - b.rate : b.rate - a.rate;
    }

    return orderCreatedAtMs(b) - orderCreatedAtMs(a);
  });
}

/**
 * Find the best matching order for a given trade request.
 *
 * Rules:
 * 1. Must be opposite side and open for fills.
 * 2. Must cover the full requested amount.
 * 3. Best rate wins.
 * 4. If rate ties, newest order wins.
 */
export function findBestMatch(
  orders: Order[],
  amount: number,
  userType: OrderType,
  userId: string,
): MatchOrderResult | null {
  const candidates = getMatchCandidates(orders, amount, userType, userId);
  if (candidates.length === 0) return null;

  const [best] = sortByBestRateThenNewest(candidates, userType);
  const fee = amount * best.rate * FEE_RATE;
  const fiatAmount = amount * best.rate;

  const maker: MatchedMaker = {
    address: best.createdBy,
    displayName: best.displayName,
    reputation_score: best.reputation_score ?? 0,
    completionRate: best.completionRate ?? 100,
    isVerified: best.isVerified ?? false,
    totalOrders: best.reputation_score ?? 0,
  };

  return {
    matchedOrder: best,
    fillAmount: amount,
    maker,
    estimatedAmount: fiatAmount,
    rate: best.rate,
    fee,
    total: userType === "buy" ? fiatAmount + fee : fiatAmount - fee,
  };
}

/**
 * Calculate a real-time estimate using the same matching criteria as findBestMatch.
 */
export function estimateQuickTrade(orders: Order[], amount: number, userType: OrderType) {
  const candidates = getMatchCandidates(orders, amount, userType);
  if (candidates.length === 0) return null;

  const [best] = sortByBestRateThenNewest(candidates, userType);
  const fiatAmount = amount * best.rate;
  const fee = fiatAmount * FEE_RATE;

  return {
    amount,
    rate: best.rate,
    fiatAmount,
    fee,
    total: userType === "buy" ? fiatAmount + fee : fiatAmount - fee,
    fiatCurrencyCode: best.fiatCurrencyCode,
  };
}
