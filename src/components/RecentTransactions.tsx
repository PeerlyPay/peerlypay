'use client';

import Link from 'next/link';
import { CircleDollarSign } from 'lucide-react';
import { useTradeHistory, CompletedTrade } from '@/contexts/TradeHistoryContext';

type TransactionType = 'sale' | 'purchase' | 'withdrawal';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });
}

function formatAmount(amount: number, currency: string): string {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' ' + currency;
}

function mapTrade(trade: CompletedTrade) {
  // Current flow: user sells USDC → receives ARS
  const type: TransactionType = 'sale';
  return {
    id: trade.id,
    type,
    title: 'USDC Sale',
    displayAmount: `-${formatAmount(trade.amount, 'USDC')}`,
    isPositive: false,
    date: formatDate(trade.date),
  };
}

export default function RecentTransactions() {
  const { trades, loading } = useTradeHistory();

  const transactions = trades.slice(0, 3).map(mapTrade);
  const isEmpty = transactions.length === 0;

  if (loading) return null;

  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.5px] text-gray-500">
          Recent Activity
        </h3>
        {!isEmpty && (
          <Link
            href="/orders"
            className="text-xs font-medium text-magenta-500 hover:text-magenta-600 transition-colors"
          >
            View all →
          </Link>
        )}
      </div>

      {isEmpty ? (
        <div className="rounded-xl border border-gray-200 bg-white px-5 py-8 text-center">
          <p className="text-sm font-medium text-gray-700">No recent activity</p>
          <p className="mt-1 text-xs text-gray-400">
            Make your first trade to see it here
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <CircleDollarSign className="h-5 w-5 shrink-0 text-primary-500" aria-hidden />
                <div>
                  <p className="text-sm font-medium text-gray-900">{tx.title}</p>
                  <p className="text-xs text-gray-400">{tx.date}</p>
                </div>
              </div>
              <span className="font-[family-name:var(--font-jetbrains-mono)] text-sm font-semibold text-gray-900 tabular-nums">
                {tx.displayAmount}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
