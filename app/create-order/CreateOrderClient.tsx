'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import OrderTypeSelector from '@/components/OrderTypeSelector';
import CreateOrderForm from '@/components/CreateOrderForm';
import FadeIn from '@/components/FadeIn';

export default function CreateOrderClient() {
  const searchParams = useSearchParams();
  const initialType = (searchParams.get('type') as 'buy' | 'sell') || 'sell';
  const [orderType, setOrderType] = useState<'buy' | 'sell'>(initialType);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-[480px] mx-auto px-4 pt-20 pb-24">
        <FadeIn>
          <h1 className="text-h3 text-black mb-6">Create Order</h1>
          <OrderTypeSelector
            selected={orderType}
            onSelect={setOrderType}
          />
        </FadeIn>
        <FadeIn delay={0.1}>
          <CreateOrderForm orderType={orderType} />
        </FadeIn>
      </main>

      <BottomNav />
    </div>
  );
}
