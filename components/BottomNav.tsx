'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, User, LayoutDashboard, Activity, Zap } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { user, isFreelancer, isMarketMaker, loading } = useUser();

  // No mostrar si está cargando o no hay usuario
  if (loading || !user) return null;

  const freelancerTabs = [
    { href: '/quick-trade', icon: Home, label: 'Home' },
    { href: '/trade', icon: Zap, label: 'Trade' },
    { href: '/orders', icon: FileText, label: 'Orders' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  const marketMakerTabs = [
    { href: '/pro', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/monitor', icon: Activity, label: 'Monitor' },
    { href: '/orders', icon: FileText, label: 'Trades' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  // CRITICAL: usar la condición correcta
  const tabs = isFreelancer ? freelancerTabs : marketMakerTabs;

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-40 w-full max-w-120 -translate-x-1/2 border-t border-gray-200 bg-white shadow-lg pb-safe"
      aria-label="Bottom navigation"
    >
      <div className="flex items-center justify-around h-16 px-1">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-1 px-4 py-2 transition-colors ${
                isActive
                  ? 'text-pink-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
