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

  const meshGradient =
    'radial-gradient(at 0% 0%, rgb(255 182 193 / 60%) 0px, transparent 50%), radial-gradient(at 100% 0%, rgb(173 216 255 / 60%) 0px, transparent 50%), radial-gradient(at 100% 100%, rgb(221 160 255 / 60%) 0px, transparent 50%), radial-gradient(at 0% 100%, rgb(152 251 200 / 50%) 0px, transparent 50%)';
  const borderGradient =
    'linear-gradient(135deg, rgb(255 182 193 / 80%), rgb(173 216 255 / 80%), rgb(221 160 255 / 80%), rgb(152 251 200 / 60%))';

  return (
    <>
      <h1 className="text-h3 text-black mb-6">My Orders</h1>

        {/* Your Reputation */}
      <div
        className="group relative mb-6 cursor-pointer overflow-hidden rounded-xl shadow-balance-card transition-all duration-300 hover:scale-105 hover:shadow-2xl"
        role="button"
        tabIndex={0}
        onClick={() => {}}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLElement).click();
        }}
      >
        <div className="absolute inset-0" style={{ background: meshGradient }} aria-hidden />
        <div className="relative rounded-xl p-0.5" style={{ background: borderGradient }}>
          <div className="rounded-lg border border-white/30 bg-white/55 p-5 backdrop-blur-3xl">
            <p className="mb-2 text-body-sm font-semibold text-gray-800">Your Reputation</p>
            <p className="text-4xl font-display font-bold text-dark-500">
              ⭐ {user.reputation_score ?? 0}
            </p>
            <p className="mt-1 text-body-sm text-gray-700">
              {(user.reputation_score ?? 0)} completed trades
            </p>
          </div>
        </div>
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
