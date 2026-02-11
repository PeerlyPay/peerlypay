'use client';

import { useState, useCallback } from 'react';
import {
  Wallet,
  Clock,
  DollarSign,
  CheckCircle,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SubStep {
  label: string;
  isActive: boolean;
  isComplete: boolean;
}

interface CompactEscrowStepperProps {
  /** 0 = Setup, 1 = Deposit, 2 = Payment, 3 = Confirm, 4 = Complete */
  currentStep: number;
  /** Countdown seconds until next step (null = no countdown) */
  countdown?: number | null;
  /** Whether the step is currently updating */
  isUpdating?: boolean;
  /** Start expanded (default: false = collapsed) */
  defaultExpanded?: boolean;
  /** Current sub-step info for granular progress */
  subStep?: SubStep | null;
}

const steps = [
  {
    id: 0,
    title: 'Setup',
    description: 'Activate USDC Trustline',
    icon: Wallet,
  },
  {
    id: 1,
    title: 'Deposit',
    description: 'Funds locked in escrow',
    icon: Clock,
  },
  {
    id: 2,
    title: 'Payment',
    description: 'Buyer sends fiat',
    icon: DollarSign,
  },
  {
    id: 3,
    title: 'Confirm',
    description: 'Seller confirms receipt',
    icon: CheckCircle,
  },
  {
    id: 4,
    title: 'Complete',
    description: 'USDC released',
    icon: Check,
  },
];

export function CompactEscrowStepper({
  currentStep,
  countdown = null,
  isUpdating = false,
  defaultExpanded = false,
  subStep = null,
}: CompactEscrowStepperProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const currentStepData = steps[currentStep] || steps[0];
  const CurrentIcon = currentStepData.icon;
  const completedSteps = currentStep;
  const totalSteps = steps.length;

  // Progress percentage for the mini bar
  const progressPercent = (completedSteps / (totalSteps - 1)) * 100;

  return (
    <div className="bg-white border-b border-gray-200 overflow-hidden">
      {/* Collapsed State - ~60px compact bar */}
      <button
        type="button"
        onClick={toggleExpanded}
        className={cn(
          'w-full transition-all duration-300 ease-out relative',
          isExpanded ? 'h-0 opacity-0 pointer-events-none' : 'h-[72px] opacity-100'
        )}
        aria-expanded={isExpanded}
        aria-label={`Step ${currentStep + 1} of ${totalSteps}: ${currentStepData.title}. Tap to ${isExpanded ? 'collapse' : 'expand'} details`}
      >
        <div className="max-w-[480px] mx-auto px-4 h-full flex items-center gap-3">
          {/* Current step icon */}
          <div className="relative flex-shrink-0">
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                currentStep === 4
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-500)] text-white'
              )}
            >
              {subStep?.isActive ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CurrentIcon className="w-5 h-5" />
              )}
            </div>
            {/* Pulse ring for active step */}
            {currentStep < 4 && !subStep?.isActive && (
              <div className="absolute inset-0 rounded-full animate-ping bg-[var(--color-primary-500)]/30" />
            )}
          </div>

          {/* Step info */}
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-gray-900 truncate">
                {currentStepData.title}
              </span>
              <span className="text-xs text-gray-400 font-mono">
                {currentStep + 1}/{totalSteps}
              </span>
            </div>

            {/* Sub-step indicator */}
            {subStep ? (
              <div className="flex items-center gap-1.5 mt-0.5">
                <Loader2 className="w-3 h-3 text-[var(--color-primary-500)] animate-spin" />
                <span className="text-xs text-[var(--color-primary-600)] font-medium truncate">
                  {subStep.label}
                </span>
              </div>
            ) : (
              <p className="text-xs text-gray-500 truncate">
                {currentStepData.description}
              </p>
            )}
          </div>

          {/* Timer - Always visible */}
          {countdown !== null && countdown > 0 && currentStep < 4 && (
            <div className="flex-shrink-0 text-right">
              <div className="text-lg font-bold text-[var(--color-primary-600)] font-mono tabular-nums">
                {countdown}s
              </div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wide">
                next step
              </div>
            </div>
          )}

          {/* Expand indicator */}
          <ChevronDown
            className="w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200"
            aria-hidden="true"
          />
        </div>

        {/* Mini progress bar at bottom of collapsed state */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
          <div
            className="h-full bg-gradient-to-r from-[var(--color-primary-500)] to-emerald-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </button>

      {/* Expanded State - Full step list */}
      <div
        className={cn(
          'transition-all duration-300 ease-out overflow-hidden',
          isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="max-w-[480px] mx-auto px-4 py-4">
          {/* Header with collapse button and timer */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={toggleExpanded}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Collapse step details"
            >
              <ChevronUp className="w-4 h-4" />
              <span className="font-medium">Escrow Progress</span>
            </button>

            {/* Timer in expanded view */}
            {countdown !== null && countdown > 0 && currentStep < 4 && (
              <div className="flex items-center gap-2 bg-[var(--color-primary-50)] rounded-full px-3 py-1.5">
                <div className="w-2 h-2 rounded-full bg-[var(--color-primary-500)] animate-pulse" />
                <span className="text-sm font-bold text-[var(--color-primary-600)] font-mono tabular-nums">
                  {countdown}s
                </span>
                <span className="text-xs text-[var(--color-primary-500)]">
                  next step
                </span>
              </div>
            )}

            {isUpdating && (
              <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5">
                <Loader2 className="w-4 h-4 text-[var(--color-primary-500)] animate-spin" />
                <span className="text-xs text-gray-600">Updating...</span>
              </div>
            )}
          </div>

          {/* Vertical step list */}
          <div className="space-y-0">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = step.id < currentStep;
              const isCurrent = step.id === currentStep;
              const isPending = step.id > currentStep;

              return (
                <div key={step.id} className="relative">
                  <div className="flex items-start gap-3">
                    {/* Icon circle */}
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300',
                        isCompleted && 'bg-emerald-500 text-white',
                        isCurrent &&
                          'bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-500)] text-white ring-4 ring-[var(--color-primary-100)]',
                        isPending && 'bg-gray-100 text-gray-400'
                      )}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : isCurrent && subStep?.isActive ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-5">
                      <div
                        className={cn(
                          'font-semibold text-sm transition-colors duration-300',
                          isCompleted && 'text-emerald-600',
                          isCurrent && 'text-[var(--color-primary-600)]',
                          isPending && 'text-gray-400'
                        )}
                      >
                        {step.title}
                      </div>
                      <div
                        className={cn(
                          'text-xs mt-0.5 transition-colors duration-300',
                          isCurrent ? 'text-gray-700' : 'text-gray-500'
                        )}
                      >
                        {step.description}
                      </div>

                      {/* Sub-step detail for current step */}
                      {isCurrent && subStep && (
                        <div className="mt-2 flex items-center gap-2 bg-[var(--color-primary-50)] rounded-lg px-3 py-2 animate-in fade-in slide-in-from-left-2 duration-200">
                          <Loader2 className="w-3.5 h-3.5 text-[var(--color-primary-500)] animate-spin flex-shrink-0" />
                          <span className="text-xs font-medium text-[var(--color-primary-700)]">
                            {subStep.label}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Status indicator */}
                    {isCurrent && !subStep && (
                      <div className="flex-shrink-0">
                        <div className="px-2 py-1 bg-[var(--color-primary-100)] text-[var(--color-primary-700)] text-xs font-medium rounded-full animate-pulse">
                          In progress
                        </div>
                      </div>
                    )}

                    {isCurrent && subStep && (
                      <div className="flex-shrink-0">
                        <div className="px-2 py-1 bg-[var(--color-secondary-100)] text-[var(--color-secondary-700)] text-xs font-medium rounded-full">
                          Processing
                        </div>
                      </div>
                    )}

                    {isCompleted && (
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-emerald-600" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Connecting line */}
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        'absolute left-5 top-10 w-0.5 transition-all duration-300',
                        step.id < currentStep ? 'bg-emerald-500' : 'bg-gray-200',
                        isCurrent && subStep ? 'h-12' : 'h-5'
                      )}
                      style={{ transform: 'translateX(-50%)' }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompactEscrowStepper;
