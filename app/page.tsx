'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { RoleSelection } from '@/components/RoleSelection';
import type { UserRole } from '@/types/user';

export default function RootPage() {
  const router = useRouter();
  const { user, setUser, loading } = useUser();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'FREELANCER') {
        router.replace('/quick-trade');
      } else if (user.role === 'MARKET_MAKER') {
        router.replace('/pro');
      }
    }
  }, [user, loading, router]);

  const handleRoleSelected = (role: UserRole) => {
    const newUser = {
      id: crypto.randomUUID(),
      walletAddress: 'mock-wallet',
      role,
      createdAt: new Date(),
    };

    setUser(newUser);

    if (role === 'FREELANCER') {
      router.replace('/quick-trade');
    } else {
      router.replace('/pro');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return <RoleSelection onSelectRole={handleRoleSelected} />;
  }

  // Logged-in users get redirected by the useEffect above.
  // Show nothing while the redirect happens.
  return null;
}
