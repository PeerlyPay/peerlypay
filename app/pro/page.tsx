'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import BottomNav from '@/components/BottomNav';

export default function ProDashboardPage() {
  const router = useRouter();
  const { user, loading } = useUser();

  // Debug logs
  console.log('ProDashboard - loading:', loading);
  console.log('ProDashboard - user:', user);
  console.log('ProDashboard - user?.role:', user?.role);

  // Protección: solo market makers (usando useEffect para evitar el redirect durante render)
  useEffect(() => {
    if (!loading && (!user || user.role !== 'MARKET_MAKER')) {
      console.log('ProDashboard - Redirecting to / because not MM');
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  // Si no hay usuario o no es MM, mostrar loading mientras redirige
  if (!user || user.role !== 'MARKET_MAKER') {
    return <div className="min-h-screen flex items-center justify-center">Redirigiendo...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold">Market Maker Dashboard</h1>
          <p className="text-sm text-gray-600">Gestiona tus órdenes de liquidez</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 pb-24">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-sm text-gray-600">Órdenes Activas</div>
            <div className="text-3xl font-bold mt-2">0</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-sm text-gray-600">Volumen 24h</div>
            <div className="text-3xl font-bold mt-2">$0</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-sm text-gray-600">Profit Estimado</div>
            <div className="text-3xl font-bold mt-2 text-green-600">+$0</div>
          </div>
        </div>

        {/* Orders Table Placeholder */}
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Tus Órdenes</h2>
          <div className="text-center text-gray-500 py-12">
            <p>Dashboard de Market Maker</p>
            <p className="text-sm mt-2">La tabla de órdenes y formulario de creación irán aquí</p>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}