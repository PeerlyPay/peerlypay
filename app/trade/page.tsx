'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import QuickTradeInput from '@/components/QuickTradeInput';

export default function TradePage() {
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

  return <QuickTradeInput />;
}
