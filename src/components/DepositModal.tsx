'use client';

import { useState } from 'react';
import { X, Copy, Check, AlertTriangle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
}

export default function DepositModal({
  isOpen,
  onClose,
  walletAddress,
}: DepositModalProps) {
  const [copied, setCopied] = useState(false);

  // Full address for QR and copy (in production this would be the full Stellar address)
  const fullAddress = walletAddress || 'GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOUJ3NBNE5P4XXXY';

  // Truncated for display
  const truncatedAddress = fullAddress.length > 16
    ? `${fullAddress.slice(0, 8)}...${fullAddress.slice(-8)}`
    : fullAddress;

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(fullAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()} direction="bottom">
      <DrawerContent className="inset-x-0 mx-auto w-[calc(100%-2rem)] max-w-120 max-h-[90dvh] overflow-y-auto rounded-t-3xl border-gray-200 bg-white p-0">
        <DrawerHeader className="sr-only">
          <DrawerTitle>Deposit USDC</DrawerTitle>
          <DrawerDescription>Receive USDC by sharing your Stellar wallet address.</DrawerDescription>
        </DrawerHeader>

        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 font-[family-name:var(--font-space-grotesk)]">
            Deposit USDC
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          <p className="text-center text-gray-600">
            Send USDC to this address
          </p>

          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
              <QRCodeSVG
                value={fullAddress}
                size={180}
                level="M"
                includeMargin={false}
                className="rounded-lg"
              />
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
              Your wallet address
            </p>
            <div className="flex items-center justify-between gap-3">
              <code className="text-sm font-mono text-gray-900 break-all">
                {truncatedAddress}
              </code>
              <button
                type="button"
                onClick={handleCopyAddress}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  copied
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-fuchsia-200 bg-fuchsia-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-fuchsia-600" />
              <div>
                <p className="mb-2 font-semibold text-fuchsia-800">Important</p>
                <ul className="space-y-1.5 text-sm text-fuchsia-700">
                  <li className="flex items-start gap-2">
                    <span className="text-fuchsia-500">•</span>
                    Only send USDC on Stellar network
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-fuchsia-500">•</span>
                    Sending other tokens will result in permanent loss
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-fuchsia-500">•</span>
                    Minimum deposit: 1 USDC
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <Button
            onClick={onClose}
            className="w-full h-12 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-semibold transition-colors"
          >
            Done
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
