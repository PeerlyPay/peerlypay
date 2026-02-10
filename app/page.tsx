'use client';

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useUser } from '@/contexts/UserContext';
import { RoleSelection } from '@/components/RoleSelection';
import Header from '@/components/Header';
import BalanceCard from '@/components/BalanceCard';
import QuickActions from '@/components/QuickActions';
import EmptyState from '@/components/EmptyState';
import { BottomNav } from '@/components/BottomNav';
import type { UserRole } from '@/types/user';

export default function Dashboard() {
  const router = useRouter();
  const { user, setUser, loading } = useUser();

  // Si el usuario ya tiene rol, redirigir a su página
  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'FREELANCER') {
        router.push('/quick-trade');
      } else if (user.role === 'MARKET_MAKER') {
        router.push('/pro');
      }
    }
  }, [user, loading, router]);

  // Manejar selección de rol
  const handleRoleSelected = (role: UserRole) => {
    const newUser = {
      id: crypto.randomUUID(),
      walletAddress: 'mock-wallet', // Temporal - después conectar Freighter
      role,
      createdAt: new Date(),
    };
    
    setUser(newUser);
    
    // Redirect según rol
    if (role === 'FREELANCER') {
      router.push('/quick-trade');
    } else {
      router.push('/pro');
    }
  };

  // Mostrar loading mientras carga
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  // Si no hay usuario, mostrar selección de rol
  if (!user) {
    return <RoleSelection onSelectRole={handleRoleSelected} />;
  }

  // Si llegó acá, mostrar el dashboard por defecto
  // (aunque debería redirigir en el useEffect)
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-[480px] mx-auto px-4 pt-20 pb-24">
        <BalanceCard />
        <QuickActions />

        <section>
          <div className="flex justify-between items-center mb-4 mt-8">
            <h2 className="text-h3 text-black">Open Orders</h2>
            <button
              type="button"
              onClick={() => router.push('/orders')}
              className="text-magenta-500 text-sm font-semibold hover:text-magenta-600"
            >
              View All
            </button>
          </div>
          <EmptyState
            icon={
              <Image 
                src="/illustrations/empty-marketplace.png"
                alt="Empty marketplace" 
                width={200} 
                height={200}
                className="mx-auto"
              />
            }
            title="No open orders found"
            actionText="Create your first order"
            onAction={() => router.push('/create-order')}
          />
        </section>
      </main>

      <BottomNav />
    </div>
  );
}