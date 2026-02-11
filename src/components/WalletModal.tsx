'use client';

import { useState } from 'react';
import { X, Copy, Check, ExternalLink } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
  balanceUsdc: number;
  balanceXlm: number;
  onDisconnect: () => void;
}

export default function WalletModal({
  isOpen,
  onClose,
  walletAddress,
  balanceUsdc,
  balanceXlm,
  onDisconnect,
}: WalletModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Full address for QR and copy
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

  const handleViewOnExplorer = () => {
    window.open(`https://stellarchain.io/accounts/${fullAddress}`, '_blank');
  };

  const handleDisconnect = () => {
    onDisconnect();
    onClose();
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
            Your Wallet
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
        <div className="p-5 space-y-5">
          {/* QR Code */}
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
              <QRCodeSVG
                value={fullAddress}
                size={160}
                level="M"
                includeMargin={false}
                className="rounded-lg"
              />
            </div>
          </div>

          {/* Address with copy button */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
              Wallet address
            </p>
            <div className="flex items-center justify-between gap-3">
              <code className="text-sm font-mono text-gray-900">
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

          {/* Balance breakdown */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">
              Balances
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">$</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">USDC</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 font-[family-name:var(--font-jetbrains-mono)]">
                  {balanceUsdc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-600">XLM</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">XLM</span>
                    <span className="text-xs text-gray-500 ml-1.5">(for fees)</span>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-900 font-[family-name:var(--font-jetbrains-mono)]">
                  {balanceXlm.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                </span>
              </div>
            </div>
          </div>

          {/* View on Explorer link */}
          <button
            type="button"
            onClick={handleViewOnExplorer}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-[var(--color-primary-500)] hover:text-[var(--color-primary-600)] transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View on Stellar Explorer
          </button>

          {/* Disconnect button */}
          <Button
            onClick={handleDisconnect}
            variant="outline"
            className="w-full h-12 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 font-semibold transition-colors"
          >
            Disconnect Wallet
          </Button>
        </div>
      </div>
    </div>
  );
}
