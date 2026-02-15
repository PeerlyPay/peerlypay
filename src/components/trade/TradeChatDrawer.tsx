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
  triggerClassName?: string;
  initialMessages?: TradeChatMessage[];
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
  const messagesRef = useRef<HTMLDivElement | null>(null);

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
