'use client';

import Image from 'next/image';
import WalletButton from '@/components/WalletButton';

export default function Header() {
  return (
    <header className="fixed top-0 left-1/2 z-50 w-full max-w-120 -translate-x-1/2 border-b bg-white shadow-sm">
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        {/* Logo */}
        <div className="flex items-center gap-2 min-w-0">
          <Image
            src="/x_icon_black.png"
            alt="PeerlyPay"
            width={28}
            height={28}
            className="shrink-0 object-contain h-7 w-7"
          />
          <span className="font-display font-bold text-xl truncate">
            PeerlyPay
          </span>
        </div>

        {/* Wallet */}
        <WalletButton />
      </div>
    </header>
  );
}
