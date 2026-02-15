'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardList, User } from 'lucide-react';

const tabs = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/orders', icon: ClipboardList, label: 'Orders' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-40 w-full max-w-120 -translate-x-1/2 border-t border-[#f1f3f4] bg-white pb-safe"
      aria-label="Bottom navigation"
    >
      <div className="flex items-start justify-around py-2.5">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-1 flex-col items-center gap-3 transition-colors ${
                isActive
                  ? 'text-primary-500'
                  : 'text-[#737373]'
              }`}
            >
              <Icon className="size-6" strokeWidth={1.5} />
              <span className="text-[13px] font-normal leading-normal">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
