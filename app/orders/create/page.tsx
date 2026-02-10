import { Suspense } from 'react';
import CreateOrderClient from './CreateOrderClient';

export default function CreateOrderPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-gray-500">Loading...</div>}>
      <CreateOrderClient />
    </Suspense>
  );
}
