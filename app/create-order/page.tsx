import { Suspense } from 'react';
import CreateOrderClient from './CreateOrderClient';

export default function CreateOrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center text-gray-500">Loading...</div>}>
      <CreateOrderClient />
    </Suspense>
  );
}
