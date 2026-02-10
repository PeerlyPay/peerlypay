import { describe, it, expect } from 'vitest';
import { findBestMatch, estimateQuickTrade, scoreOrder } from '@/lib/match-order';
import type { Order } from '@/types';

// ============================================
// TEST FIXTURES
// ============================================

function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'order_test',
    type: 'sell',
    amount: 100,
    rate: 950,
    currency: 'ARS',
    paymentMethod: 'Bank Transfer',
    duration: '30 minutes',
    status: 'open',
    createdAt: new Date(),
    createdBy: 'SELLER_A',
    reputation_score: 50,
    completionRate: 98,
    ...overrides,
  };
}

const MOCK_ORDERS: Order[] = [
  makeOrder({
    id: 'sell_cheap',
    type: 'sell',
    amount: 200,
    rate: 940,
    createdBy: 'SELLER_A',
    reputation_score: 30,
    completionRate: 95,
  }),
  makeOrder({
    id: 'sell_mid',
    type: 'sell',
    amount: 150,
    rate: 950,
    createdBy: 'SELLER_B',
    reputation_score: 80,
    completionRate: 99,
  }),
  makeOrder({
    id: 'sell_expensive',
    type: 'sell',
    amount: 500,
    rate: 960,
    createdBy: 'SELLER_C',
    reputation_score: 100,
    completionRate: 100,
  }),
  makeOrder({
    id: 'buy_high',
    type: 'buy',
    amount: 200,
    rate: 945,
    createdBy: 'BUYER_A',
    reputation_score: 60,
    completionRate: 97,
  }),
  makeOrder({
    id: 'buy_low',
    type: 'buy',
    amount: 100,
    rate: 930,
    createdBy: 'BUYER_B',
    reputation_score: 40,
    completionRate: 90,
  }),
];

// ============================================
// findBestMatch
// ============================================

describe('findBestMatch', () => {
  it('matches a BUY request with the cheapest SELL order', () => {
    const result = findBestMatch(MOCK_ORDERS, 100, 'buy', 'USER_1');
    expect(result).not.toBeNull();
    expect(result!.matchedOrder.id).toBe('sell_cheap');
    expect(result!.rate).toBe(940);
  });

  it('matches a SELL request with the highest-rate BUY order', () => {
    const result = findBestMatch(MOCK_ORDERS, 50, 'sell', 'USER_1');
    expect(result).not.toBeNull();
    expect(result!.matchedOrder.id).toBe('buy_high');
    expect(result!.rate).toBe(945);
  });

  it('returns null when no orders match', () => {
    const result = findBestMatch(MOCK_ORDERS, 1000, 'buy', 'USER_1');
    expect(result).toBeNull();
  });

  it('excludes the requesting user\'s own orders', () => {
    const result = findBestMatch(MOCK_ORDERS, 100, 'buy', 'SELLER_A');
    expect(result).not.toBeNull();
    // Should skip SELLER_A's order (cheapest) and pick SELLER_B
    expect(result!.matchedOrder.id).toBe('sell_mid');
  });

  it('filters out orders with insufficient liquidity', () => {
    const result = findBestMatch(MOCK_ORDERS, 180, 'buy', 'USER_1');
    expect(result).not.toBeNull();
    // sell_cheap has 200 (enough), sell_mid has 150 (not enough for 180)
    expect(result!.matchedOrder.id).toBe('sell_cheap');
  });

  it('ignores non-open orders', () => {
    const ordersWithClosed = [
      ...MOCK_ORDERS,
      makeOrder({
        id: 'sell_closed',
        type: 'sell',
        amount: 1000,
        rate: 900, // best rate but closed
        status: 'completed',
        createdBy: 'SELLER_D',
      }),
    ];
    const result = findBestMatch(ordersWithClosed, 100, 'buy', 'USER_1');
    expect(result!.matchedOrder.id).toBe('sell_cheap'); // not sell_closed
  });

  it('breaks rate ties by reputation score', () => {
    const tiedOrders = [
      makeOrder({
        id: 'tied_low_rep',
        type: 'sell',
        amount: 100,
        rate: 950,
        createdBy: 'SELLER_X',
        reputation_score: 10,
      }),
      makeOrder({
        id: 'tied_high_rep',
        type: 'sell',
        amount: 100,
        rate: 950,
        createdBy: 'SELLER_Y',
        reputation_score: 90,
      }),
    ];
    const result = findBestMatch(tiedOrders, 50, 'buy', 'USER_1');
    expect(result!.matchedOrder.id).toBe('tied_high_rep');
  });

  it('calculates fee correctly (0.5%)', () => {
    const result = findBestMatch(MOCK_ORDERS, 100, 'buy', 'USER_1');
    expect(result).not.toBeNull();
    const expectedFiat = 100 * 940;
    const expectedFee = expectedFiat * 0.005;
    expect(result!.fee).toBe(expectedFee);
    expect(result!.estimatedAmount).toBe(expectedFiat);
    // BUY: total = fiat + fee
    expect(result!.total).toBe(expectedFiat + expectedFee);
  });

  it('calculates SELL total correctly (fiat - fee)', () => {
    const result = findBestMatch(MOCK_ORDERS, 50, 'sell', 'USER_1');
    expect(result).not.toBeNull();
    const expectedFiat = 50 * 945;
    const expectedFee = expectedFiat * 0.005;
    // SELL: total = fiat - fee
    expect(result!.total).toBe(expectedFiat - expectedFee);
  });

  it('populates maker info from the matched order', () => {
    const ordersWithDetails = [
      makeOrder({
        id: 'detailed',
        type: 'sell',
        amount: 100,
        rate: 950,
        createdBy: 'SELLER_DETAILED',
        displayName: 'CryptoMarta',
        isVerified: true,
        reputation_score: 47,
        completionRate: 98,
      }),
    ];
    const result = findBestMatch(ordersWithDetails, 50, 'buy', 'USER_1');
    expect(result!.maker.displayName).toBe('CryptoMarta');
    expect(result!.maker.isVerified).toBe(true);
    expect(result!.maker.reputation_score).toBe(47);
    expect(result!.maker.completionRate).toBe(98);
  });
});

