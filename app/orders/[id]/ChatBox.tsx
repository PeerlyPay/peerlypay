'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
}

export interface ChatBoxProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
}

function shortenAddress(address: string): string {
  if (address.length <= 14) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export default function ChatBox({
  messages,
  onSendMessage,
}: ChatBoxProps) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserAddress = useStore((s) => s.user.walletAddress);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setInputText('');
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 transition-all duration-200">
      <header className="mb-4 flex items-center gap-2">
        <MessageSquare className="size-5 text-gray-600 shrink-0" />
        <h3 className="text-h5 text-gray-800 font-display">Chat</h3>
      </header>

      <div className="max-h-80 space-y-3 overflow-y-auto">
        {messages.map((msg) => {
          const isSystem = msg.sender === 'system';
          const isOwn = !isSystem && currentUserAddress !== null && msg.sender === currentUserAddress;
          return (
            <div
              key={msg.id}
              className={`rounded-lg px-3 py-2 animate-in fade-in duration-200 ${
                isSystem
                  ? 'mx-0 max-w-full bg-primary-50 border border-primary-100 text-left'
                  : isOwn
                    ? 'ml-auto max-w-5/6 bg-magenta/10 text-right'
                    : 'mr-auto max-w-5/6 bg-gray-50 text-left'
              }`}
            >
              <p className="mb-1 text-xs text-gray-500">
                {isSystem ? 'PeerlyPay' : shortenAddress(msg.sender)}
              </p>
              <p className="text-sm">{msg.text}</p>
              <p className="mt-1 text-xs text-gray-400">{formatTime(msg.timestamp)}</p>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4 flex gap-2">
        <Input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message..."
          className="flex-1 rounded-lg border-gray-200"
        />
        <Button
          type="button"
          onClick={handleSend}
          className="shrink-0 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:opacity-90 transition-all duration-200"
          aria-label="Send message"
        >
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
}
