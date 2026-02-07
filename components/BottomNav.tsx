'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, Store, Plus, Package, User } from 'lucide-react';

const TABS = [
  { label: 'Home', icon: Home, href: '/' },
  { label: 'Market', icon: Store, href: '/orders' },
  { label: 'Create', icon: Plus, href: '/orders/create' },
  { label: 'Orders', icon: Package, href: '/orders/mine' },
  { label: 'Profile', icon: User, href: '/profile' },
] as const;

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-40 w-full max-w-120 -translate-x-1/2 border-t border-gray-200 bg-white shadow-lg pb-safe"
      aria-label="Bottom navigation"
    >
      <div className="flex items-center justify-around h-16 px-1">
        {TABS.map((tab) => {
          const active = isActive(tab.href);
          const Icon = tab.icon;
          return (
            <button
              key={tab.href}
              type="button"
              onClick={() => router.push(tab.href)}
              className="flex flex-col items-center justify-center gap-1 min-w-0 flex-1 py-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-current={active ? 'page' : undefined}
              aria-label={tab.label}
            >
              <Icon
                className={`w-6 h-6 shrink-0 ${
                  active ? 'text-primary-500' : ''
                }`}
              />
              <span
                className={`text-xs font-medium truncate max-w-full ${
                  active ? 'text-primary-500' : ''
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
