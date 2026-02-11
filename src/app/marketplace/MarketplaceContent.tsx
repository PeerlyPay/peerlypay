'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ArrowUpDown,
  Filter,
  Star,
  TrendingUp,
  Clock,
  BarChart3,
  ChevronDown,
  X,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import OrderCard from '@/components/OrderCard';
import OrderCardSkeleton from '@/components/OrderCardSkeleton';
import EmptyState from '@/components/EmptyState';
import FadeIn from '@/components/FadeIn';
import { Button } from '@/components/ui/button';

type TabType = 'buy' | 'sell';
type SortType = 'best_rate' | 'newest' | 'volume';

const SKELETON_COUNT = 4;

// Sort options configuration
const sortOptions: { value: SortType; label: string; icon: typeof TrendingUp }[] = [
  { value: 'best_rate', label: 'Best Rate', icon: TrendingUp },
  { value: 'newest', label: 'Newest', icon: Clock },
  { value: 'volume', label: 'Volume', icon: BarChart3 },
];

export default function MarketplaceContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('type') as TabType) || 'buy';

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [sortBy, setSortBy] = useState<SortType>('best_rate');
  const [minAmount, setMinAmount] = useState<number | null>(null);
  const [minReputation, setMinReputation] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const orders = useStore((s) => s.orders);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    // User wants to buy -> show sell orders; wants to sell -> show buy orders
    let result = orders.filter((order) => {
      if (activeTab === 'buy') {
        return order.type === 'sell' && order.status === 'open';
      } else {
        return order.type === 'buy' && order.status === 'open';
      }
    });

    // Apply amount filter
    if (minAmount !== null) {
      result = result.filter((order) => order.amount >= minAmount);
    }

    // Apply reputation filter
    if (minReputation !== null) {
      result = result.filter((order) => (order.reputation_score ?? 0) >= minReputation);
    }

    // Apply sorting
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'best_rate':
          // For buyers: lower rate is better; for sellers: higher rate is better
          return activeTab === 'buy' ? a.rate - b.rate : b.rate - a.rate;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'volume':
          return b.amount - a.amount;
        default:
          return 0;
      }
    });

    return result;
  }, [orders, activeTab, sortBy, minAmount, minReputation]);

  const hasActiveFilters = minAmount !== null || minReputation !== null;

  const clearFilters = () => {
    setMinAmount(null);
    setMinReputation(null);
  };

  const currentSortOption = sortOptions.find((o) => o.value === sortBy);

  return (
    <>
      {/* Page title */}
      <h1 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-space-grotesk)] mb-6">
          Marketplace
        </h1>

        {/* Tabs - underline style */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('buy')}
            className={`flex-1 py-3 text-sm font-semibold transition-all border-b-2 -mb-px ${
              activeTab === 'buy'
                ? 'text-[var(--color-primary-500)] border-[var(--color-primary-500)]'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            Buy USDC
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sell')}
            className={`flex-1 py-3 text-sm font-semibold transition-all border-b-2 -mb-px ${
              activeTab === 'sell'
                ? 'text-[var(--color-primary-500)] border-[var(--color-primary-500)]'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            Sell USDC
          </button>
        </div>

        {/* Filter & Sort bar */}
        <div className="flex items-center gap-2 mb-4">
          {/* Sort dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <ArrowUpDown className="w-4 h-4" />
              {currentSortOption?.label}
              <ChevronDown className={`w-4 h-4 transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
            </button>

            {showSortMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowSortMenu(false)}
                />
                <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-20 min-w-[160px]">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setSortBy(option.value);
                        setShowSortMenu(false);
                      }}
                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors ${
                        sortBy === option.value
                          ? 'bg-gray-100 text-gray-900 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <option.icon className="w-4 h-4" />
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Filter button */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              hasActiveFilters
                ? 'bg-[var(--color-primary-100)] text-[var(--color-primary-700)]'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="w-5 h-5 flex items-center justify-center bg-[var(--color-primary-500)] text-white text-xs rounded-full">
                {(minAmount !== null ? 1 : 0) + (minReputation !== null ? 1 : 0)}
              </span>
            )}
          </button>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1 px-2 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}

          {/* Results count */}
          <span className="ml-auto text-sm text-gray-500">
            {filteredOrders.length} offers
          </span>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <FadeIn>
            <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-4">
              {/* Min amount filter */}
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
                  Minimum Amount (USDC)
                </label>
                <div className="flex gap-2">
                  {[null, 50, 100, 200, 500].map((amount) => (
                    <button
                      key={amount ?? 'any'}
                      type="button"
                      onClick={() => setMinAmount(amount)}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        minAmount === amount
                          ? 'bg-[var(--color-primary-500)] text-white'
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {amount === null ? 'Any' : `${amount}+`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Min reputation filter */}
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
                  Minimum Reputation
                </label>
                <div className="flex gap-2">
                  {[null, 10, 25, 50, 100].map((rep) => (
                    <button
                      key={rep ?? 'any'}
                      type="button"
                      onClick={() => setMinReputation(rep)}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        minReputation === rep
                          ? 'bg-[var(--color-primary-500)] text-white'
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {rep === null ? (
                        'Any'
                      ) : (
                        <span className="flex items-center justify-center gap-1">
                          <Star className="w-3 h-3" />
                          {rep}+
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        )}

        {/* Orders list */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <OrderCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order, index) => (
              <FadeIn key={order.id} delay={index * 0.03}>
                <OrderCard order={order} />
              </FadeIn>
            ))}
          </div>
        ) : (
          <FadeIn>
            <EmptyState
              title="No offers match your filters"
              description={
                hasActiveFilters
                  ? 'Try adjusting your filters to see more offers'
                  : 'Check back later or create your own order'
              }
            />
            {hasActiveFilters && (
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="rounded-xl"
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </FadeIn>
        )}
    </>
  );
}
