'use client';

import { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import { useStore } from '@/lib/store';
import Header from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import OrderCard from '@/components/OrderCard';
import OrderCardSkeleton from '@/components/OrderCardSkeleton';
import EmptyState from '@/components/EmptyState';
import FadeIn from '@/components/FadeIn';

const SKELETON_COUNT = 4;

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('sell');
  const [isLoading, setIsLoading] = useState(true);
  const orders = useStore((s) => s.orders);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // User wants to buy -> show sell orders (others selling USDC); want sell -> show buy orders
  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'buy') {
      return order.type === 'sell' && order.status === 'open';
    } else {
      return order.type === 'buy' && order.status === 'open';
    }
  });

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-[480px] mx-auto px-4 pt-20 pb-24">
        <h1 className="text-h3 text-black mb-6">Marketplace</h1>

        {/* Tab switcher */}
        <div className="flex gap-6 border-b border-gray-200 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('buy')}
            className={`text-body pb-3 -mb-px transition-colors ${
              activeTab === 'buy'
                ? 'text-primary-600 font-semibold border-b-2 border-primary-500'
                : 'text-gray-500 font-medium hover:text-primary-500'
            }`}
          >
            Buy USDC
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sell')}
            className={`text-body pb-3 -mb-px transition-colors ${
              activeTab === 'sell'
                ? 'text-primary-600 font-semibold border-b-2 border-primary-500'
                : 'text-gray-500 font-medium hover:text-primary-500'
            }`}
          >
            Sell USDC
          </button>
        </div>

        {/* Orders list, skeleton, or EmptyState */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <OrderCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order, index) => (
              <FadeIn key={order.id} delay={index * 0.05}>
                <OrderCard order={order} />
              </FadeIn>
            ))}
          </div>
        ) : (
          <FadeIn>
            <EmptyState
              icon={<Package className="w-16 h-16 text-gray-300" />}
              title="No orders available. Check back later or create your own order."
            />
          </FadeIn>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
