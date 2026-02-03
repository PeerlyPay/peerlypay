'use client';

import { Check, Clock, Wallet } from 'lucide-react';
import type { OrderStatus } from '@/types';

export interface EscrowStepperProps {
  /** 0 = Setup, 1 = Deposit, 2 = Payment, 3 = Confirm, 4 = Complete */
  currentStep: number;
  orderStatus: OrderStatus;
}

const steps = [
  { number: 0, label: 'Setup', description: 'Activate USDC Trustline', Icon: Wallet },
  { number: 1, label: 'Deposit', description: 'Funds locked in escrow', Icon: Clock },
  { number: 2, label: 'Payment', description: 'Buyer sends fiat', Icon: Clock },
  { number: 3, label: 'Confirm', description: 'Seller confirms receipt', Icon: Clock },
  { number: 4, label: 'Complete', description: 'USDC released', Icon: Clock },
];

export default function EscrowStepper({ currentStep }: EscrowStepperProps) {
  return (
    <div className="relative flex w-full items-start gap-0">
      {/* Connecting line (full track) */}
      <div
        className="absolute left-0 right-0 top-6 border-t-2 border-gray-200"
        style={{ marginLeft: '20px', marginRight: '20px', width: 'calc(100% - 40px)' }}
        aria-hidden
      />

      {/* Progress line (filled up to current step) */}
      <div
        className="absolute left-0 top-6 border-t-2 border-lime-500 transition-all duration-300"
        style={{
          marginLeft: '20px',
          width:
            currentStep <= 0
              ? '0'
              : `calc((100% - 40px) * ${currentStep / 4})`,
        }}
        aria-hidden
      />

      {steps.map((step) => {
        const isCompleted = step.number < currentStep;
        const isActive = step.number === currentStep;
        const isPending = step.number > currentStep;
        const Icon = step.Icon;

        return (
          <div
            key={step.number}
            className="relative z-10 flex flex-1 flex-col items-center min-w-0"
          >
            <div
              className={`
                flex h-10 w-10 shrink-0 items-center justify-center rounded-full
                ${isCompleted ? 'bg-lime-500 text-white' : ''}
                ${isActive ? 'bg-primary-500 text-white animate-pulse' : ''}
                ${isPending ? 'bg-gray-200 text-gray-400' : ''}
              `}
            >
              {isCompleted ? (
                <Check className="size-5" />
              ) : isActive ? (
                <Icon className="size-5" />
              ) : (
                <span className="text-sm font-semibold">{step.number + 1}</span>
              )}
            </div>
            <span className="mt-1.5 text-center text-xs font-semibold truncate w-full px-0.5">
              {step.label}
            </span>
            <span className="mt-0.5 text-center text-[10px] text-gray-500 truncate w-full px-0.5 leading-tight">
              {step.description}
            </span>
          </div>
        );
      })}
    </div>
  );
}
