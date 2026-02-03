'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import BalanceCard from '@/components/BalanceCard';
import QuickActions from '@/components/QuickActions';
import EmptyState from '@/components/EmptyState';
import BottomNav from '@/components/BottomNav';

export default function Dashboard() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-[480px] mx-auto px-4 pt-20 pb-24">
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
            onAction={() => router.push('/create-order')}
          />
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
