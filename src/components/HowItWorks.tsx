'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const steps = [
  { icon: '💵', text: 'Ingresás el monto en USDC' },
  { icon: '🤝', text: 'Te matcheamos con el mejor vendedor' },
  { icon: '⚡', text: 'Recibís ARS en minutos' },
];

export default function HowItWorks() {
  const router = useRouter();

  return (
    <div className="mt-6 rounded-2xl border border-primary-200 bg-gradient-to-br from-primary-50 via-white to-primary-50 p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xl">📚</span>
        <h3 className="text-h5 text-gray-900">Cómo funciona PeerlyPay</h3>
      </div>

      <div className="space-y-3">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm">
              {step.icon}
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-500 text-xs font-semibold text-white">
                {i + 1}
              </span>
              <p className="text-body-sm text-gray-700">{step.text}</p>
            </div>
          </div>
        ))}
      </div>

      <Button
        onClick={() => router.push('/trade')}
        className="mt-5 w-full rounded-xl bg-magenta-500 py-3 text-white hover:bg-magenta-600"
      >
        Hacer mi primer trade
      </Button>
    </div>
  );
}
