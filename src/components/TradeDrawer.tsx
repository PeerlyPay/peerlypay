'use client';

import * as Dialog from '@radix-ui/react-dialog';
import QuickTradeInput from '@/components/QuickTradeInput';

interface TradeDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: 'buy' | 'sell';
}

export default function TradeDrawer({ open, onOpenChange, mode = 'buy' }: TradeDrawerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 animate-fadeOverlay" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-120 rounded-t-3xl bg-white h-[95dvh] animate-slideUp focus:outline-none">
          <Dialog.Title className="sr-only">Trade</Dialog.Title>
          <div className="mx-auto mt-2 mb-1 h-1 w-10 rounded-full bg-gray-300" />
          <QuickTradeInput
            initialMode={mode}
            onClose={() => onOpenChange(false)}
            showToggle={false}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
