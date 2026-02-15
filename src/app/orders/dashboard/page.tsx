"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw } from "lucide-react";
import type { ChainOrder } from "@/types";
import { fiatCurrencyLabel, paymentMethodLabel } from "@/lib/order-mapper";
import { loadChainOrdersFromContract } from "@/lib/p2p-orders";

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
      ) : orders.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-6 text-sm text-gray-500">
          No orders found on contract.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full min-w-[1100px] text-left text-xs">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-3 py-2 font-medium">Order ID</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">From Crypto</th>
                <th className="px-3 py-2 font-medium">Creator</th>
                <th className="px-3 py-2 font-medium">Filler</th>
                <th className="px-3 py-2 font-medium">Amount</th>
                <th className="px-3 py-2 font-medium">Rate</th>
                <th className="px-3 py-2 font-medium">Fiat</th>
                <th className="px-3 py-2 font-medium">Payment</th>
                <th className="px-3 py-2 font-medium">Created</th>
                <th className="px-3 py-2 font-medium">Deadline</th>
                <th className="px-3 py-2 font-medium">Fiat Deadline</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.order_id.toString()}
                  className="border-t border-gray-100 align-top text-gray-700"
                >
                  <td className="px-3 py-2 font-mono">
                    {order.order_id.toString()}
                  </td>
                  <td className="px-3 py-2">{order.status}</td>
                  <td className="px-3 py-2">
                    {order.from_crypto ? "true" : "false"}
                  </td>
                  <td
                    className="max-w-[180px] truncate px-3 py-2 font-mono"
                    title={order.creator}
                  >
                    {order.creator}
                  </td>
                  <td
                    className="max-w-[180px] truncate px-3 py-2 font-mono"
                    title={order.filler ?? ""}
                  >
                    {order.filler ?? "-"}
                  </td>
                  <td className="px-3 py-2 font-mono">
                    {order.amount.toString()}
                  </td>
                  <td className="px-3 py-2 font-mono">
                    {order.exchange_rate.toString()}
                  </td>
                  <td className="px-3 py-2">
                    {order.fiat_currency_code} (
                    {fiatCurrencyLabel(order.fiat_currency_code)})
                  </td>
                  <td className="px-3 py-2">
                    {order.payment_method_code} (
                    {paymentMethodLabel(order.payment_method_code)})
                  </td>
                  <td className="px-3 py-2">
                    {formatTimestamp(order.created_at)}
                  </td>
                  <td className="px-3 py-2">
                    {formatTimestamp(order.deadline)}
                  </td>
                  <td className="px-3 py-2">
                    {formatTimestamp(order.fiat_transfer_deadline)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
