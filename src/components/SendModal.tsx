'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { VendorPaymentRail } from '@/types';
import { findBestMatch } from '@/lib/match-order';
import { useStore } from '@/lib/store';
import { saveVendorPaymentRequest } from '@/lib/vendor-payment-request';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '@/components/ui/drawer';

const STELLAR_PUBLIC_KEY_REGEX = /^G[A-Z2-7]{55}$/;

interface SendModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableUsdc: number;
  onSend: (amount: number) => boolean;
}

type SendMode = 'wallet' | 'vendor';

function shortenAddress(address: string) {
  if (address.length <= 14) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function SendModal({
  isOpen,
  onClose,
  availableUsdc,
  onSend,
}: SendModalProps) {
  const router = useRouter();
  const walletAddress = useStore((state) => state.user.walletAddress);
  const orders = useStore((state) => state.orders);
  const [mode, setMode] = useState<SendMode>('wallet');
  const [recipient, setRecipient] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [memo, setMemo] = useState('');
  const [vendorAlias, setVendorAlias] = useState('');
  const [vendorRail, setVendorRail] = useState<VendorPaymentRail>('bank_transfer');
  const [vendorDestination, setVendorDestination] = useState('');
  const [isSending, setIsSending] = useState(false);
  const bodyScrollRef = useRef<HTMLDivElement | null>(null);

  const parsedAmount = useMemo(() => Number.parseFloat(amountInput), [amountInput]);

  const resetForm = () => {
    setMode('wallet');
    setRecipient('');
    setAmountInput('');
    setMemo('');
    setVendorAlias('');
    setVendorRail('bank_transfer');
    setVendorDestination('');
    setIsSending(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      if (bodyScrollRef.current) {
        bodyScrollRef.current.scrollTop = 0;
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [isOpen]);

  const recipientTrimmed = recipient.trim();
  const memoTrimmed = memo.trim();
  const vendorAliasTrimmed = vendorAlias.trim();
  const vendorDestinationTrimmed = vendorDestination.trim();
  const hasAmount = Number.isFinite(parsedAmount) && parsedAmount > 0;
  const isRecipientValid = STELLAR_PUBLIC_KEY_REGEX.test(recipientTrimmed);
  const hasEnoughBalance = hasAmount && parsedAmount <= availableUsdc;
  const isVendorFormValid = vendorAliasTrimmed.length > 0 && vendorDestinationTrimmed.length > 0;

  const canSubmit = mode === 'wallet'
    ? isRecipientValid && hasEnoughBalance && !isSending
    : isVendorFormValid && hasEnoughBalance && !isSending;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!hasAmount) {
      toast.error('Enter a valid amount greater than 0');
      return;
    }

    if (!hasEnoughBalance) {
      toast.error('Insufficient USDC balance');
      return;
    }

    if (mode === 'wallet') {
      if (!recipientTrimmed) {
        toast.error('Recipient wallet address is required');
        return;
      }

      if (!isRecipientValid) {
        toast.error('Enter a valid Stellar public address');
        return;
      }

      setIsSending(true);
      const didSend = onSend(parsedAmount);

      if (!didSend) {
        toast.error('Send failed. Please try again');
        setIsSending(false);
        return;
      }

      toast.success(
        memoTrimmed
          ? `Sent ${parsedAmount.toFixed(2)} USDC to ${shortenAddress(recipientTrimmed)} with memo`
          : `Sent ${parsedAmount.toFixed(2)} USDC to ${shortenAddress(recipientTrimmed)}`,
      );
      handleClose();
      return;
    }

    if (!vendorAliasTrimmed) {
      toast.error('Vendor alias is required');
      return;
    }

    if (!vendorDestinationTrimmed) {
      toast.error('Vendor destination is required');
      return;
    }

    setIsSending(true);
    if (!walletAddress) {
      toast.error('Connect wallet first');
      setIsSending(false);
      return;
    }

    const caller = walletAddress ?? '';
    const match = findBestMatch(orders, parsedAmount, 'sell', caller);

    if (!match) {
      toast.error('No active BUY order can cover this amount right now');
      setIsSending(false);
      return;
    }

    const flowId = crypto.randomUUID();
    const orderId = match.matchedOrder.orderId.toString();

    saveVendorPaymentRequest(flowId, {
      alias: vendorAliasTrimmed,
      rail: vendorRail,
      destination: vendorDestinationTrimmed,
    });

    const railLabel =
      vendorRail === 'bank_transfer'
        ? 'Bank Transfer'
        : vendorRail === 'mobile_wallet'
          ? 'Mobile Wallet'
          : 'Cash Pickup';

    toast.success(
      `Matched ${parsedAmount.toFixed(2)} USDC. Buyer will pay @${vendorAliasTrimmed} via ${railLabel}`,
    );
    router.push(
      `/trade/confirm?flowId=${encodeURIComponent(flowId)}&fillUsdc=${parsedAmount.toFixed(2)}&intentUsdc=${parsedAmount.toFixed(2)}&mode=sell&orderId=${encodeURIComponent(orderId)}`,
    );
  };

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
      direction="bottom"
    >
      <DrawerContent className="inset-x-0 mx-auto flex max-h-[90dvh] w-[calc(100%-2rem)] max-w-120 flex-col overflow-hidden rounded-t-3xl border-gray-200 bg-white p-0">
        <DrawerHeader className="border-b border-gray-100 px-4 pb-3 pt-4 text-left">
          <div className="flex items-center justify-between">
            <DrawerTitle className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold text-gray-900">
              Send
            </DrawerTitle>
            <button
              type="button"
              onClick={handleClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200"
              aria-label="Close"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>
          </div>
          <DrawerDescription className="text-xs text-gray-500">
            Use wallet transfer or route through escrow with a buyer order.
          </DrawerDescription>
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div ref={bodyScrollRef} className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
            <div className="grid grid-cols-2 rounded-xl border border-gray-200 bg-gray-50 p-1">
            <button
              type="button"
              onClick={() => setMode('wallet')}
              className={`h-9 rounded-lg text-sm font-semibold transition-colors ${
                mode === 'wallet' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              Wallet transfer
            </button>
            <button
              type="button"
              onClick={() => setMode('vendor')}
              className={`h-9 rounded-lg text-sm font-semibold transition-colors ${
                mode === 'vendor' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              Vendor payout
            </button>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Available balance</p>
              <p className="mt-1 font-[family-name:var(--font-jetbrains-mono)] text-xl font-semibold text-gray-900">
                {availableUsdc.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                USDC
              </p>
            </div>

            {mode === 'wallet' ? (
              <>
                <div className="space-y-2">
                  <label htmlFor="send-recipient" className="text-sm font-medium text-gray-800">
                    Recipient address
                  </label>
                  <Input
                    id="send-recipient"
                    value={recipient}
                    onChange={(event) => setRecipient(event.target.value.trim().toUpperCase())}
                    placeholder="G..."
                    className="h-11 rounded-xl border-gray-200 text-sm"
                    autoComplete="off"
                  />
                  {recipientTrimmed && !isRecipientValid ? (
                    <p className="text-xs text-red-600">Must be a valid Stellar public key.</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label htmlFor="send-memo" className="text-sm font-medium text-gray-800">
                    Memo (optional)
                  </label>
                  <textarea
                    id="send-memo"
                    value={memo}
                    onChange={(event) => setMemo(event.target.value)}
                    placeholder="Add a note for this transfer"
                    rows={3}
                    maxLength={120}
                    className="w-full resize-none rounded-xl border border-gray-200 bg-transparent px-3 py-2 text-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label htmlFor="vendor-alias" className="text-sm font-medium text-gray-800">
                    Vendor alias
                  </label>
                  <Input
                    id="vendor-alias"
                    value={vendorAlias}
                    onChange={(event) => setVendorAlias(event.target.value)}
                    placeholder="rapipago-centro"
                    className="h-11 rounded-xl border-gray-200 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="vendor-rail" className="text-sm font-medium text-gray-800">
                    Payment rail
                  </label>
                  <select
                    id="vendor-rail"
                    value={vendorRail}
                    onChange={(event) => setVendorRail(event.target.value as VendorPaymentRail)}
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900"
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="mobile_wallet">Mobile Wallet</option>
                    <option value="cash_pickup">Cash Pickup</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="vendor-destination" className="text-sm font-medium text-gray-800">
                    Destination details
                  </label>
                  <Input
                    id="vendor-destination"
                    value={vendorDestination}
                    onChange={(event) => setVendorDestination(event.target.value)}
                    placeholder="CBU/CVU/account/handle"
                    className="h-11 rounded-xl border-gray-200 text-sm"
                  />
                </div>

              </>
            )}

            <div className="space-y-2 pb-2">
              <label htmlFor="send-amount" className="text-sm font-medium text-gray-800">
                Amount (USDC)
              </label>
              <Input
                id="send-amount"
                value={amountInput}
                onChange={(event) => setAmountInput(event.target.value)}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="0.00"
                className="h-11 rounded-xl border-gray-200 text-sm"
              />
              {hasAmount && !hasEnoughBalance ? (
                <p className="text-xs text-red-600">Amount exceeds your available USDC balance.</p>
              ) : null}
            </div>

            {mode === 'vendor' ? (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                This creates a frontend payout request for the maker with your vendor details.
              </p>
            ) : null}
          </div>

          <DrawerFooter className="border-t border-gray-100 bg-white px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-4">
            <Button
              type="submit"
              disabled={!canSubmit}
              className="h-12 w-full rounded-xl bg-gray-900 font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
            >
              {isSending ? 'Submitting...' : mode === 'wallet' ? 'Send USDC' : 'Continue to escrow'}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
