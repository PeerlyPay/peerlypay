'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MiniProgressBarProps {
  /** 0 = Setup, 1 = Deposit, 2 = Payment, 3 = Confirm, 4 = Complete */
  currentStep: number;
}

const steps = [
  { id: 0, label: 'Setup', shortLabel: 'Setup' },
  { id: 1, label: 'Deposit', shortLabel: 'Deposit' },
  { id: 2, label: 'Payment', shortLabel: 'Pay' },
  { id: 3, label: 'Confirm', shortLabel: 'Confirm' },
  { id: 4, label: 'Complete', shortLabel: 'Done' },
];

export function MiniProgressBar({ currentStep }: MiniProgressBarProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between max-w-[480px] mx-auto">
        {steps.map((step, index) => {
          const isComplete = step.id < currentStep;
          const isActive = step.id === currentStep;
          const isPending = step.id > currentStep;

          return (
            <React.Fragment key={step.id}>
              {/* Step circle and label */}
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300',
                    isComplete && 'bg-emerald-500 text-white',
                    isActive && 'bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-500)] text-white ring-4 ring-[var(--color-primary-100)]',
                    isPending && 'bg-gray-200 text-gray-400'
                  )}
                >
                  {isComplete ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    step.id + 1
                  )}
                </div>

                {/* Step label - show current on mobile, all on desktop */}
                <span
                  className={cn(
                    'text-xs font-medium transition-colors duration-300',
                    isComplete && 'text-emerald-600',
                    isActive && 'text-[var(--color-primary-600)]',
                    isPending && 'text-gray-400',
                    isActive ? 'block' : 'hidden sm:block'
                  )}
                >
                  {step.shortLabel}
                </span>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-1 mx-1 rounded-full transition-all duration-300',
                    isComplete ? 'bg-emerald-500' : 'bg-gray-200'
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default MiniProgressBar;
