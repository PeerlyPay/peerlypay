'use client';

import { useStore } from '@/lib/store';
import { User } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useStore();
  const { isConnected, walletAddress } = user;

  return (
    <>
      <h1 className="text-h3 text-black mb-6">Profile</h1>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <User className="h-7 w-7 text-gray-500" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {isConnected && walletAddress
                ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                : 'Not connected'}
            </p>
            <p className="text-body-sm text-gray-500">
              {isConnected ? 'Wallet connected' : 'Connect your wallet in the header'}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-6 text-body-sm text-gray-500">
        Profile settings and account options can be added here.
      </p>
    </>
  );
}
