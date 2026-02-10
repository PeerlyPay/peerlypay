'use client';

import { Monitor, Plus, Activity, DollarSign, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

const stats = [
  {
    label: 'Órdenes Activas',
    value: '0',
    icon: Activity,
    iconColor: 'text-indigo-500',
    iconBg: 'bg-indigo-100',
  },
  {
    label: 'Volumen 24h',
    value: '$0',
    icon: DollarSign,
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-100',
  },
  {
    label: 'Profit Estimado',
    value: '$0',
    icon: TrendingUp,
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-100',
  },
];

export default function ProDashboard() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Desktop view */}
      <main className="hidden md:block max-w-4xl mx-auto px-6 pt-24 pb-8">
        {/* Header row */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-h2 text-[#191919] font-[family-name:var(--font-space-grotesk)]">
            Market Maker Dashboard
          </h1>
          <Button className="bg-gradient-peerlypay hover:opacity-90 text-white rounded-xl px-5 h-11 font-[family-name:var(--font-dm-sans)] font-semibold gap-2">
            <Plus className="size-4" />
            Nueva Orden
          </Button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="py-4">
                <CardContent className="flex items-center gap-4 px-5">
                  <div className={`size-10 rounded-xl ${stat.iconBg} flex items-center justify-center shrink-0`}>
                    <Icon className={`size-5 ${stat.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500 font-[family-name:var(--font-dm-sans)]">
                      {stat.label}
                    </p>
                    <p className="text-xl font-bold text-[#191919] font-[family-name:var(--font-space-grotesk)]">
                      {stat.value}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Orders table placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-[family-name:var(--font-space-grotesk)]">
              Tus Órdenes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="size-14 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">
                <Activity className="size-7 text-neutral-400" />
              </div>
              <p className="text-base font-semibold text-neutral-700 font-[family-name:var(--font-space-grotesk)]">
                Sin órdenes activas
              </p>
              <p className="text-sm text-neutral-500 mt-1 font-[family-name:var(--font-dm-sans)]">
                Crea tu primera orden para comenzar a proveer liquidez
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Mobile view */}
      <main className="md:hidden max-w-[480px] mx-auto px-4 pt-20 pb-24">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="size-16 rounded-2xl bg-indigo-100 flex items-center justify-center mb-5">
            <Monitor className="size-8 text-indigo-500" />
          </div>
          <h2 className="text-h4 text-[#191919] font-[family-name:var(--font-space-grotesk)]">
            Dashboard de escritorio
          </h2>
          <p className="text-sm text-neutral-500 mt-2 max-w-[280px] font-[family-name:var(--font-dm-sans)] leading-relaxed">
            Para gestionar tus órdenes, accede desde una computadora. En mobile, puedes monitorear trades desde la tab Monitor.
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
