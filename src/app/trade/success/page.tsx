"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTradeHistory } from "@/contexts/TradeHistoryContext";
import {
  clearVendorPaymentRequest,
  loadVendorPaymentRequest,
} from "@/lib/vendor-payment-request";

// Mock trade data
const MOCK_MAKER = "crypto_trader_ar";
const MOCK_RATE = 1_485;
const FEE_RATE = 0.005;
const MOCK_TXN_ID = "#TXN123456";

function formatFiat(value: number): string {
  return value.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatUsdc(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addTrade } = useTradeHistory();

  const amount = parseFloat(searchParams.get("amount") || "0.11");
  const fillUsdc = parseFloat(searchParams.get("fillUsdc") || String(amount));
  const intentUsdc = parseFloat(
    searchParams.get("intentUsdc") ||
      searchParams.get("requestedAmount") ||
      String(fillUsdc),
  );
  const flowId = searchParams.get("flowId") || "";
  const mode = (searchParams.get("mode") || "buy") as "buy" | "sell";
  const orderId = searchParams.get("orderId") || "";
  const fiatAmount = fillUsdc * MOCK_RATE;
  const feeArs = fillUsdc * FEE_RATE * MOCK_RATE;
  const totalPaid = fiatAmount - feeArs;
  const isAdjustedAmount = Math.abs(intentUsdc - fillUsdc) > 0.0001;

  const [copied, setCopied] = useState(false);
  const [vendorAlias, setVendorAlias] = useState<string | null>(null);

  // Save trade summary once on mount
  useEffect(() => {
    if (!flowId) {
      return;
    }

    const request = loadVendorPaymentRequest(flowId);
    setVendorAlias(request?.alias ?? null);
    clearVendorPaymentRequest(flowId);
  }, [flowId]);

  useEffect(() => {
    const processedKey = `trade_processed_${flowId || orderId || fillUsdc}`;
    const processed = sessionStorage.getItem(processedKey);
    if (processed) return;

    addTrade({
      type: mode,
      amount: fillUsdc,
      arsReceived: totalPaid,
      rate: MOCK_RATE,
      marketMaker: MOCK_MAKER,
      paymentMethod: "MercadoPago",
      txnId: MOCK_TXN_ID,
    });

    sessionStorage.setItem(processedKey, "true");
  }, [addTrade, fillUsdc, flowId, mode, orderId, totalPaid]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(MOCK_TXN_ID);
    } catch {
      // clipboard unavailable
    } finally {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <div className="flex-1 px-4 pb-4 overflow-y-auto">
        <div className="flex flex-col items-center text-center pt-8 pb-6">
          <div className="mb-5 flex size-24 items-center justify-center rounded-full bg-emerald-50">
            <div className="flex items-center justify-center size-16 rounded-full bg-emerald-500">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path
                  d="M9 16.5L14 21.5L23 11.5"
                  stroke="white"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="48"
                  strokeDashoffset="48"
                  className="animate-checkDraw"
                />
              </svg>
            </div>
          </div>

          <h2 className="mb-2 font-[family-name:var(--font-space-grotesk)] text-2xl font-bold text-gray-900">
            You&apos;re all set
          </h2>
          <p className="text-body-sm text-gray-500">
            Your trade is complete and your USDC is ready to use.
          </p>
          {vendorAlias && (
            <p className="mt-2 text-caption text-gray-500">
              Payout sent to @{vendorAlias}
            </p>
          )}
          {isAdjustedAmount && (
            <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              Requested {formatUsdc(intentUsdc)} USDC, executed{" "}
              {formatUsdc(fillUsdc)} USDC.
            </p>
          )}
        </div>

        <div className="flex flex-col items-center space-y-4">
          <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-5 space-y-3 text-center">
            <div className="flex flex-col items-center gap-1">
              <span className="text-body-sm text-gray-500">You received</span>
              <span className="font-[family-name:var(--font-jetbrains-mono)] text-xl font-bold text-emerald-600 tabular-nums">
                {formatUsdc(fillUsdc)} USDC
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-body-sm text-gray-500">You paid</span>
              <span className="font-[family-name:var(--font-jetbrains-mono)] text-sm font-semibold text-gray-900 tabular-nums">
                ${formatFiat(totalPaid)} ARS
              </span>
            </div>

            <div className="border-t border-gray-200 pt-3">
              <div className="flex flex-col items-center gap-2">
                <span className="text-body-sm text-gray-500">
                  Transaction ID
                </span>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-gray-400 tabular-nums">
                    {MOCK_TXN_ID}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className={cn(
                      "flex items-center justify-center size-7 rounded-md transition-all active:scale-95",
                      copied
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-white text-gray-400 hover:text-gray-600 hover:bg-gray-100",
                    )}
                  >
                    {copied ? (
                      <Check className="size-3.5" strokeWidth={2.5} />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push("/orders")}
            className="w-full max-w-sm h-11 rounded-xl font-[family-name:var(--font-space-grotesk)] text-sm font-semibold text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 transition-all active:scale-[0.98]"
          >
            Leave feedback later
          </button>
        </div>
      </div>

      <div className="p-4 pb-6 border-t border-gray-100 space-y-3">
        <button
          type="button"
          onClick={() => router.push("/trade")}
          className="w-full h-14 rounded-2xl font-[family-name:var(--font-space-grotesk)] text-base font-bold text-white bg-fuchsia-500 shadow-lg shadow-fuchsia-500/25 hover:bg-fuchsia-600 transition-all active:scale-[0.98]"
        >
          Start new trade
        </button>
        <button
          type="button"
          onClick={() => router.push("/orders")}
          className="w-full h-12 rounded-2xl font-[family-name:var(--font-space-grotesk)] text-base font-semibold text-gray-500 border border-gray-200 bg-white hover:bg-gray-50 transition-all active:scale-[0.98]"
        >
          View my orders
        </button>
      </div>
    </div>
  );
}

export default function TradeSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">Loading...</div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
