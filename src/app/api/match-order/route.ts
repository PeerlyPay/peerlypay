import { NextRequest, NextResponse } from "next/server";
import { findBestMatch } from "@/lib/match-order";
import type { Order, MatchOrderInput } from "@/types";
import { FiatCurrencyCode, PaymentMethodCode } from "@/types";
import {
  durationLabel,
  fiatCurrencyLabel,
  paymentMethodLabel,
} from "@/lib/order-mapper";

/**
 * Mock order book — in production this comes from the Stellar ledger / database.
 * Using the same mock data as the Zustand store for consistency.
 */
const MOCK_ORDER_BOOK: Order[] = [
  {
    id: "order_1",
    orderId: BigInt(1),
    type: "sell",
    totalAmount: 100,
    remainingAmount: 100,
    filledAmount: 0,
    activeFillAmount: 0,
    amount: 100,
    rate: 1400,
    fiatCurrencyCode: FiatCurrencyCode.Ars,
    fiatCurrencyLabel: fiatCurrencyLabel(FiatCurrencyCode.Ars),
    paymentMethodCode: PaymentMethodCode.BankTransfer,
    paymentMethodLabel: paymentMethodLabel(PaymentMethodCode.BankTransfer),
    paymentMethodLabels: [
      paymentMethodLabel(PaymentMethodCode.BankTransfer),
      paymentMethodLabel(PaymentMethodCode.MobileWallet),
    ],
    durationSecs: 1800,
    durationLabel: durationLabel(1800),
    status: "AwaitingFiller",
    createdAt: new Date(),
    createdBy: "GBXK...7RQP",
    displayName: "CryptoMarta",
    isVerified: true,
    reputation_score: 47,
    completionRate: 98,
  },
  {
    id: "order_2",
    orderId: BigInt(2),
    type: "sell",
    totalAmount: 500,
    remainingAmount: 500,
    filledAmount: 0,
    activeFillAmount: 0,
    amount: 500,
    rate: 945,
    fiatCurrencyCode: FiatCurrencyCode.Ars,
    fiatCurrencyLabel: fiatCurrencyLabel(FiatCurrencyCode.Ars),
    paymentMethodCode: PaymentMethodCode.MobileWallet,
    paymentMethodLabel: paymentMethodLabel(PaymentMethodCode.MobileWallet),
    paymentMethodLabels: [
      paymentMethodLabel(PaymentMethodCode.MobileWallet),
      "Brubank",
    ],
    durationSecs: 900,
    durationLabel: durationLabel(900),
    status: "AwaitingFiller",
    createdAt: new Date(),
    createdBy: "GCDE...4FGH",
    displayName: "FastTrader_AR",
    isVerified: true,
    reputation_score: 124,
    completionRate: 99,
  },
  {
    id: "order_3",
    orderId: BigInt(3),
    type: "sell",
    totalAmount: 50,
    remainingAmount: 50,
    filledAmount: 0,
    activeFillAmount: 0,
    amount: 50,
    rate: 955,
    fiatCurrencyCode: FiatCurrencyCode.Ars,
    fiatCurrencyLabel: fiatCurrencyLabel(FiatCurrencyCode.Ars),
    paymentMethodCode: PaymentMethodCode.MobileWallet,
    paymentMethodLabel: paymentMethodLabel(PaymentMethodCode.MobileWallet),
    durationSecs: 3600,
    durationLabel: durationLabel(3600),
    status: "AwaitingFiller",
    createdAt: new Date(),
    createdBy: "GHIJ...8KLM",
    reputation_score: 3,
    completionRate: 85,
  },
  {
    id: "order_4",
    orderId: BigInt(4),
    type: "buy",
    totalAmount: 200,
    remainingAmount: 200,
    filledAmount: 0,
    activeFillAmount: 0,
    amount: 200,
    rate: 940,
    fiatCurrencyCode: FiatCurrencyCode.Ars,
    fiatCurrencyLabel: fiatCurrencyLabel(FiatCurrencyCode.Ars),
    paymentMethodCode: PaymentMethodCode.BankTransfer,
    paymentMethodLabel: paymentMethodLabel(PaymentMethodCode.BankTransfer),
    paymentMethodLabels: [
      paymentMethodLabel(PaymentMethodCode.BankTransfer),
      "Wise",
    ],
    durationSecs: 1800,
    durationLabel: durationLabel(1800),
    status: "AwaitingFiller",
    createdAt: new Date(),
    createdBy: "GNOP...2QRS",
    displayName: "PesoKing",
    isVerified: true,
    reputation_score: 89,
    completionRate: 97,
  },
  {
    id: "order_5",
    orderId: BigInt(5),
    type: "buy",
    totalAmount: 75,
    remainingAmount: 75,
    filledAmount: 0,
    activeFillAmount: 0,
    amount: 75,
    rate: 935,
    fiatCurrencyCode: FiatCurrencyCode.Ars,
    fiatCurrencyLabel: fiatCurrencyLabel(FiatCurrencyCode.Ars),
    paymentMethodCode: PaymentMethodCode.MobileWallet,
    paymentMethodLabel: paymentMethodLabel(PaymentMethodCode.MobileWallet),
    durationSecs: 1800,
    durationLabel: durationLabel(1800),
    status: "AwaitingFiller",
    createdAt: new Date(),
    createdBy: "GTUV...6WXY",
    displayName: "ArgenSwap",
    reputation_score: 56,
    completionRate: 94,
  },
];

export async function POST(request: NextRequest) {
  try {
    const body: MatchOrderInput = await request.json();

    if (!body.amount || body.amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 },
      );
    }

    if (!["buy", "sell"].includes(body.type)) {
      return NextResponse.json(
        { error: 'Type must be "buy" or "sell"' },
        { status: 400 },
      );
    }

    if (!body.userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 },
      );
    }

    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 300));

    const result = findBestMatch(
      MOCK_ORDER_BOOK,
      body.amount,
      body.type,
      body.userId,
    );

    if (!result) {
      return NextResponse.json(
        { error: "No orders available for this amount" },
        { status: 404 },
      );
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}
