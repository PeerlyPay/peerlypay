'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CircleDollarSign, RefreshCw, Shield } from 'lucide-react';

const steps = [
  { icon: CircleDollarSign, text: 'Buy or sell USDC with pesos' },
  { icon: RefreshCw, text: 'Get auto-matched with the best offer' },
  { icon: Shield, text: 'Your payment is secured with escrow' },
  { icon: CircleDollarSign, text: 'Receive ARS in minutes' },
];

export default function HowItWorks() {
  const router = useRouter();

  return (
    <section className="flex flex-col gap-6 py-3">
      <div className="px-4">
        <h3 className="font-display text-[21px] font-bold leading-normal text-dark-500">
          How Peerly Pay works
        </h3>
      </div>

      <div className="flex flex-col gap-6 rounded-md border border-[#e5e5e5] bg-white px-4 py-6 shadow-[0px_4px_4px_0px_rgba(174,174,174,0.25)]">
        <div className="flex flex-col gap-3">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="flex items-center gap-1.5">
                <Icon className="size-4 shrink-0 text-primary-500" strokeWidth={1.5} />
                <p className="text-[15px] leading-[1.5] text-[#0f172a]">
                  {step.text}
                </p>
              </div>
            );
          })}
        </div>

        <Button
          onClick={() => router.push('/trade')}
          size="lg"
          className="w-full rounded-md bg-magenta-500 text-white hover:bg-magenta-600"
        >
          Make my first trade
        </Button>
      </div>
    </section>
  );
}
