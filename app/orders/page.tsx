'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Copy,
  Check,
  Star,
  Download,
  Flag,
  RefreshCw,
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useStore } from '@/lib/store';
import OrderCard from '@/components/OrderCard';
import OrderCardSkeleton from '@/components/OrderCardSkeleton';
import EmptyState from '@/components/EmptyState';
import FadeIn from '@/components/FadeIn';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

// ============================================
// TYPES
// ============================================

type TradeStatus = 'active' | 'completed' | 'disputed';

interface TradeTimelineStep {
  label: string;
  time: string;
  done: boolean;
}

interface FreelancerTrade {
  id: string;
  status: TradeStatus;
  usdcAmount: number;
  arsAmount: number;
  rate: number;
  counterparty: {
    username: string;
    reputation: number;
  };
  createdAt: string;
  completedAt?: string;
  txnId: string;
  paymentMethod: string;
  timeline: TradeTimelineStep[];
}

// ============================================
// MOCK DATA
// ============================================

const MOCK_TRADES: FreelancerTrade[] = [
  {
    id: 'TRD-001',
    status: 'active',
    usdcAmount: 0.15,
    arsAmount: 222.75,
    rate: 1485,
    counterparty: { username: 'crypto_trader_ar', reputation: 4.8 },
    createdAt: '2026-02-10T15:15:00',
    txnId: '#TXN789012',
    paymentMethod: 'MercadoPago',
    timeline: [
      { label: 'Trade iniciado', time: '3:15 PM', done: true },
      { label: 'Pago enviado', time: '3:16 PM', done: true },
      { label: 'Esperando liberación', time: '', done: false },
      { label: 'USDC recibido', time: '', done: false },
    ],
  },
  {
    id: 'TRD-002',
    status: 'completed',
    usdcAmount: 0.11,
    arsAmount: 163.35,
    rate: 1485,
    counterparty: { username: 'p2p_master', reputation: 4.9 },
    createdAt: '2026-02-09T11:30:00',
    completedAt: '2026-02-09T11:33:00',
    txnId: '#TXN456789',
    paymentMethod: 'Bank Transfer',
    timeline: [
      { label: 'Trade iniciado', time: '11:30 AM', done: true },
      { label: 'Pago enviado', time: '11:31 AM', done: true },
      { label: 'USDC liberado', time: '11:32 AM', done: true },
      { label: 'USDC recibido', time: '11:33 AM', done: true },
    ],
  },
  {
    id: 'TRD-003',
    status: 'completed',
    usdcAmount: 0.25,
    arsAmount: 371.25,
    rate: 1485,
    counterparty: { username: 'usdc_dealer_ba', reputation: 4.7 },
    createdAt: '2026-02-07T09:00:00',
    completedAt: '2026-02-07T09:04:00',
    txnId: '#TXN123456',
    paymentMethod: 'MercadoPago',
    timeline: [
      { label: 'Trade iniciado', time: '9:00 AM', done: true },
      { label: 'Pago enviado', time: '9:01 AM', done: true },
      { label: 'USDC liberado', time: '9:03 AM', done: true },
      { label: 'USDC recibido', time: '9:04 AM', done: true },
    ],
  },
  {
    id: 'TRD-004',
    status: 'completed',
    usdcAmount: 0.08,
    arsAmount: 118.8,
    rate: 1485,
    counterparty: { username: 'crypto_trader_ar', reputation: 4.8 },
    createdAt: '2026-02-05T16:45:00',
    completedAt: '2026-02-05T16:48:00',
    txnId: '#TXN987654',
    paymentMethod: 'Bank Transfer',
    timeline: [
      { label: 'Trade iniciado', time: '4:45 PM', done: true },
      { label: 'Pago enviado', time: '4:46 PM', done: true },
      { label: 'USDC liberado', time: '4:47 PM', done: true },
      { label: 'USDC recibido', time: '4:48 PM', done: true },
    ],
  },
];

