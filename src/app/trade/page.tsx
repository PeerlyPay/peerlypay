"use client";

import { Suspense } from "react";
import QuickTradeInput from "@/components/QuickTradeInput";

export default function TradePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          Cargando...
        </div>
      }
    >
      <QuickTradeInput />
    </Suspense>
  );
}
