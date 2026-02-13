'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

/** Routes that render fullscreen without Header/BottomNav */
function isFullscreenRoute(pathname: string): boolean {
  return pathname.startsWith('/trade/');
}

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullscreen = isFullscreenRoute(pathname);

  if (isFullscreen) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-white max-w-120 mx-auto px-4 pt-20 pb-24">
      <Header />
      {children}
      <BottomNav />
    </div>
  );
}
