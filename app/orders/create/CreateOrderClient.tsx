'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import FadeIn from '@/components/FadeIn';
import CreateOrderForm from './CreateOrderForm';
import OrderTypeSelector from './OrderTypeSelector';

export default function CreateOrderClient() {
  const searchParams = useSearchParams();
  const initialType = (searchParams.get('type') as 'buy' | 'sell') || 'sell';
  const [orderType, setOrderType] = useState<'buy' | 'sell'>(initialType);

  return (
    <>
      <FadeIn>
        <h1 className="text-h3 text-black mb-6">Create Order</h1>
        <OrderTypeSelector selected={orderType} onSelect={setOrderType} />
      </FadeIn>
      <FadeIn delay={0.1}>
        <CreateOrderForm orderType={orderType} />
      </FadeIn>
    </>
  );
}
