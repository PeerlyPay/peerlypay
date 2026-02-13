"use client";

import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import {
  User,
  Copy,
  Check,
  PencilLine,
  Share2,
  Wallet,
  CalendarDays,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, loading } = useUser();
  const [copied, setCopied] = useState(false);

  const createdDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

  const shortWallet = user?.walletAddress
    ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
    : "Not connected";

  const displayName = user?.walletAddress
    ? `Peerly ${user.walletAddress.slice(2, 6).toLowerCase()}`
    : "Guest user";

  const handle = user?.walletAddress
    ? `@${user.walletAddress.slice(4, 10).toLowerCase()}`
    : "@guest";

  const trustScore = user?.walletAddress
    ? (parseInt(user.walletAddress.slice(2, 6), 36) % 31) + 69
    : 75;

  const handleCopyWallet = async () => {
    if (!user?.walletAddress) {
      toast.error("No wallet connected");
      return;
    }

    try {
      await navigator.clipboard.writeText(user.walletAddress);
      toast.success("Wallet copied");
    } catch {
      toast.error("Failed to copy wallet");
    } finally {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleComingSoon = (label: string) => {
    toast.info(`${label} coming soon`);
  };

  if (loading) {
    return (
      <div className="space-y-5 py-2">
        <div className="h-56 rounded-2xl border border-gray-200 bg-white" />
        <div className="h-24 rounded-2xl border border-gray-200 bg-white" />
      </div>
    );
  }

  return (
    <div className="space-y-7 py-4">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="h-32 bg-gradient-to-r from-fuchsia-500 to-fuchsia-400" />

        <div className="px-5 pb-7">
          <div className="-mt-7 mb-5 flex items-end justify-between">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-fuchsia-500 text-white shadow-sm">
              <User className="h-7 w-7" />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleComingSoon("Edit profile")}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 px-3 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                <PencilLine className="size-3.5" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleComingSoon("Share profile")}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 px-3 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                <Share2 className="size-3.5" />
                Share
              </button>
            </div>
          </div>

          <div className="pt-2">
            <p className="text-xl font-semibold text-gray-900">{displayName}</p>
            <p className="text-sm text-gray-500">{handle}</p>
            <p className="mt-2.5 text-sm leading-relaxed text-gray-600">
              {user
                ? "Fast, secure P2P trading on PeerlyPay."
                : "Create your profile to start trading on PeerlyPay."}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-gray-50 px-3 py-2.5">
              <p className="text-xs text-gray-500">Completed trades</p>
              <p className="text-sm font-semibold text-gray-900">12</p>
            </div>
            <div className="rounded-xl bg-gray-50 px-3 py-2.5">
              <p className="text-xs text-gray-500">Trust score</p>
              <p className="text-sm font-semibold text-gray-900">
                {trustScore}/100
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3 rounded-xl border border-gray-100 px-3 py-2.5">
              <Wallet className="size-4 text-gray-400" />
              <span className="text-sm text-gray-500">Wallet</span>
              <span className="ml-auto font-mono text-xs text-gray-900">
                {shortWallet}
              </span>
              <button
                type="button"
                onClick={handleCopyWallet}
                className={`inline-flex size-7 items-center justify-center rounded-lg border transition-colors ${
                  copied
                    ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                    : "border-gray-200 bg-white text-gray-500 hover:bg-gray-100"
                }`}
                aria-label="Copy wallet"
              >
                {copied ? (
                  <Check className="size-3.5" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </button>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-gray-100 px-3 py-2.5">
              <CalendarDays className="size-4 text-gray-400" />
              <span className="text-sm text-gray-500">Joined</span>
              <span className="ml-auto text-sm font-medium text-gray-900">
                {createdDate}
              </span>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => handleComingSoon("Sign out")}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
      >
        <LogOut className="size-4" />
        Sign out
      </button>
    </div>
  );
}
