'use client';

import { useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Wallet, Loader2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function shortenAddress(address: string): string {
  if (address.length <= 14) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function Header() {
  const { user, connectWallet, disconnectWallet } = useStore();
  const { isConnected, walletAddress } = user;
  const [isConnecting, setIsConnecting] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-[480px] mx-auto px-4 py-3 flex items-center justify-between gap-2">
        {/* Logo */}
        <div className="flex items-center gap-2 min-w-0">
          <Image
            src="/x_icon_black.png"
            alt="PeerlyPay"
            width={28}
            height={28}
            className="shrink-0 object-contain h-7 w-7"
          />
          <span className="font-bold text-xl font-[family-name:var(--font-space-grotesk)] truncate">
            PeerlyPay
          </span>
        </div>

        {/* Wallet */}
        <div className="flex items-center">
          {!isConnected ? (
            <Button
              disabled={isConnecting}
              onClick={async () => {
                setIsConnecting(true);
                await new Promise((r) => setTimeout(r, 500));
                connectWallet();
                toast.success('Wallet connected successfully!');
                setIsConnecting(false);
              }}
              className="bg-magenta hover:bg-magenta/90 text-white transition-all duration-200 disabled:opacity-70"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="size-4" />
                  Connect Wallet
                </>
              )}
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="font-mono text-sm min-w-0 transition-all duration-200"
                >
                  {walletAddress ? shortenAddress(walletAddress) : '0x...'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[10rem]">
                <DropdownMenuItem
                  onClick={() => {
                    disconnectWallet();
                    toast.info('Wallet disconnected');
                  }}
                  className="cursor-pointer"
                >
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}