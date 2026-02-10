'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';

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
    return <div className="flex items-center justify-center py-20">Cargando...</div>;
  }

  // Si no hay usuario o no es MM, mostrar loading mientras redirige
  if (!user || user.role !== 'MARKET_MAKER') {
    return <div className="flex items-center justify-center py-20">Redirigiendo...</div>;
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Market Maker Dashboard</h1>
        <p className="text-sm text-gray-600">Gestiona tus órdenes de liquidez</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="text-sm text-gray-600">Órdenes Activas</div>
          <div className="text-2xl font-bold mt-2">0</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="text-sm text-gray-600">Volumen 24h</div>
          <div className="text-2xl font-bold mt-2">$0</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="text-sm text-gray-600">Profit Estimado</div>
          <div className="text-2xl font-bold mt-2 text-green-600">+$0</div>
        </div>
      </div>

      {/* Orders Table Placeholder */}
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Tus Órdenes</h2>
        <div className="text-center text-gray-500 py-12">
          <p>Dashboard de Market Maker</p>
          <p className="text-sm mt-2">La tabla de órdenes y formulario de creación irán aquí</p>
        </div>
      </div>
    </>
  );
}