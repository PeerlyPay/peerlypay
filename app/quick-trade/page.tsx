'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import BalanceCard from '@/components/BalanceCard';
import QuickActions from '@/components/QuickActions';
import HowItWorks from '@/components/HowItWorks';
import RecentActivity from '@/components/RecentActivity';

// Mock: returns completed trades from localStorage (or empty array for new users)
function getCompletedTrades(): { amount: number; arsTotal: number; date: string }[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('peerlypay_completed_trades');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function QuickTradePage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [hasCompletedTrades, setHasCompletedTrades] = useState(false);
  const [activityStats, setActivityStats] = useState({
    weeklyTrades: 0,
    totalConverted: 0,
    avgPerTrade: 0,
  });

  useEffect(() => {
    const trades = getCompletedTrades();
    if (trades.length > 0) {
      setHasCompletedTrades(true);
      const totalArs = trades.reduce((sum, t) => sum + t.arsTotal, 0);
      const totalUsdc = trades.reduce((sum, t) => sum + t.amount, 0);
      setActivityStats({
        weeklyTrades: trades.length,
        totalConverted: totalArs,
        avgPerTrade: Math.round(totalUsdc / trades.length),
      });
    }
  }, []);

  // Protección: solo freelancers
  if (!loading && (!user || user.role !== 'FREELANCER')) {
    router.push('/');
    return null;
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20">Cargando...</div>;
  }

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
