'use client';

import { useUser } from '@/contexts/UserContext';
import { User, Wallet, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useUser();

  const createdDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—';

  const shortWallet = user?.walletAddress
    ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
    : 'Not connected';

  return (
    <>
      <h1 className="text-h3 text-black mb-6">Profile</h1>

      {/* User card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <User className="h-7 w-7 text-gray-500" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{shortWallet}</p>
            <p className="text-body-sm text-gray-500">
              {user ? 'Wallet connected' : 'No user found'}
            </p>
          </div>
        </div>

        {/* Info rows */}
        {user && (
          <div className="space-y-4 border-t border-gray-100 pt-4">
            <div className="flex items-center gap-3 text-sm">
              <Wallet className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">Wallet</span>
              <span className="ml-auto font-mono text-xs text-gray-900">
                {shortWallet}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">Created</span>
              <span className="ml-auto font-medium text-gray-900">
                {createdDate}
              </span>
            </div>
          </div>
        )}
      </div>

      <p className="mt-6 text-body-sm text-gray-500">
        Profile settings and account options can be added here.
      </p>
    </>
  );
}
