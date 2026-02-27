'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MessageCircle, SendHorizontal } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import type { VendorPaymentRail, VendorPaymentRequest } from '@/types';
import { loadVendorPaymentRequest, saveVendorPaymentRequest } from '@/lib/vendor-payment-request';
import { cn } from '@/lib/utils';

type ChatSender = 'me' | 'seller';

type TradeChatMessage = {
  id: string;
  sender: ChatSender;
  text: string;
};

type TradeChatDrawerProps = {
  triggerLabel: string;
  sellerLabel: string;
  flowId?: string;
  enableVendorRequest?: boolean;
  triggerClassName?: string;
  initialMessages?: TradeChatMessage[];
};

const RAIL_LABELS: Record<VendorPaymentRail, string> = {
  bank_transfer: 'Bank Transfer',
  mobile_wallet: 'Mobile Wallet',
  cash_pickup: 'Cash Pickup',
};

function createSellerGreeting(sellerLabel: string): TradeChatMessage {
  return {
    id: 'seller-greeting',
    sender: 'seller',
    text: `Hey, I am ${sellerLabel}. Message me here if you need help with the transfer details.`,
  };
}

export default function TradeChatDrawer({
  triggerLabel,
  sellerLabel,
  flowId,
  enableVendorRequest = false,
  triggerClassName,
  initialMessages,
}: TradeChatDrawerProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<TradeChatMessage[]>(() => {
    if (initialMessages?.length) {
      return initialMessages;
    }

    return [createSellerGreeting(sellerLabel)];
  });
  const [vendorAlias, setVendorAlias] = useState('');
  const [vendorRail, setVendorRail] = useState<VendorPaymentRail>('bank_transfer');
  const [vendorDestination, setVendorDestination] = useState('');
  const [vendorReference, setVendorReference] = useState('');
  const [vendorNote, setVendorNote] = useState('');
  const [vendorRequest, setVendorRequest] = useState<VendorPaymentRequest | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!enableVendorRequest || !flowId) {
      return;
    }

    const saved = loadVendorPaymentRequest(flowId);
    if (!saved) {
      return;
    }

    setVendorRequest(saved);
    setVendorAlias(saved.alias);
    setVendorRail(saved.rail);
    setVendorDestination(saved.destination);
    setVendorReference(saved.reference ?? '');
    setVendorNote(saved.note ?? '');
  }, [enableVendorRequest, flowId]);

  useEffect(() => {
    if (!open || !messagesRef.current) {
      return;
    }

    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages, open]);

  const handleSend = useCallback(() => {
    const text = draft.trim();
    if (!text) {
      return;
    }

    const nextMessage: TradeChatMessage = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      sender: 'me',
      text,
    };

    setMessages((current) => [...current, nextMessage]);
    setDraft('');
  }, [draft]);

  const handleSaveVendorRequest = useCallback(() => {
    const alias = vendorAlias.trim();
    const destination = vendorDestination.trim();
    const reference = vendorReference.trim();
    const note = vendorNote.trim();

    if (!flowId || !alias || !destination) {
      return;
    }

    const nextRequest: VendorPaymentRequest = {
      alias,
      rail: vendorRail,
      destination,
      reference: reference || undefined,
      note: note || undefined,
    };

    saveVendorPaymentRequest(flowId, nextRequest);
    setVendorRequest(nextRequest);

    const summaryParts = [
      `Send ARS to @${alias} via ${RAIL_LABELS[vendorRail]}.`,
      `Destination: ${destination}.`,
      reference ? `Reference: ${reference}.` : '',
      note ? `Note: ${note}.` : '',
    ].filter(Boolean);

    const summaryMessage: TradeChatMessage = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      sender: 'me',
      text: summaryParts.join(' '),
    };

    setMessages((current) => [...current, summaryMessage]);
  }, [flowId, vendorAlias, vendorDestination, vendorNote, vendorRail, vendorReference]);

  const showVendorForm = enableVendorRequest && !vendorRequest;

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="bottom">
      <DrawerTrigger asChild>
        <button type="button" className={triggerClassName}>
          <MessageCircle className="size-4" />
          {triggerLabel}
        </button>
      </DrawerTrigger>

      <DrawerContent className="inset-x-0 mx-auto flex h-[70dvh] w-[calc(100%-2rem)] max-w-120 rounded-t-2xl border-gray-200 bg-white">
        <DrawerHeader className="px-5 pt-3 text-left">
          <DrawerTitle>Chat with {sellerLabel}</DrawerTitle>
          <DrawerDescription>Coordinate payment details safely in this thread.</DrawerDescription>
        </DrawerHeader>

        {enableVendorRequest && (
          <div className="mx-5 mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs font-semibold text-amber-800">Vendor payout details</p>
            {!showVendorForm && vendorRequest ? (
              <>
                <p className="mt-1 text-xs text-amber-700">
                  @{vendorRequest.alias} - {RAIL_LABELS[vendorRequest.rail]}
                </p>
                <p className="text-xs text-amber-700">{vendorRequest.destination}</p>
                {vendorRequest.reference && (
                  <p className="text-xs text-amber-700">Ref: {vendorRequest.reference}</p>
                )}
                {vendorRequest.note && (
                  <p className="text-xs text-amber-700">Note: {vendorRequest.note}</p>
                )}
                <p className="mt-2 text-[11px] text-amber-700">
                  Locked for this trade after save.
                </p>
              </>
            ) : (
              <div className="mt-2 space-y-2">
                <input
                  type="text"
                  value={vendorAlias}
                  onChange={(event) => setVendorAlias(event.target.value)}
                  placeholder="Vendor alias (example: rapipago-centro)"
                  className="h-9 w-full rounded-lg border border-amber-200 bg-white px-2 text-xs text-gray-900 outline-none"
                />
                <select
                  value={vendorRail}
                  onChange={(event) => setVendorRail(event.target.value as VendorPaymentRail)}
                  className="h-9 w-full rounded-lg border border-amber-200 bg-white px-2 text-xs text-gray-900 outline-none"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="mobile_wallet">Mobile Wallet</option>
                  <option value="cash_pickup">Cash Pickup</option>
                </select>
                <input
                  type="text"
                  value={vendorDestination}
                  onChange={(event) => setVendorDestination(event.target.value)}
                  placeholder="CBU/CVU/account/handle"
                  className="h-9 w-full rounded-lg border border-amber-200 bg-white px-2 text-xs text-gray-900 outline-none"
                />
                <input
                  type="text"
                  value={vendorReference}
                  onChange={(event) => setVendorReference(event.target.value)}
                  placeholder="Reference (optional)"
                  className="h-9 w-full rounded-lg border border-amber-200 bg-white px-2 text-xs text-gray-900 outline-none"
                />
                <input
                  type="text"
                  value={vendorNote}
                  onChange={(event) => setVendorNote(event.target.value)}
                  placeholder="Notes (optional)"
                  className="h-9 w-full rounded-lg border border-amber-200 bg-white px-2 text-xs text-gray-900 outline-none"
                />
                <button
                  type="button"
                  onClick={handleSaveVendorRequest}
                  disabled={!flowId || !vendorAlias.trim() || !vendorDestination.trim()}
                  className="h-9 w-full rounded-lg bg-amber-500 text-xs font-semibold text-white disabled:opacity-50"
                >
                  Save payout details
                </button>
              </div>
            )}
          </div>
        )}

        <div ref={messagesRef} className="flex-1 space-y-3 overflow-y-auto px-5 pb-4">
          {messages.map((message) => {
            const isMe = message.sender === 'me';

            return (
              <div key={message.id} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-3 py-2 text-sm',
                    isMe
                      ? 'bg-fuchsia-500 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-900 rounded-bl-md'
                  )}
                >
                  {message.text}
                </div>
              </div>
            );
          })}
        </div>

        <form
          className="flex items-center gap-2 border-t border-gray-100 px-5 pb-5 pt-3"
          onSubmit={(event) => {
            event.preventDefault();
            handleSend();
          }}
        >
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Type a message"
            className="h-11 flex-1 rounded-xl border border-gray-200 px-3 text-sm text-gray-900 outline-none transition focus-visible:border-gray-400"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className="flex size-11 items-center justify-center rounded-xl bg-fuchsia-500 text-white transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Send message"
          >
            <SendHorizontal className="size-4" />
          </button>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
