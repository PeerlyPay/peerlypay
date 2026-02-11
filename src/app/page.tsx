'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/quick-trade');
  }, [router]);

  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-gray-500">Cargando...</div>
    </div>
  );
}
