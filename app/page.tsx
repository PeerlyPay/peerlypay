'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import BalanceCard from '@/components/BalanceCard';
import QuickActions from '@/components/QuickActions';
import EmptyState from '@/components/EmptyState';

export default function Dashboard() {
  const router = useRouter();

  return (
    <>
      <BalanceCard />
      <QuickActions />

      <section>
        <div className="flex justify-between items-center mb-4 mt-8">
          <h2 className="text-h3 text-black">Open Orders</h2>
          <button
            type="button"
            onClick={() => router.push('/orders')}
            className="text-magenta-500 text-sm font-semibold hover:text-magenta-600"
          >
            View All
          </button>
        </div>
        <EmptyState
          icon={
            <Image
              src="/illustrations/empty-marketplace.png"
              alt="Empty marketplace"
              width={200}
              height={200}
              className="mx-auto"
            />
          }
          title="No open orders found"
          actionText="Create your first order"
          onAction={() => router.push('/orders/create')}
        />
      </section>
    </>
  );
}
