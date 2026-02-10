'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useUser } from '@/contexts/UserContext';
import { RoleSelection } from '@/components/RoleSelection';
import BalanceCard from '@/components/BalanceCard';
import QuickActions from '@/components/QuickActions';
import EmptyState from '@/components/EmptyState';
import type { UserRole } from '@/types/user';

export default function Dashboard() {
  const router = useRouter();
  const { user, setUser, loading } = useUser();

  // COMENTADO: Esto estaba causando conflicto con el redirect de /pro
  // useEffect(() => {
  //   if (!loading && user) {
  //     if (user.role === 'FREELANCER') {
  //       router.push('/quick-trade');
  //     } else if (user.role === 'MARKET_MAKER') {
  //       router.push('/pro');
  //     }
  //   }
  // }, [user, loading, router]);

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
      <div className="flex items-center justify-center py-20">
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
    <>
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
          onAction={() => router.push('/orders/create')}
        />
      </section>
    </>
  );
}
