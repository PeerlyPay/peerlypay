'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AlertTriangle, Copy, Loader2, Check, Star, RefreshCw, Wallet, Banknote, CircleCheck, PartyPopper } from 'lucide-react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import EscrowStepper from '@/components/EscrowStepper';
import ChatBox, { type Message } from '@/components/ChatBox';
import FadeIn from '@/components/FadeIn';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import type { OrderStatus } from '@/types';

const BANK_DETAILS = [
  { label: 'Bank', value: 'Banco Galicia' },
  { label: 'Account', value: '1234-5678-9012' },
  { label: 'CBU', value: '0123456789012345678901' },
  { label: 'Name', value: 'Juan Pérez' },
];

function addSystemMessage(messages: Message[], text: string): Message[] {
  return [
    ...messages,
    {
      id: `sys-${Date.now()}`,
      sender: 'system',
      text,
      timestamp: new Date(),
    },
  ];
}

interface OrderDetailClientProps {
  orderId: string;
}

export default function OrderDetailClient({ orderId }: OrderDetailClientProps) {
  const router = useRouter();
  const orders = useStore((s) => s.orders);
  const user = useStore((s) => s.user);
  const updateOrderStatus = useStore((s) => s.updateOrderStatus);

  const [simStep, setSimStep] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);

  const order = useMemo(
    () => orders.find((o) => o.id === orderId),
    [orders, orderId]
  );

  const isSeller =
    order &&
    ((order.type === 'sell' && user.walletAddress === order.createdBy) ||
      (order.type === 'buy' && user.walletAddress !== order.createdBy));
  const isBuyer =
    order &&
    ((order.type === 'buy' && user.walletAddress === order.createdBy) ||
      (order.type === 'sell' && user.walletAddress !== order.createdBy));

  const handleCopy = (label: string, value: string) => {
    navigator.clipboard?.writeText(value);
    toast.success(`${label} copied`);
  };

  const handleSendMessage = useCallback(
    (text: string) => {
      const newMessage: Message = {
        id: Date.now().toString(),
        sender: user.walletAddress || '',
        text,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);
      toast.success('Message sent');
    },
    [user.walletAddress]
  );

  useEffect(() => {
    if (order && messages.length === 0) {
      setMessages([
        {
          id: '1',
          sender: order.createdBy,
          text: 'Hello! I have the funds ready in escrow.',
          timestamp: new Date(Date.now() - 3600000),
        },
        {
          id: '2',
          sender: user.walletAddress || '',
          text: 'Great! I will send the bank transfer now.',
          timestamp: new Date(Date.now() - 1800000),
        },
      ]);
    }
  }, [order?.id, order?.createdBy, user.walletAddress]);

  // Auto-advance demo: 3s countdown per step, then advance (regardless of role for demo)
  useEffect(() => {
    if (simStep >= 4 || isUpdating) {
      setCountdown(null);
      return;
    }
    setCountdown(3);
    const id = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(id);
          if (simStep === 0) advanceToStep1();
          else if (simStep === 1) advanceToStep2();
          else if (simStep === 2) advanceToStep3();
          else if (simStep === 3) advanceToStep4();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [simStep, isUpdating]);

  const advanceToStep1 = async () => {
    setIsUpdating(true);
    await new Promise((r) => setTimeout(r, 500));
    setMessages((prev) => addSystemMessage(prev, 'Trustline activated. You can now receive USDC.'));
    setSimStep(1);
    toast.success('Trustline activated! Proceed to deposit.');
    setIsUpdating(false);
  };

  const advanceToStep2 = async () => {
    setIsUpdating(true);
    await new Promise((r) => setTimeout(r, 500));
    setMessages((prev) =>
      addSystemMessage(
        addSystemMessage(prev, 'Funds deposited in escrow'),
        'Buyer has 10 seconds to send payment.'
      )
    );
    setSimStep(2);
    toast.success('Deposit confirmed! Waiting for payment...');
    setIsUpdating(false);
  };

  const advanceToStep3 = async () => {
    setIsUpdating(true);
    await new Promise((r) => setTimeout(r, 500));
    setMessages((prev) =>
      addSystemMessage(prev, 'Buyer marked payment as sent.')
    );
    setSimStep(3);
    toast.info('Payment marked. Waiting for seller confirmation...');
    setIsUpdating(false);
  };

  const advanceToStep4 = async () => {
    setIsUpdating(true);
    await new Promise((r) => setTimeout(r, 500));
    setMessages((prev) =>
      addSystemMessage(prev, 'USDC released successfully!')
    );
    if (order) updateOrderStatus(order.id, 'completed');
    setSimStep(4);
    toast.success('Funds released! Trade completed 🎉');
    setIsUpdating(false);
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-[480px] mx-auto px-4 pt-20 pb-24">
          <p className="text-center text-gray-600">Order not found</p>
          <Button
            variant="outline"
            className="mt-4 w-full transition-all duration-200"
            onClick={() => router.push('/orders')}
          >
            Back to Marketplace
          </Button>
        </main>
        <BottomNav />
      </div>
    );
  }

  const total = order.amount * order.rate;

  const stepConfig = () => {
    if (simStep === 0) return { label: 'Setup', sub: 'Activate Trustline', icon: Wallet };
    if (simStep === 1) return { label: 'Deposit', sub: 'Confirm escrow', icon: Banknote };
    if (simStep === 2) return { label: 'Payment', sub: 'Waiting for payment', icon: RefreshCw };
    if (simStep === 3) return { label: 'Confirm', sub: 'Confirm receipt', icon: CircleCheck };
    return { label: 'Completed', sub: 'Trade complete', icon: PartyPopper };
  };

  const stepInfo = stepConfig();
  const StatusIcon = stepInfo.icon;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-[480px] mx-auto px-4 pt-20 pb-24 space-y-6">
        {/* Top row: Status badge + countdown */}
        <FadeIn>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border-2 border-primary-200 bg-white px-4 py-2.5 shadow-sm">
              <StatusIcon className="size-5 shrink-0 text-primary-600" />
              <div>
                <p className="text-body font-semibold text-dark-500">
                  {simStep < 4 ? 'In progress' : 'Complete'} — {stepInfo.label}
                </p>
                <p className="text-body-sm text-gray-500">{stepInfo.sub}</p>
              </div>
            </div>
            {simStep < 4 && countdown !== null && !isUpdating && (
              <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1.5 text-body-sm text-gray-500">
                Next step in: <span className="font-mono font-semibold text-gray-700">{countdown}…</span>
              </span>
            )}
          </div>
        </FadeIn>

        <FadeIn delay={0.03}>
          <div className="mb-2">
            <EscrowStepper currentStep={simStep} orderStatus={order.status} />
          </div>
        </FadeIn>
        {simStep === 2 && (
          <p className="text-body-sm text-gray-500 -mt-2">
            Payment window: <span className="font-mono font-semibold text-gray-700">10 seconds</span>
          </p>
        )}

        {simStep === 0 && (
          <FadeIn delay={0.1}>
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-body text-gray-700 mb-6">
                You need to activate USDC Trustline to receive tokens.
              </p>
              <Button
                disabled={isUpdating}
                className="w-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 py-4 text-body font-bold text-white hover:opacity-90 transition-all duration-200 disabled:opacity-70"
                onClick={advanceToStep1}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 size-5 animate-spin" />
                    Activating...
                  </>
                ) : (
                  'Activate Trustline'
                )}
              </Button>
            </div>
          </FadeIn>
        )}

        {simStep >= 1 && simStep < 4 && (
          <>
            <FadeIn delay={0.1}>
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="grid gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-body-sm font-medium text-gray-600">Seller</span>
                    <span className="text-body font-semibold text-dark-500 font-mono">
                      {order.type === 'sell' ? `${order.createdBy.slice(0, 6)}...${order.createdBy.slice(-4)}` : '—'}
                    </span>
                  </div>
                  <div
                    className="text-body-sm text-cyan-700 bg-cyan-50 rounded-lg px-3 py-2 cursor-pointer hover:bg-cyan-100/80 transition-colors"
                    role="button"
                    tabIndex={0}
                    onClick={() => toast.info('Trade history coming soon')}
                    onKeyDown={(e) => e.key === 'Enter' && toast.info('Trade history coming soon')}
                  >
                    ⭐ {order.reputation_score ?? 0} completed trades | 100% completion rate
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-body-sm font-medium text-gray-600">Buyer</span>
                    <span className="text-body font-semibold text-dark-500 font-mono">
                      {order.type === 'buy' ? `${order.createdBy.slice(0, 6)}...${order.createdBy.slice(-4)}` : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                    <span className="text-body-sm font-medium text-gray-600">Amount</span>
                    <span className="text-h4 text-primary-600 font-[family-name:var(--font-space-grotesk)]">
                      {order.amount.toLocaleString()} USDC
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-body-sm font-medium text-gray-600">Rate</span>
                    <span className="text-body font-semibold text-dark-500">
                      {order.rate.toLocaleString()} {order.currency} per USDC
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-body-sm font-medium text-gray-600">Total</span>
                    <span className="text-h4 text-primary-600 font-[family-name:var(--font-space-grotesk)]">
                      {total.toLocaleString()} {order.currency}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-body-sm font-medium text-gray-600">Payment method</span>
                    <span className="text-body font-semibold text-dark-500">{order.paymentMethod}</span>
                  </div>
                </div>
              </div>
            </FadeIn>

            {simStep >= 2 && (
              <FadeIn delay={0.12}>
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-h5 text-gray-800 mb-4 font-[family-name:var(--font-space-grotesk)]">Payment Details</h3>
                  <div className="space-y-3">
                    {BANK_DETAILS.map(({ label, value }) => (
                      <div
                        key={label}
                        className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-4 py-3"
                      >
                        <div>
                          <p className="text-body-sm font-medium text-gray-600">{label}</p>
                          <p className="font-mono text-body font-semibold text-dark-500">{value}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(label, value)}
                          className="rounded-lg p-2 text-gray-500 hover:bg-gray-200 transition-colors"
                          aria-label={`Copy ${label}`}
                        >
                          <Copy className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            )}

            <FadeIn delay={0.15}>
              <div className="w-full">
                <ChatBox
                  orderId={order.id}
                  messages={messages}
                  onSendMessage={handleSendMessage}
                />
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="space-y-3">
                {order.status === 'disputed' && (
                  <Button
                    disabled={isUpdating}
                    className="w-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 py-4 text-body font-bold text-white hover:opacity-90 transition-all duration-200 disabled:opacity-70"
                    onClick={async () => {
                      setIsUpdating(true);
                      await new Promise((r) => setTimeout(r, 500));
                      toast.error('Dispute opened. Support will review...');
                      setIsUpdating(false);
                    }}
                  >
                    {isUpdating ? <Loader2 className="mr-2 size-5 animate-spin" /> : <AlertTriangle className="mr-2 size-5" />}
                    Contact Support
                  </Button>
                )}
                {simStep === 1 && isSeller && (
                  <Button
                    disabled={isUpdating}
                    className="w-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 py-4 text-body font-bold text-white hover:opacity-90 transition-all duration-200 disabled:opacity-70"
                    onClick={advanceToStep2}
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 size-5 animate-spin" />
                        Confirming...
                      </>
                    ) : (
                      'Confirm Deposit'
                    )}
                  </Button>
                )}
                {simStep === 2 && isBuyer && (
                  <Button
                    disabled={isUpdating}
                    className="w-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 py-4 text-body font-bold text-white hover:opacity-90 transition-all duration-200 disabled:opacity-70"
                    onClick={advanceToStep3}
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 size-5 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Mark as Paid'
                    )}
                  </Button>
                )}
                {simStep === 2 && isSeller && (
                  <Button
                    disabled
                    variant="outline"
                    className="w-full rounded-full py-4 text-body font-semibold text-gray-400 cursor-not-allowed"
                  >
                    Waiting for buyer...
                  </Button>
                )}
                {simStep === 3 && isSeller && (
                  <Button
                    disabled={isUpdating}
                    className="w-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 py-4 text-body font-bold text-white hover:opacity-90 transition-all duration-200 disabled:opacity-70"
                    onClick={advanceToStep4}
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 size-5 animate-spin" />
                        Releasing...
                      </>
                    ) : (
                      'Confirm Payment Received'
                    )}
                  </Button>
                )}
                {simStep === 3 && isBuyer && (
                  <Button
                    disabled
                    variant="outline"
                    className="w-full rounded-full py-4 text-body font-semibold text-gray-400 cursor-not-allowed"
                  >
                    Waiting for seller to confirm...
                  </Button>
                )}
              </div>
            </FadeIn>
          </>
        )}

        {simStep === 4 && (
          <FadeIn>
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500 text-white">
                <Check className="size-10" strokeWidth={2.5} />
              </div>
              <h2 className="text-h3 text-gray-900 mb-2 font-[family-name:var(--font-space-grotesk)]">Trade completed</h2>
              <p className="text-body text-gray-600 mb-8">
                USDC has been released. Thank you for using PeerlyPay.
              </p>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-left mb-8">
                <p className="text-body-sm font-medium text-gray-600 mb-4">Transaction summary</p>
                <div className="grid gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-body-sm font-medium text-gray-600">Amount</span>
                    <span className="text-h4 text-primary-600 font-[family-name:var(--font-space-grotesk)]">
                      {order.amount.toLocaleString()} USDC
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-body-sm font-medium text-gray-600">Total</span>
                    <span className="text-h4 text-primary-600 font-[family-name:var(--font-space-grotesk)]">
                      {total.toLocaleString()} {order.currency}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-body-sm font-medium text-gray-600">Payment</span>
                    <span className="text-body font-semibold text-dark-500">{order.paymentMethod}</span>
                  </div>
                </div>
              </div>
              <div className="mb-8">
                <p className="text-body-sm font-semibold text-gray-700 mb-3">Rate your experience</p>
                <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 rounded transition-colors"
                      aria-label={`${star} stars`}
                    >
                      <Star
                        className={`size-8 ${
                          star <= (hoverRating || rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  className="w-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 py-4 text-body font-bold text-white hover:opacity-90"
                  onClick={() => router.push('/orders')}
                >
                  Back to Marketplace
                </Button>
                <Button
                  variant="outline"
                  className="w-full rounded-full py-4 text-body font-semibold border-2 border-gray-200"
                  onClick={() => toast.info('Receipt view coming soon')}
                >
                  View Receipt
                </Button>
              </div>
            </div>
          </FadeIn>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
