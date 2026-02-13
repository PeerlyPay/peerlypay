"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CircleDollarSign, RefreshCw, Shield } from "lucide-react";

const steps = [
  { icon: CircleDollarSign, text: "Buy or sell USDC with pesos" },
  { icon: RefreshCw, text: "Get auto-matched with the best offer" },
  { icon: CircleDollarSign, text: "Receive ARS in minutes" },
];

export default function HowItWorks() {
  const router = useRouter();

  return (
    <section className="flex flex-col gap-4 pt-8 pb-5">
      <div className="px-1">
        <h3 className="font-display text-[22px] font-bold leading-normal text-dark-500">
          How Peerly Pay works
        </h3>
      </div>

      <div className="flex flex-col gap-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="flex items-center gap-3 px-1 py-1">
                <span className="inline-flex size-8 items-center justify-center rounded-lg border border-fuchsia-200 bg-white">
                  <Icon
                    className="size-4 shrink-0 text-primary-500"
                    strokeWidth={1.75}
                  />
                </span>
                <p className="text-base leading-relaxed text-[#0f172a]">
                  {step.text}
                </p>
              </div>
            );
          })}
        </div>

        <Button
          onClick={() => router.push("/trade")}
          size="lg"
          className="h-12 w-full rounded-xl bg-magenta-500 text-base font-semibold text-white hover:bg-magenta-600"
        >
          Make my first trade
        </Button>
      </div>
    </section>
  );
}
