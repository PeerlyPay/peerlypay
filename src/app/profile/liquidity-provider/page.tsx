"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWallet } from "@crossmint/client-sdk-react-ui";
import { ArrowLeft, Loader2, Store } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  confirmFiatPaymentWithCrossmint,
  submitFiatPaymentWithCrossmint,
} from "@/lib/p2p-crossmint";
import { useStore } from "@/lib/store";
import type { Order } from "@/types";

type LpAction = "submit_fiat" | "confirm_fiat" | null;

function getLpAction(order: Order): LpAction {
  if (order.status === "AwaitingPayment" && order.type === "buy") {
    return "submit_fiat";
  }

  if (order.status === "AwaitingConfirmation" && order.type === "sell") {
    return "confirm_fiat";
  }

  return null;
}

export default function LiquidityProviderPage() {
  const router = useRouter();
  const { wallet } = useWallet();

  const orders = useStore((state) => state.orders);
  const user = useStore((state) => state.user);
  const refreshOrdersFromChain = useStore((state) => state.refreshOrdersFromChain);

  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const walletAddress = user.walletAddress;

  const myOrders = useMemo(() => {
    if (!walletAddress) return [];
    return orders.filter((order) => order.createdBy === walletAddress);
  }, [orders, walletAddress]);

  useEffect(() => {
    void refreshOrdersFromChain();
  }, [refreshOrdersFromChain]);

  const handleAction = async (order: Order, action: Exclude<LpAction, null>) => {
    if (!walletAddress) {
      toast.error("Connect your wallet to continue.");
      return;
    }

    setPendingOrderId(order.id);

    try {
      if (action === "submit_fiat") {
        await submitFiatPaymentWithCrossmint({
          wallet,
          caller: walletAddress,
          orderId: order.orderId,
        });
        toast.success("Fiat payment marked as submitted.");
      } else {
        await confirmFiatPaymentWithCrossmint({
          wallet,
          caller: walletAddress,
          orderId: order.orderId,
        });
        toast.success("Fiat payment confirmed. Funds released.");
      }

      await refreshOrdersFromChain();
    } catch (error) {
      console.error("Liquidity provider action failed", error);
      toast.error("Transaction failed. Please try again.");
    } finally {
      setPendingOrderId(null);
    }
  };

  return (
    <div className="space-y-5 py-2 pb-36">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600"
          aria-label="Go back"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div>
          <h1 className="text-h3 text-black">Liquidity Provider</h1>
          <p className="text-sm text-gray-500">Manage your posted orders and payment steps.</p>
        </div>
      </div>

      {!walletAddress && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Connect your wallet to manage LP actions.
        </div>
      )}

      {myOrders.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-6 text-center text-sm text-gray-500">
          You do not have any orders yet.
        </div>
      ) : (
        <div className="space-y-3">
          {myOrders.map((order) => {
            const action = getLpAction(order);
            const isPending = pendingOrderId === order.id;

            return (
              <div key={order.id} className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Order #{order.id}</p>
                    <p className="text-xs text-gray-500">Status: {order.status}</p>
                  </div>
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                    {order.type.toUpperCase()}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <p className="text-gray-500">Amount</p>
                  <p className="text-right font-semibold text-gray-900">
                    {order.remainingAmount.toFixed(2)} USDC
                  </p>
                  <p className="text-gray-500">Rate</p>
                  <p className="text-right font-semibold text-gray-900">
                    1 USDC = {order.rate.toLocaleString("en-US")} {order.fiatCurrencyLabel}
                  </p>
                  <p className="text-gray-500">Method</p>
                  <p className="text-right font-semibold text-gray-900">{order.paymentMethodLabel}</p>
                </div>

                {action ? (
                  <Button
                    type="button"
                    onClick={() => handleAction(order, action)}
                    disabled={isPending || !walletAddress}
                    className="mt-4 h-11 w-full rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-70"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Processing...
                      </>
                    ) : action === "submit_fiat" ? (
                      "Submit Fiat Payment"
                    ) : (
                      "Confirm Fiat Received"
                    )}
                  </Button>
                ) : (
                  <p className="mt-4 text-xs text-gray-500">No payment action needed for this status.</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="fixed bottom-[76px] left-1/2 z-30 w-full max-w-120 -translate-x-1/2 px-4">
        <Link
          href="/orders/post-offer"
          className="mx-auto inline-flex h-11 w-full max-w-md items-center justify-center gap-2 rounded-xl border border-primary-200 bg-primary-50 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-100"
        >
          <Store className="size-4" />
          Post a Sell Offer
        </Link>
      </div>
    </div>
  );
}
