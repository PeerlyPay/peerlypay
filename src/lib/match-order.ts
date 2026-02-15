import type { Order, OrderType, MatchOrderResult, MatchedMaker } from '@/types';

/** Platform fee percentage (0.5%) */
const FEE_RATE = 0.005;
const ORDER_EXPIRY_BUFFER_MS = 120_000;
const PRICE_WEIGHT = 0.2;
const SIZE_WEIGHT = 0.8;

function isOrderAvailableForMatch(order: Order): boolean {
  const createdAtMs = order.createdAt instanceof Date ? order.createdAt.getTime() : Number.NaN;

  if (!Number.isFinite(createdAtMs) || order.durationSecs <= 0) {
    return false;
  }

  const expiresAtMs = createdAtMs + order.durationSecs * 1000;
  return expiresAtMs - Date.now() > ORDER_EXPIRY_BUFFER_MS;
}

/**
 * Score an order for matching quality.
 * Higher score = better match. Combines rate favorability with maker reputation.
 *
 * For BUY orders (user buying): lower rate is better → invert rate contribution
 * For SELL orders (user selling): higher rate is better → use rate directly
 */
export function scoreOrder(order: Order, userType: OrderType): number {
  const reputation = order.reputation_score ?? 0;
  const completionRate = order.completionRate ?? 100;

  // Normalize reputation (0-100 scale, cap at 100)
  const reputationScore = Math.min(reputation, 100) / 100;

  // Normalize completion rate (0-1)
  const completionScore = completionRate / 100;

  // Rate score: for buyers, lower rate = better; for sellers, higher rate = better
  // We use the rate as-is and let the sort handle direction
  const rateWeight = 0.5;
  const reputationWeight = 0.35;
  const completionWeight = 0.15;

  // For scoring, we normalize rate contribution relative to itself
  // The actual sorting by rate is handled in findBestMatch
  const compositeScore =
    reputationScore * reputationWeight + completionScore * completionWeight;

  return compositeScore;
}

/**
 * Find the best matching order for a given trade request.
 *
 * Algorithm:
 * 1. Filter orders of opposite type (if user buys, find sellers)
 * 2. Filter only open orders whose full size does not exceed requested amount
 * 3. Exclude orders from the requesting user
 * 4. Sort by best rate, then by reputation score
 * 5. Return the top match with fee calculation
 */
export function findBestMatch(
  orders: Order[],
  amount: number,
  userType: OrderType,
  userId: string
): MatchOrderResult | null {
  // Opposite type: if user wants to BUY, find SELL orders
  const oppositeType: OrderType = userType === 'buy' ? 'sell' : 'buy';

  const candidates = orders.filter((order) => {
    if (order.type !== oppositeType) return false;
    if (order.status !== 'AwaitingFiller') return false;
    if (!isOrderAvailableForMatch(order)) return false;
    if (order.amount > amount) return false;
    if (order.createdBy === userId) return false;
    return true;
  });

  if (candidates.length === 0) return null;

  const rates = candidates.map((order) => order.rate);
  const minRate = Math.min(...rates);
  const maxRate = Math.max(...rates);
  const rateSpan = maxRate - minRate;

  const rank = (order: Order) => {
    const priceScore = rateSpan === 0
      ? 1
      : userType === 'buy'
        ? (maxRate - order.rate) / rateSpan
        : (order.rate - minRate) / rateSpan;

    // Full-order fills only: closer order size to requested amount is better.
    // Candidates are already filtered to order.amount <= amount, so order.amount / amount
    // gives a 0..1 closeness score where 1 is an exact fill.
    const sizeScore = Math.max(0, Math.min(1, order.amount / amount));

    return PRICE_WEIGHT * priceScore + SIZE_WEIGHT * sizeScore;
  };

  // Sort by weighted score, then reputation as tie-breaker.
  candidates.sort((a, b) => {
    const scoreDiff = rank(b) - rank(a);

    if (scoreDiff !== 0) return scoreDiff;

    // Tiebreak: higher reputation wins
    return (b.reputation_score ?? 0) - (a.reputation_score ?? 0);
  });

  const best = candidates[0];
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
    maker,
    estimatedAmount: fiatAmount,
    rate: best.rate,
    fee,
    total: userType === 'buy' ? fiatAmount + fee : fiatAmount - fee,
  };
}

/**
 * Calculate a real-time estimate without matching to a specific order.
 * Uses the best available rate from the order book.
 */
export function estimateQuickTrade(
  orders: Order[],
  amount: number,
  userType: OrderType
) {
  const oppositeType: OrderType = userType === 'buy' ? 'sell' : 'buy';

  const available = orders.filter(
    (o) => o.type === oppositeType && o.status === 'AwaitingFiller' && o.amount <= amount && isOrderAvailableForMatch(o)
  );

  if (available.length === 0) return null;

  const rates = available.map((order) => order.rate);
  const minRate = Math.min(...rates);
  const maxRate = Math.max(...rates);
  const rateSpan = maxRate - minRate;

  const rank = (order: Order) => {
    const priceScore = rateSpan === 0
      ? 1
      : userType === 'buy'
        ? (maxRate - order.rate) / rateSpan
        : (order.rate - minRate) / rateSpan;

    const sizeScore = Math.max(0, Math.min(1, order.amount / amount));

    return PRICE_WEIGHT * priceScore + SIZE_WEIGHT * sizeScore;
  };

  available.sort((a, b) => rank(b) - rank(a));

  const bestRate = available[0].rate;
  const fiatAmount = amount * bestRate;
  const fee = fiatAmount * FEE_RATE;

  return {
    amount,
    rate: bestRate,
    fiatAmount,
    fee,
    total: userType === 'buy' ? fiatAmount + fee : fiatAmount - fee,
    fiatCurrencyCode: available[0].fiatCurrencyCode,
  };
}
