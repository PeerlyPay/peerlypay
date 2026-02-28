'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Package, RefreshCw, SlidersHorizontal, X } from 'lucide-react';

import EmptyState from '@/components/EmptyState';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { Order } from '@/types';

type TabType = 'active' | 'completed' | 'disputed';
type OrderType = 'buy' | 'sell';
type DateRange = 'last7' | 'last30' | 'all';

interface OrderFilters {
  type: OrderType[];
  dateRange: DateRange;
}

const DEFAULT_FILTERS: OrderFilters = {
  type: [],
  dateRange: 'all',
};

function countActiveFilters(filters: OrderFilters): number {
  let count = filters.type.length;
  if (filters.dateRange !== 'all') count += 1;
  return count;
}

function getOrdersForTab(orders: Order[], tab: TabType): Order[] {
  if (tab === 'active') {
    return orders.filter(
      (order) =>
        order.status === 'Created' ||
        order.status === 'AwaitingFiller' ||
        order.status === 'AwaitingPayment' ||
        order.status === 'AwaitingConfirmation',
    );
  }

  if (tab === 'completed') {
    return orders.filter((order) => order.status === 'Completed');
  }

  return orders.filter(
    (order) =>
      order.status === 'Disputed' ||
      order.status === 'Cancelled' ||
      order.status === 'Refunded',
  );
}

function FilterCheckbox({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="group flex w-full items-center gap-3 py-2.5 text-left"
    >
      <div
        className={cn(
          'flex size-5 items-center justify-center rounded-md border-2 transition-all',
          checked
            ? 'border-primary-500 bg-primary-500'
            : 'border-gray-300 group-hover:border-gray-400',
        )}
      >
        {checked && <span className="text-xs font-bold text-white">✓</span>}
      </div>
      <span className="text-sm text-gray-700">{label}</span>
    </button>
  );
}

function FilterSheet({
  open,
  onClose,
  filters,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  filters: OrderFilters;
  onApply: (filters: OrderFilters) => void;
}) {
  const [draft, setDraft] = useState<OrderFilters>(filters);

  const toggleType = (type: OrderType) => {
    setDraft((prev) => ({
      ...prev,
      type: prev.type.includes(type)
        ? prev.type.filter((value) => value !== type)
        : [...prev.type, type],
    }));
  };

  return (
    <Drawer open={open} onOpenChange={(value) => !value && onClose()} direction="bottom">
      <DrawerContent className="inset-x-0 mx-auto w-[calc(100%-2rem)] max-w-120 rounded-t-2xl border-gray-200 bg-white p-0">
        <div className="space-y-6 px-5 pb-8 pt-4">
          <DrawerHeader className="space-y-0 px-0 pt-0">
            <div className="flex items-center justify-between">
              <DrawerTitle className="font-[family-name:var(--font-space-grotesk)] text-lg">Filters</DrawerTitle>
              <button
                type="button"
                onClick={onClose}
                className="flex size-8 items-center justify-center rounded-full hover:bg-gray-100"
              >
                <X className="size-4 text-gray-500" />
              </button>
            </div>
            <DrawerDescription className="sr-only">Filter your orders by side and date range</DrawerDescription>
          </DrawerHeader>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Side</h3>
            <div className="space-y-0.5">
              <FilterCheckbox
                checked={draft.type.includes('buy')}
                onChange={() => toggleType('buy')}
                label="Buy orders"
              />
              <FilterCheckbox
                checked={draft.type.includes('sell')}
                onChange={() => toggleType('sell')}
                label="Sell orders"
              />
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Date range</h3>
            <div className="space-y-0.5">
              <FilterCheckbox
                checked={draft.dateRange === 'last7'}
                onChange={() => setDraft((prev) => ({ ...prev, dateRange: prev.dateRange === 'last7' ? 'all' : 'last7' }))}
                label="Last 7 days"
              />
              <FilterCheckbox
                checked={draft.dateRange === 'last30'}
                onChange={() => setDraft((prev) => ({ ...prev, dateRange: prev.dateRange === 'last30' ? 'all' : 'last30' }))}
                label="Last 30 days"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onApply(draft);
              onClose();
            }}
            className="h-12 w-full rounded-xl bg-primary-500 text-sm font-semibold text-white hover:bg-primary-600"
          >
            Apply filters
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function statusBadgeClass(status: Order['status']) {
  if (status === 'Completed') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (status === 'Disputed' || status === 'Cancelled' || status === 'Refunded') {
    return 'border-red-200 bg-red-50 text-red-700';
  }
  return 'border-primary-200 bg-primary-50 text-primary-700';
}

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

