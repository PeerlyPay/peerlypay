import { NextRequest, NextResponse } from 'next/server';
import { findBestMatch } from '@/lib/match-order';
import type { Order, MatchOrderInput } from '@/types';

/**
 * Mock order book — in production this comes from the Stellar ledger / database.
 * Using the same mock data as the Zustand store for consistency.
 */
const MOCK_ORDER_BOOK: Order[] = [
  {
    id: 'order_1',
    type: 'sell',
    amount: 100,
    rate: 950,
    currency: 'ARS',
    paymentMethod: 'Bank Transfer',
    paymentMethods: ['Bank Transfer', 'MercadoPago'],
    duration: '30 minutes',
    status: 'open',
    createdAt: new Date(),
    createdBy: 'GBXK...7RQP',
    displayName: 'CryptoMarta',
    isVerified: true,
    reputation_score: 47,
    completionRate: 98,
  },
  {
    id: 'order_2',
    type: 'sell',
    amount: 500,
    rate: 945,
    currency: 'ARS',
    paymentMethod: 'MercadoPago',
    paymentMethods: ['MercadoPago', 'Brubank'],
    duration: '15 minutes',
    status: 'open',
    createdAt: new Date(),
    createdBy: 'GCDE...4FGH',
    displayName: 'FastTrader_AR',
    isVerified: true,
    reputation_score: 124,
    completionRate: 99,
  },
  {
    id: 'order_3',
    type: 'sell',
    amount: 50,
    rate: 955,
    currency: 'ARS',
    paymentMethod: 'MercadoPago',
    duration: '1 hour',
    status: 'open',
    createdAt: new Date(),
    createdBy: 'GHIJ...8KLM',
    reputation_score: 3,
    completionRate: 85,
  },
  {
    id: 'order_4',
    type: 'buy',
    amount: 200,
    rate: 940,
    currency: 'ARS',
    paymentMethod: 'Bank Transfer',
    paymentMethods: ['Bank Transfer', 'Wise'],
    duration: '30 minutes',
    status: 'open',
    createdAt: new Date(),
    createdBy: 'GNOP...2QRS',
    displayName: 'PesoKing',
    isVerified: true,
    reputation_score: 89,
    completionRate: 97,
  },
  {
    id: 'order_5',
    type: 'buy',
    amount: 75,
    rate: 935,
    currency: 'ARS',
    paymentMethod: 'MercadoPago',
    duration: '30 minutes',
    status: 'open',
    createdAt: new Date(),
    createdBy: 'GTUV...6WXY',
    displayName: 'ArgenSwap',
    reputation_score: 56,
    completionRate: 94,
  },
];

export async function POST(request: NextRequest) {
  try {
    const body: MatchOrderInput = await request.json();

    if (!body.amount || body.amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    if (!['buy', 'sell'].includes(body.type)) {
      return NextResponse.json(
        { error: 'Type must be "buy" or "sell"' },
        { status: 400 }
      );
    }

    if (!body.userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 300));

    const result = findBestMatch(MOCK_ORDER_BOOK, body.amount, body.type, body.userId);

    if (!result) {
      return NextResponse.json(
        { error: 'No orders available for this amount' },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
