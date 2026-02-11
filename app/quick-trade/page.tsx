'use client';

import { useMemo } from 'react';
import { useTradeHistory } from '@/contexts/TradeHistoryContext';
import BalanceCard from '@/components/BalanceCard';
import QuickActions from '@/components/QuickActions';
import HowItWorks from '@/components/HowItWorks';
import RecentActivity from '@/components/RecentActivity';

export default function QuickTradePage() {
  const { trades } = useTradeHistory();

  const hasCompletedTrades = trades.length > 0;

  const activityStats = useMemo(() => {
    if (trades.length === 0) return { weeklyTrades: 0, totalConverted: 0, avgPerTrade: 0 };
    const totalArs = trades.reduce((sum, t) => sum + t.arsReceived, 0);
    const totalUsdc = trades.reduce((sum, t) => sum + t.amount, 0);
    return {
      weeklyTrades: trades.length,
      totalConverted: totalArs,
      avgPerTrade: Math.round(totalUsdc / trades.length),
    };
  }, [trades]);

  return (
    <>
      <BalanceCard />
      <QuickActions />
      {hasCompletedTrades ? (
        <RecentActivity
          weeklyTrades={activityStats.weeklyTrades}
          totalConverted={activityStats.totalConverted}
          avgPerTrade={activityStats.avgPerTrade}
        />
      ) : (
        <HowItWorks />
      )}
    </>
  );
}
