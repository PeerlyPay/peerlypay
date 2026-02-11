'use client';

import { useState } from 'react';
import { X, Copy, Check, AlertTriangle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';

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

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-[480px] bg-white rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        {/* Header */}
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

        {/* Content */}
        <div className="p-5 space-y-6">
          {/* Instruction */}
          <p className="text-center text-gray-600">
            Send USDC to this address
          </p>

          {/* QR Code */}
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

          {/* Address with copy button */}
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

          {/* Warning box */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-800 mb-2">Important</p>
                <ul className="text-sm text-amber-700 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500">•</span>
                    Only send USDC on Stellar network
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500">•</span>
                    Sending other tokens will result in permanent loss
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500">•</span>
                    Minimum deposit: 1 USDC
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Done button */}
          <Button
            onClick={onClose}
            className="w-full h-12 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-semibold transition-colors"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
