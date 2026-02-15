'use client';

import { useTradeHistory } from '@/contexts/TradeHistoryContext';
import BalanceCard from '@/components/BalanceCard';
import QuickActions from '@/components/QuickActions';
import HowItWorks from '@/components/HowItWorks';
import RecentTransactions from '@/components/RecentTransactions';

export default function RootPage() {
  const { trades } = useTradeHistory();

  const hasCompletedTrades = trades.length > 0;

  return (
    <>
      <BalanceCard />
      <QuickActions />
      {!hasCompletedTrades && <HowItWorks />}
      <RecentTransactions />
    </>
  );
}
