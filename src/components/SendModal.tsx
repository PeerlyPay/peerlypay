'use client';

import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';

const STELLAR_PUBLIC_KEY_REGEX = /^G[A-Z2-7]{55}$/;

interface SendModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableUsdc: number;
  onSend: (amount: number) => boolean;
}

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
  const [recipient, setRecipient] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [memo, setMemo] = useState('');
  const [isSending, setIsSending] = useState(false);

  const parsedAmount = useMemo(() => Number.parseFloat(amountInput), [amountInput]);

  const resetForm = () => {
    setRecipient('');
    setAmountInput('');
    setMemo('');
    setIsSending(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const recipientTrimmed = recipient.trim();
  const memoTrimmed = memo.trim();
  const hasAmount = Number.isFinite(parsedAmount) && parsedAmount > 0;
  const isRecipientValid = STELLAR_PUBLIC_KEY_REGEX.test(recipientTrimmed);
  const hasEnoughBalance = hasAmount && parsedAmount <= availableUsdc;

  const canSubmit = isRecipientValid && hasEnoughBalance && !isSending;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!recipientTrimmed) {
      toast.error('Recipient wallet address is required');
      return;
    }

    if (!isRecipientValid) {
      toast.error('Enter a valid Stellar public address');
      return;
    }

    if (!hasAmount) {
      toast.error('Enter a valid amount greater than 0');
      return;
    }

    if (!hasEnoughBalance) {
      toast.error('Insufficient USDC balance');
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
  };

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
      direction="bottom"
    >
      <DrawerContent className="inset-x-0 mx-auto w-[calc(100%-2rem)] max-w-120 max-h-[90dvh] overflow-y-auto rounded-t-3xl border-gray-200 bg-white p-0">
        <DrawerHeader className="sr-only">
          <DrawerTitle>Send USDC</DrawerTitle>
          <DrawerDescription>Send USDC to another Stellar wallet address.</DrawerDescription>
        </DrawerHeader>

        <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-4">
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold text-gray-900">
            Send USDC
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5">
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

          <Button
            type="submit"
            disabled={!canSubmit}
            className="h-12 w-full rounded-xl bg-gray-900 font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
          >
            {isSending ? 'Sending...' : 'Send USDC'}
          </Button>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