// ============================================
// estimateQuickTrade
// ============================================

describe('estimateQuickTrade', () => {
  it('returns best rate estimate for a BUY', () => {
    const est = estimateQuickTrade(MOCK_ORDERS, 50, 'buy');
    expect(est).not.toBeNull();
    expect(est!.rate).toBe(940); // cheapest sell order
    expect(est!.fiatAmount).toBe(50 * 940);
  });

  it('returns best rate estimate for a SELL', () => {
    const est = estimateQuickTrade(MOCK_ORDERS, 50, 'sell');
    expect(est).not.toBeNull();
    expect(est!.rate).toBe(945); // highest buy order
  });

  it('returns null when no matching orders', () => {
    const est = estimateQuickTrade(MOCK_ORDERS, 9999, 'buy');
    expect(est).toBeNull();
  });

  it('includes fee in total', () => {
    const est = estimateQuickTrade(MOCK_ORDERS, 100, 'buy');
    expect(est!.fee).toBe(100 * 940 * 0.005);
    // BUY: total = fiat + fee
    expect(est!.total).toBe(est!.fiatAmount + est!.fee);
  });

  it('returns the currency from the matched order', () => {
    const est = estimateQuickTrade(MOCK_ORDERS, 50, 'buy');
    expect(est!.currency).toBe('ARS');
  });
});

// ============================================
// scoreOrder
// ============================================

describe('scoreOrder', () => {
  it('returns higher scores for higher reputation', () => {
    const lowRep = makeOrder({ reputation_score: 10, completionRate: 90 });
    const highRep = makeOrder({ reputation_score: 90, completionRate: 90 });
    expect(scoreOrder(highRep, 'buy')).toBeGreaterThan(scoreOrder(lowRep, 'buy'));
  });

  it('returns higher scores for higher completion rate', () => {
    const lowComp = makeOrder({ reputation_score: 50, completionRate: 70 });
    const highComp = makeOrder({ reputation_score: 50, completionRate: 100 });
    expect(scoreOrder(highComp, 'buy')).toBeGreaterThan(scoreOrder(lowComp, 'buy'));
  });

  it('caps reputation at 100', () => {
    const normal = makeOrder({ reputation_score: 100, completionRate: 100 });
    const over = makeOrder({ reputation_score: 200, completionRate: 100 });
    expect(scoreOrder(normal, 'buy')).toBe(scoreOrder(over, 'buy'));
  });

  it('handles missing reputation gracefully', () => {
    const noRep = makeOrder({ reputation_score: undefined, completionRate: 100 });
    const score = scoreOrder(noRep, 'buy');
    expect(score).toBeGreaterThanOrEqual(0);
  });
});