// ============================================
// HELPERS
// ============================================

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatArs(value: number): string {
  return value.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatUsdc(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatRate(value: number): string {
  return value.toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

// ============================================
// STATUS BADGE
// ============================================

function StatusBadge({ status }: { status: TradeStatus }) {
  const config = {
    active: {
      label: 'En progreso',
      className: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    completed: {
      label: 'Completado',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    disputed: {
      label: 'Disputado',
      className: 'bg-red-50 text-red-700 border-red-200',
    },
  };
  const { label, className } = config[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border',
        className
      )}
    >
      {status === 'completed' && (
        <CheckCircle2 className="size-3" />
      )}
      {label}
    </span>
  );
}

// ============================================
// TRADE CARD
// ============================================

function TradeCard({
  trade,
  onTap,
}: {
  trade: FreelancerTrade;
  onTap: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onTap}
      className={cn(
        'w-full bg-white rounded-xl border border-gray-200 p-4 text-left',
        'transition-all duration-200 hover:border-gray-300 hover:shadow-sm',
        'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:ring-offset-2',
        'active:scale-[0.98]',
        trade.status === 'active' && 'border-l-4 border-l-amber-400'
      )}
    >
      {/* Header: date + status */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-400">
          {formatDate(trade.createdAt)}
        </span>
        <StatusBadge status={trade.status} />
      </div>

      {/* Amount sold */}
      <p className="text-sm font-semibold text-gray-900 mb-1">
        Vendiste {formatUsdc(trade.usdcAmount)} USDC
      </p>

      {/* Amount received */}
      <p className="text-sm text-gray-600 mb-2">
        Recibiste{' '}
        <span className="font-semibold text-emerald-600">
          ${formatArs(trade.arsAmount)} ARS
        </span>
      </p>

      {/* Rate + counterparty row */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <span className="text-xs text-gray-400">
          1 USDC = {formatRate(trade.rate)} ARS
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-gray-600">
            @{trade.counterparty.username}
          </span>
          <span className="text-xs text-amber-500">
            ★ {trade.counterparty.reputation}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        </div>
      </div>
    </button>
  );
}

// ============================================
// TRADE DETAIL SHEET
// ============================================

function TradeDetailSheet({
  trade,
  open,
  onClose,
}: {
  trade: FreelancerTrade | null;
  open: boolean;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  useEffect(() => {
    setCopied(false);
    setRating(0);
    setRatingSubmitted(false);
  }, [trade?.id]);

  if (!trade) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(trade.txnId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isWithin24h = trade.completedAt
    ? Date.now() - new Date(trade.completedAt).getTime() < 24 * 60 * 60 * 1000
    : true;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl max-h-[90dvh] overflow-y-auto p-0"
      >
        <div className="px-5 pt-4 pb-8 space-y-5">
          {/* Drag handle */}
          <div className="flex justify-center">
            <div className="w-10 h-1 rounded-full bg-gray-300" />
          </div>

          <SheetHeader className="space-y-1">
            <SheetTitle className="font-[family-name:var(--font-space-grotesk)] text-lg">
              Detalle del Trade
            </SheetTitle>
            <SheetDescription className="sr-only">
              Detalles completos de la transacción
            </SheetDescription>
          </SheetHeader>

          {/* Status */}
          <div className="flex justify-center">
            <StatusBadge status={trade.status} />
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-gray-500">Vendiste</span>
              <span className="font-[family-name:var(--font-jetbrains-mono)] text-base font-bold text-gray-900 tabular-nums">
                {formatUsdc(trade.usdcAmount)} USDC
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-gray-500">Recibiste</span>
              <span className="font-[family-name:var(--font-jetbrains-mono)] text-base font-bold text-emerald-600 tabular-nums">
                ${formatArs(trade.arsAmount)} ARS
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-gray-500">Tasa</span>
              <span className="font-[family-name:var(--font-jetbrains-mono)] text-sm text-gray-700 tabular-nums">
                1 USDC = {formatRate(trade.rate)} ARS
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-gray-500">Método</span>
              <span className="text-body-sm font-medium text-gray-700">
                {trade.paymentMethod}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-gray-500">Contraparte</span>
              <span className="text-body-sm font-medium text-gray-700">
                @{trade.counterparty.username}{' '}
                <span className="text-amber-500">
                  ★ {trade.counterparty.reputation}
                </span>
              </span>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <p className="text-body-sm font-semibold text-gray-900 mb-3">
              Timeline
            </p>
            <div className="space-y-0">
              {trade.timeline.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'w-2.5 h-2.5 rounded-full mt-1.5 shrink-0',
                        step.done ? 'bg-emerald-500' : 'bg-gray-300'
                      )}
                    />
                    {i < trade.timeline.length - 1 && (
                      <div
                        className={cn(
                          'w-0.5 h-6',
                          step.done ? 'bg-emerald-200' : 'bg-gray-200'
                        )}
                      />
                    )}
                  </div>
                  <div className="flex items-center justify-between flex-1 pb-3">
                    <span
                      className={cn(
                        'text-sm',
                        step.done
                          ? 'text-gray-900 font-medium'
                          : 'text-gray-400'
                      )}
                    >
                      {step.label}
                    </span>
                    {step.time && (
                      <span className="text-xs text-gray-400 font-[family-name:var(--font-jetbrains-mono)] tabular-nums">
                        {step.time}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction ID */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
            <div>
              <p className="text-xs text-gray-400">ID de transacción</p>
              <p className="font-[family-name:var(--font-jetbrains-mono)] text-sm text-gray-700 tabular-nums">
                {trade.txnId}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className={cn(
                'flex items-center justify-center size-8 rounded-lg transition-all active:scale-95',
                copied
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-white text-gray-400 hover:text-gray-600 border border-gray-200'
              )}
            >
              {copied ? (
                <Check className="size-4" />
              ) : (
                <Copy className="size-4" />
              )}
            </button>
          </div>

          {/* Rate trader (completed, not yet rated) */}
          {trade.status === 'completed' && !ratingSubmitted && (
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-body-sm text-gray-500 text-center mb-3">
                Califica a{' '}
                <strong className="text-gray-900">
                  @{trade.counterparty.username}
                </strong>
              </p>
              <div className="flex justify-center mb-3">
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="transition-transform active:scale-90 hover:scale-110 p-0.5"
                    >
                      <Star
                        className={cn(
                          'size-7 transition-colors',
                          rating >= star
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-transparent text-gray-300'
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>
              {rating > 0 && (
                <button
                  type="button"
                  onClick={() => setRatingSubmitted(true)}
                  className="w-full h-10 rounded-xl font-[family-name:var(--font-space-grotesk)] text-sm font-semibold text-fuchsia-600 bg-fuchsia-50 hover:bg-fuchsia-100 transition-colors active:scale-[0.98]"
                >
                  Enviar calificación
                </button>
              )}
            </div>
          )}

          {trade.status === 'completed' && ratingSubmitted && (
            <div className="flex flex-col items-center text-center bg-gray-50 rounded-2xl py-4">
              <div className="flex items-center justify-center size-9 rounded-full bg-emerald-100 mb-2">
                <Check className="size-4 text-emerald-600" strokeWidth={2.5} />
              </div>
              <p className="text-body-sm font-semibold text-gray-900">
                Gracias por tu calificación!
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {trade.status === 'completed' && (
              <button
                type="button"
                className="w-full h-12 rounded-xl flex items-center justify-center gap-2 font-[family-name:var(--font-space-grotesk)] text-sm font-semibold text-gray-700 border border-gray-200 bg-white hover:bg-gray-50 transition-all active:scale-[0.98]"
              >
                <Download className="size-4" />
                Descargar recibo
              </button>
            )}
            {isWithin24h && (
              <button
                type="button"
                className="w-full h-10 rounded-xl flex items-center justify-center gap-2 font-[family-name:var(--font-space-grotesk)] text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
              >
                <Flag className="size-4" />
                Reportar problema
              </button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ============================================
// FREELANCER TRADES VIEW
// ============================================

function FreelancerTradesView() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TradeStatus>('active');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<FreelancerTrade | null>(
    null
  );

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredTrades = useMemo(
    () => MOCK_TRADES.filter((t) => t.status === activeTab),
    [activeTab]
  );

  const counts = useMemo(
    () => ({
      active: MOCK_TRADES.filter((t) => t.status === 'active').length,
      completed: MOCK_TRADES.filter((t) => t.status === 'completed').length,
      disputed: MOCK_TRADES.filter((t) => t.status === 'disputed').length,
    }),
    []
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const tabs: { status: TradeStatus; label: string }[] = [
    { status: 'active', label: 'Activos' },
    { status: 'completed', label: 'Completados' },
    { status: 'disputed', label: 'Disputados' },
  ];

  const emptyMessages: Record<
    TradeStatus,
    { title: string; description?: string; action?: string }
  > = {
    active: { title: 'No tienes trades activos' },
    completed: {
      title: 'Aún no has completado ningún trade',
      action: 'Hacer mi primer trade',
    },
    disputed: { title: 'No tienes disputas' },
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-h3 text-black">Mis Trades</h1>
        <button
          type="button"
          onClick={handleRefresh}
          className={cn(
            'flex items-center justify-center size-9 rounded-full bg-gray-100 hover:bg-gray-200 transition-all active:scale-95',
            isRefreshing && 'animate-spin'
          )}
          aria-label="Actualizar"
        >
          <RefreshCw className="size-4 text-gray-500" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-6">
        {tabs.map(({ status, label }) => (
          <button
            key={status}
            type="button"
            onClick={() => setActiveTab(status)}
            className={cn(
              'flex-1 py-3 rounded-xl font-semibold transition-all text-sm',
              activeTab === status
                ? 'bg-magenta-500 text-white shadow-md shadow-magenta-500/20'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {label}
            {counts[status] > 0 && (
              <span
                className={cn(
                  'ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold',
                  activeTab === status
                    ? 'bg-white/25 text-white'
                    : 'bg-gray-200 text-gray-500'
                )}
              >
                {counts[status]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Trade list */}
      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse"
            >
              <div className="flex justify-between mb-3">
                <div className="h-3 w-32 bg-gray-200 rounded" />
                <div className="h-5 w-20 bg-gray-200 rounded-full" />
              </div>
              <div className="h-4 w-40 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-48 bg-gray-200 rounded mb-3" />
              <div className="border-t border-gray-100 pt-2 flex justify-between">
                <div className="h-3 w-32 bg-gray-200 rounded" />
                <div className="h-3 w-24 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredTrades.length > 0 ? (
        <div className="space-y-3">
          {filteredTrades.map((trade, index) => (
            <FadeIn key={trade.id} delay={index * 0.05}>
              <TradeCard
                trade={trade}
                onTap={() => setSelectedTrade(trade)}
              />
            </FadeIn>
          ))}
        </div>
      ) : (
        <FadeIn>
          <EmptyState
            icon={
              activeTab === 'active' ? (
                <Clock className="w-14 h-14 text-gray-300" />
              ) : activeTab === 'completed' ? (
                <ArrowDownRight className="w-14 h-14 text-gray-300" />
              ) : (
                <AlertTriangle className="w-14 h-14 text-gray-300" />
              )
            }
            title={emptyMessages[activeTab].title}
            description={emptyMessages[activeTab].description}
            actionText={emptyMessages[activeTab].action}
            onAction={
              emptyMessages[activeTab].action
                ? () => router.push('/trade')
                : undefined
            }
          />
        </FadeIn>
      )}

      {/* Trade detail sheet */}
      <TradeDetailSheet
        trade={selectedTrade}
        open={selectedTrade !== null}
        onClose={() => setSelectedTrade(null)}
      />
    </>
  );
}

// ============================================
// MARKETPLACE VIEW (existing — for Market Makers)
// ============================================

function MarketplaceView() {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('sell');
  const [isLoading, setIsLoading] = useState(true);
  const orders = useStore((s) => s.orders);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'buy') {
      return order.type === 'sell' && order.status === 'open';
    } else {
      return order.type === 'buy' && order.status === 'open';
    }
  });

  return (
    <>
      <h1 className="text-h3 text-black mb-6">Marketplace</h1>

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

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
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
    </>
  );
}

// ============================================
// MAIN PAGE (role-aware)
// ============================================

export default function OrdersPage() {
  const { isFreelancer, loading } = useUser();

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse"
          >
            <div className="h-4 w-32 bg-gray-200 rounded mb-3" />
            <div className="h-4 w-48 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return isFreelancer ? <FreelancerTradesView /> : <MarketplaceView />;
}
