'use client';

import { useState, useMemo } from 'react';
import { Package } from 'lucide-react';
import { useStore } from '@/lib/store';
import OrderCard from '@/components/OrderCard';
import EmptyState from '@/components/EmptyState';
import type { Order } from '@/types';

type TabType = 'active' | 'completed' | 'disputed';

function getOrdersForTab(orders: Order[], tab: TabType): Order[] {
  if (tab === 'active') {
    return orders.filter((o) => o.status === 'open' || o.status === 'active');
  }
  if (tab === 'completed') {
    return orders.filter((o) => o.status === 'completed');
  }
  return orders.filter((o) => o.status === 'disputed' || o.status === 'cancelled');
}

export default function MyOrdersPage() {
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const orders = useStore((s) => s.orders);
  const user = useStore((s) => s.user);

  const myOrders = useMemo(
    () =>
      orders.filter(
        (o) => user.walletAddress !== null && o.createdBy === user.walletAddress
      ),
    [orders, user.walletAddress]
  );

  const activeOrders = useMemo(
    () => getOrdersForTab(myOrders, 'active'),
    [myOrders]
  );
  const completedOrders = useMemo(
    () => getOrdersForTab(myOrders, 'completed'),
    [myOrders]
  );
  const disputedOrders = useMemo(
    () => getOrdersForTab(myOrders, 'disputed'),
    [myOrders]
  );

  const filteredOrders = useMemo(() => {
    if (activeTab === 'active') return activeOrders;
    if (activeTab === 'completed') return completedOrders;
    return disputedOrders;
  }, [activeTab, activeOrders, completedOrders, disputedOrders]);

  return (
    <>
      <h1 className="text-h3 text-black mb-6">My Orders</h1>

        {/* Your Reputation */}
        <div
          className="mb-6 rounded-xl border border-cyan-200 bg-cyan-50 p-5 cursor-pointer hover:bg-cyan-100/80 transition-colors"
          role="button"
          tabIndex={0}
          onClick={() => {}}
          onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLElement).click(); }}
        >
          <p className="text-body-sm font-semibold text-cyan-800 mb-2">Your Reputation</p>
          <p className="text-4xl font-bold text-cyan-700 font-[family-name:var(--font-space-grotesk)]">
            ⭐ {user.reputation_score ?? 0}
          </p>
          <p className="text-body-sm text-cyan-700 mt-1">
            {(user.reputation_score ?? 0)} completed trades
          </p>
        </div>

        {/* Stats section */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-magenta-600">{activeOrders.length}</p>
            <p className="text-xs font-medium text-gray-500 mt-1">Active</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{completedOrders.length}</p>
            <p className="text-xs font-medium text-gray-500 mt-1">Completed</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{disputedOrders.length}</p>
            <p className="text-xs font-medium text-gray-500 mt-1">Disputed</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-3 rounded-xl font-semibold transition ${
              activeTab === 'active'
                ? 'bg-magenta-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Active
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-3 rounded-xl font-semibold transition ${
              activeTab === 'completed'
                ? 'bg-magenta-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Completed
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('disputed')}
            className={`flex-1 py-3 rounded-xl font-semibold transition ${
              activeTab === 'disputed'
                ? 'bg-magenta-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Disputed
          </button>
        </div>

        {/* Order list or EmptyState */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Package className="w-16 h-16 text-gray-300" />}
            title={
              activeTab === 'active'
                ? 'No active orders. Create an order to get started.'
                : activeTab === 'completed'
                  ? 'No completed orders yet.'
                  : 'No disputed orders.'
            }
          />
        )}
    </>
  );
}
