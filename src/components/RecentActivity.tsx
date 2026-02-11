'use client';

import { useRouter } from 'next/navigation';

interface RecentActivityProps {
  weeklyTrades: number;
  totalConverted: number;
  avgPerTrade: number;
}

export default function RecentActivity({
  weeklyTrades,
  totalConverted,
  avgPerTrade,
}: RecentActivityProps) {
  const router = useRouter();

  return (
    <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
      <h3 className="text-h5 text-gray-900 mb-4">
        <span className="mr-1">💰</span> Tu actividad
      </h3>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-green-50 p-3 text-center">
          <p className="text-h5 text-green-700">{weeklyTrades}</p>
          <p className="text-caption text-gray-500">Esta semana</p>
        </div>
        <div className="rounded-xl bg-green-50 p-3 text-center">
          <p className="text-h5 text-green-700">
            ${totalConverted.toLocaleString('es-AR')}
          </p>
          <p className="text-caption text-gray-500">Total ARS</p>
        </div>
        <div className="rounded-xl bg-green-50 p-3 text-center">
          <p className="text-h5 text-green-700">{avgPerTrade}</p>
          <p className="text-caption text-gray-500">Prom. USDC</p>
        </div>
      </div>

      <button
        onClick={() => router.push('/orders')}
        className="mt-4 w-full text-center text-body-sm font-medium text-magenta-500 hover:text-magenta-600 transition-colors"
      >
        Ver historial completo →
      </button>
    </div>
  );
}
