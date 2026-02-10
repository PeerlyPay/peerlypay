'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import Header from '@/components/Header';
import BalanceCard from '@/components/BalanceCard';
import { BottomNav } from '@/components/BottomNav';

export default function QuickTradePage() {
  const router = useRouter();
  const { user, loading } = useUser();

  // Protección: solo freelancers
  if (!loading && (!user || user.role !== 'FREELANCER')) {
    router.push('/');
    return null;
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <Header />
      
      <main className="max-w-[480px] mx-auto px-4 pt-20 pb-24">
        <BalanceCard />
        
        {/* Placeholder para QuickTradeInput */}
        <div className="mt-8 p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-center mb-4">Quick Trade</h2>
          <p className="text-center text-gray-600">
            El componente QuickTradeInput irá aquí
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}