export default function OrdersPage() {
  const router = useRouter();

  const orders = useStore((state) => state.orders);
  const walletAddress = useStore((state) => state.user.walletAddress);
  const refreshOrdersFromChain = useStore((state) => state.refreshOrdersFromChain);

  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [filters, setFilters] = useState<OrderFilters>(DEFAULT_FILTERS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [nowTimestamp] = useState(() => Date.now());

  const myOrders = useMemo(
    () => orders.filter((order) => walletAddress !== null && order.createdBy === walletAddress),
    [orders, walletAddress],
  );

  const filteredBySheet = useMemo(() => {
    return myOrders.filter((order) => {
      if (filters.type.length > 0 && !filters.type.includes(order.type)) {
        return false;
      }

      if (filters.dateRange !== 'all') {
        const createdAt = toDate(order.createdAt).getTime();
        const days = filters.dateRange === 'last7' ? 7 : 30;
        if (nowTimestamp - createdAt > days * 24 * 60 * 60 * 1000) {
          return false;
        }
      }

      return true;
    });
  }, [myOrders, filters, nowTimestamp]);

  const activeOrders = useMemo(() => getOrdersForTab(filteredBySheet, 'active'), [filteredBySheet]);
  const completedOrders = useMemo(() => getOrdersForTab(filteredBySheet, 'completed'), [filteredBySheet]);
  const disputedOrders = useMemo(() => getOrdersForTab(filteredBySheet, 'disputed'), [filteredBySheet]);

  const visibleOrders = useMemo(() => {
    if (activeTab === 'active') return activeOrders;
    if (activeTab === 'completed') return completedOrders;
    return disputedOrders;
  }, [activeTab, activeOrders, completedOrders, disputedOrders]);

  const activeFilterCount = countActiveFilters(filters);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshOrdersFromChain();
    setIsRefreshing(false);
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-h3 text-black">My Orders</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterSheetOpen(true)}
            className={cn(
              'flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm transition-all active:scale-[0.97]',
              activeFilterCount > 0
                ? 'border-primary-200 bg-primary-50 text-primary-700'
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
            )}
          >
            <SlidersHorizontal className="size-4" />
            <span className="font-medium">Filters</span>
            {activeFilterCount > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary-500 px-1 text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => router.push('/orders/dashboard')}
            className="flex size-9 items-center justify-center rounded-full bg-gray-100 transition-all hover:bg-gray-200 active:scale-95"
            aria-label="Contract dashboard"
          >
            <LayoutDashboard className="size-4 text-gray-500" />
          </button>

          <button
            type="button"
            onClick={() => void handleRefresh()}
            className={cn(
              'flex size-9 items-center justify-center rounded-full bg-gray-100 transition-all hover:bg-gray-200 active:scale-95',
              isRefreshing && 'animate-spin',
            )}
            aria-label="Refresh orders"
          >
            <RefreshCw className="size-4 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-2 rounded-xl border border-gray-200 bg-gray-50 p-1">
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={cn(
            'rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
            activeTab === 'active'
              ? 'bg-white text-primary-700 shadow-sm'
              : 'text-gray-600 hover:bg-gray-100',
          )}
        >
          Active ({activeOrders.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('completed')}
          className={cn(
            'rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
            activeTab === 'completed'
              ? 'bg-white text-primary-700 shadow-sm'
              : 'text-gray-600 hover:bg-gray-100',
          )}
        >
          Completed ({completedOrders.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('disputed')}
          className={cn(
            'rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
            activeTab === 'disputed'
              ? 'bg-white text-primary-700 shadow-sm'
              : 'text-gray-600 hover:bg-gray-100',
          )}
        >
          Disputed ({disputedOrders.length})
        </button>
      </div>

      {visibleOrders.length > 0 ? (
        <div className="space-y-3">
          {visibleOrders.map((order) => {
            const createdAt = toDate(order.createdAt);
            return (
              <button
                key={order.id}
                type="button"
                onClick={() => router.push(`/orders/${order.id}`)}
                className="w-full rounded-xl border border-gray-200 bg-white p-4 text-left transition-all hover:border-primary-200 hover:shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                    {order.type.toUpperCase()}
                  </span>
                  <span className={cn('rounded-full border px-2.5 py-1 text-xs font-medium', statusBadgeClass(order.status))}>
                    {order.status}
                  </span>
                </div>

                <div className="mt-3">
                  <p className="text-xl font-display font-semibold text-dark-500">
                    {order.remainingAmount.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    USDC
                  </p>
                  <p className="text-sm text-gray-600">
                    1 USDC = {order.rate.toLocaleString('en-US')} {order.fiatCurrencyLabel}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>{order.paymentMethodLabel}</span>
                  <span>
                    Created{' '}
                    {createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Package className="h-16 w-16 text-gray-300" />}
          title={
            activeTab === 'active'
              ? 'No active orders yet.'
              : activeTab === 'completed'
                ? 'No completed orders yet.'
                : 'No disputed orders.'
          }
        />
      )}

      <FilterSheet
        open={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        filters={filters}
        onApply={setFilters}
      />
    </>
  );
}
