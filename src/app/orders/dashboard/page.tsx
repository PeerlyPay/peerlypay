"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw } from "lucide-react";
import type { ChainOrder } from "@/types";
import { fiatCurrencyLabel, paymentMethodLabel } from "@/lib/order-mapper";
import { loadChainOrdersFromContract } from "@/lib/p2p";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

function formatTimestamp(timestamp?: number): string {
  if (!timestamp) {
    return "-";
  }

  return new Date(timestamp * 1000).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OrdersDashboardPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<ChainOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<ChainOrder | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    setIsRefreshing(true);

    try {
      const nextOrders = await loadChainOrdersFromContract();
      setOrders(nextOrders);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Failed to load contract orders",
      );
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => Number(b.order_id - a.order_id)),
    [orders],
  );

  const formatTokenAmount = (value: bigint) => {
    return value.toString();
  };

  const formatAddress = (value: string | null | undefined) => {
    if (!value) return "-";
    if (value.length <= 14) return value;
    return `${value.slice(0, 6)}...${value.slice(-4)}`;
  };

  const sideLabel = (fromCrypto: boolean) => (fromCrypto ? "CRYPTO" : "FIAT");

  const statusBadgeClass = (status: ChainOrder["status"]) => {
    if (status === "Completed") {
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    if (status === "Disputed" || status === "Cancelled" || status === "Refunded") {
      return "border-red-200 bg-red-50 text-red-700";
    }

    return "border-primary-200 bg-primary-50 text-primary-700";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/orders")}
            className="inline-flex size-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            aria-label="Back to orders"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h1 className="text-h4 text-black">Orders Dashboard</h1>
            <p className="text-xs text-gray-500">
              Detailed on-chain order data
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void refresh()}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw
            className={`size-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-6 text-sm text-gray-500">
          Loading contract orders...
        </div>
      ) : sortedOrders.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-6 text-sm text-gray-500">
          No orders found on contract.
        </div>
      ) : (
        <div className="space-y-3">
          {sortedOrders.map((order) => (
            <button
              key={order.order_id.toString()}
              type="button"
              onClick={() => setSelectedOrder(order)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-left transition-all hover:border-primary-200 hover:shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-gray-900">Order #{order.order_id.toString()}</span>
                <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusBadgeClass(order.status)}`}>
                  {order.status}
                </span>
              </div>

              <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-600">
                <span className="rounded-full bg-gray-100 px-2 py-1 font-semibold text-gray-700">
                  {sideLabel(order.from_crypto)}
                </span>
                <span>Creator {formatAddress(order.creator)}</span>
              </div>

              <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                <p className="text-gray-500">
                  Remaining{' '}
                  <span className="font-semibold text-gray-900">{formatTokenAmount(order.remaining_amount)}</span>
                </p>
                <p className="text-right text-gray-500">
                  Rate{' '}
                  <span className="font-semibold text-gray-900">
                    {order.exchange_rate.toString()} {fiatCurrencyLabel(order.fiat_currency_code)}
                  </span>
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      <Drawer open={selectedOrder !== null} onOpenChange={(open) => !open && setSelectedOrder(null)} direction="bottom">
        <DrawerContent className="inset-x-0 mx-auto w-[calc(100%-2rem)] max-w-120 rounded-t-2xl border-gray-200 bg-white p-0">
          {selectedOrder && (
            <div className="space-y-5 px-5 pb-8 pt-4">
              <DrawerHeader className="space-y-1 px-0 pt-0">
                <DrawerTitle className="font-[family-name:var(--font-space-grotesk)] text-lg">
                  Order #{selectedOrder.order_id.toString()}
                </DrawerTitle>
                <DrawerDescription className="text-xs text-gray-500">
                  Full on-chain order details
                </DrawerDescription>
              </DrawerHeader>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <span className={`rounded-full border px-2.5 py-1 text-center font-medium ${statusBadgeClass(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-center font-semibold text-gray-700">
                  {sideLabel(selectedOrder.from_crypto)}
                </span>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Amounts</p>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <p className="text-gray-500">Amount</p>
                  <p className="text-right font-mono text-gray-900">{selectedOrder.amount.toString()}</p>
                  <p className="text-gray-500">Remaining</p>
                  <p className="text-right font-mono text-gray-900">{selectedOrder.remaining_amount.toString()}</p>
                  <p className="text-gray-500">Filled</p>
                  <p className="text-right font-mono text-gray-900">{selectedOrder.filled_amount.toString()}</p>
                  <p className="text-gray-500">Active fill</p>
                  <p className="text-right font-mono text-gray-900">{selectedOrder.active_fill_amount?.toString() ?? '-'}</p>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Market</p>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <p className="text-gray-500">Exchange rate</p>
                  <p className="text-right font-mono text-gray-900">{selectedOrder.exchange_rate.toString()}</p>
                  <p className="text-gray-500">Fiat currency</p>
                  <p className="text-right text-gray-900">
                    {selectedOrder.fiat_currency_code} ({fiatCurrencyLabel(selectedOrder.fiat_currency_code)})
                  </p>
                  <p className="text-gray-500">Payment method</p>
                  <p className="text-right text-gray-900">
                    {selectedOrder.payment_method_code} ({paymentMethodLabel(selectedOrder.payment_method_code)})
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Participants</p>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-gray-500">Creator</p>
                    <p className="break-all font-mono text-gray-900">{selectedOrder.creator}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Filler</p>
                    <p className="break-all font-mono text-gray-900">{selectedOrder.filler ?? '-'}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Timing</p>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <p className="text-gray-500">Created</p>
                  <p className="text-right text-gray-900">{formatTimestamp(selectedOrder.created_at)}</p>
                  <p className="text-gray-500">Deadline</p>
                  <p className="text-right text-gray-900">{formatTimestamp(selectedOrder.deadline)}</p>
                  <p className="text-gray-500">Fiat deadline</p>
                  <p className="text-right text-gray-900">{formatTimestamp(selectedOrder.fiat_transfer_deadline)}</p>
                </div>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
