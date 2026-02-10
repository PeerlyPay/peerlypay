'use client';

import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import { User, ArrowRightLeft, Wallet, Calendar, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { user, setUser, isFreelancer } = useUser();
  const router = useRouter();

  const handleRoleSwitch = () => {
    if (!user) return;

    const newRole = isFreelancer ? 'MARKET_MAKER' : 'FREELANCER';
    const updatedUser = { ...user, role: newRole as 'FREELANCER' | 'MARKET_MAKER' };

    setUser(updatedUser);

    // Redirect to the appropriate dashboard
    const destination = newRole === 'FREELANCER' ? '/quick-trade' : '/pro';
    router.push(destination);
  };

  const oppositeLabel = isFreelancer ? 'Market Maker' : 'Freelancer';
  const currentLabel = isFreelancer ? 'Freelancer' : 'Market Maker';

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
              <Shield className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">Role</span>
              <span className="ml-auto font-medium text-gray-900">
                {currentLabel}
              </span>
            </div>
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

      {/* DEV Role Switcher */}
      {user && (
        <div className="mt-6 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center rounded bg-amber-500 px-2 py-0.5 text-xs font-bold text-white uppercase tracking-wide">
              DEV
            </span>
            <span className="text-sm font-medium text-amber-800">
              Role Switcher
            </span>
          </div>
          <p className="text-xs text-amber-700 mb-4">
            Switch between roles for development testing. This will redirect you
            to the corresponding dashboard.
          </p>
          <button
            onClick={handleRoleSwitch}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-amber-600 active:bg-amber-700"
          >
            <ArrowRightLeft className="h-4 w-4" />
            Switch to {oppositeLabel}
          </button>
        </div>
      )}

      <p className="mt-6 text-body-sm text-gray-500">
        Profile settings and account options can be added here.
      </p>
    </>
  );
}
