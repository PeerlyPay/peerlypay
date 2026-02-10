'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import BalanceCard from '@/components/BalanceCard';

export default function QuickTradePage() {
  const router = useRouter();
  const { user, loading } = useUser();

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

      {/* Placeholder para QuickTradeInput */}
      <div className="mt-8 p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-center mb-4">Quick Trade</h2>
        <p className="text-center text-gray-600">
          El componente QuickTradeInput irá aquí
        </p>
      </div>
    </>
  );
}