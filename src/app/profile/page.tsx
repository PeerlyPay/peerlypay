"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Check, Wallet, CalendarDays, LogOut } from "lucide-react";
import { toast } from "sonner";

import EditProfileDrawer, {
  type EditableProfile,
} from "@/components/profile/EditProfileDrawer";
import ProfileAvatarModal from "@/components/profile/ProfileAvatarModal";
import ShareProfileDrawer from "@/components/profile/ShareProfileDrawer";
import { useUser } from "@/contexts/UserContext";
import { useStore } from "@/lib/store";

const PROFILE_OVERRIDES_STORAGE_KEY = "peerlypay_profile_overrides";

type ProfileOverrides = Record<
  string,
  {
    displayName: string;
    handle: string;
  }
>;

export default function ProfilePage() {
  const { user, loading } = useUser();
  const connectedWalletAddress = useStore((s) => s.user.walletAddress);
  const [copied, setCopied] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [isShareDrawerOpen, setIsShareDrawerOpen] = useState(false);
  const [profileOverrides, setProfileOverrides] = useState<ProfileOverrides>(
    () => {
      if (typeof window === "undefined") {
        return {};
      }

      try {
        const stored = localStorage.getItem(PROFILE_OVERRIDES_STORAGE_KEY);
        if (!stored) {
          return {};
        }

        const parsed = JSON.parse(stored);
        return typeof parsed === "object" && parsed !== null ? parsed : {};
      } catch {
        return {};
      }
    },
  );
  const [profileBios, setProfileBios] = useState<Record<string, string>>({});
  const activeWalletAddress = connectedWalletAddress;

  const createdDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

  const shortWallet = activeWalletAddress
    ? `${activeWalletAddress.slice(0, 6)}...${activeWalletAddress.slice(-4)}`
    : "Not connected";

  const defaultDisplayName = activeWalletAddress
    ? `Peerly ${activeWalletAddress.slice(2, 6).toLowerCase()}`
    : "Guest user";

  const defaultHandle = activeWalletAddress
    ? `@${activeWalletAddress.slice(4, 10).toLowerCase()}`
    : "@guest";

  const defaultBio = user
    ? "Fast, secure P2P trading on PeerlyPay."
    : "Create your profile to start trading on PeerlyPay.";

  const profileStorageKey = activeWalletAddress ?? "guest";
  const storedProfile = profileOverrides[profileStorageKey];

  const currentProfile = {
    displayName: storedProfile?.displayName ?? defaultDisplayName,
    handle: storedProfile?.handle ?? defaultHandle,
    bio: profileBios[profileStorageKey] ?? defaultBio,
  };

  const trustScore = activeWalletAddress
    ? (parseInt(activeWalletAddress.slice(2, 6), 36) % 31) + 69
    : 75;

  const handleCopyWallet = async () => {
    if (!activeWalletAddress) {
      toast.error("No wallet connected");
      return;
    }

    try {
      await navigator.clipboard.writeText(activeWalletAddress);
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

  const handleSaveProfile = (nextProfile: EditableProfile) => {
    const nextProfileOverrides = {
      ...profileOverrides,
      [profileStorageKey]: {
        displayName: nextProfile.displayName,
        handle: nextProfile.handle,
      },
    };

    setProfileOverrides(nextProfileOverrides);
    setProfileBios((current) => ({
      ...current,
      [profileStorageKey]: nextProfile.bio,
    }));

    try {
      localStorage.setItem(
        PROFILE_OVERRIDES_STORAGE_KEY,
        JSON.stringify(nextProfileOverrides),
      );
    } catch {
      toast.error("Failed to persist profile changes");
    }

    toast.success("Profile updated");
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
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="h-32 bg-gradient-to-r from-fuchsia-500 to-fuchsia-400" />

        <div className="absolute top-32 left-5 z-10 -translate-y-1/2">
          <ProfileAvatarModal
            open={isAvatarModalOpen}
            onOpenChange={setIsAvatarModalOpen}
          />
        </div>

        <div className="px-5 pb-7 pt-10">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xl font-semibold text-gray-900">
                {currentProfile.displayName}
              </p>
              <p className="text-sm text-gray-500">{currentProfile.handle}</p>
              <p className="mt-2.5 text-sm leading-relaxed text-gray-600">
                {currentProfile.bio}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <EditProfileDrawer
                open={isEditDrawerOpen}
                onOpenChange={setIsEditDrawerOpen}
                initialProfile={currentProfile}
                onSave={handleSaveProfile}
              />
              <ShareProfileDrawer
                open={isShareDrawerOpen}
                onOpenChange={setIsShareDrawerOpen}
                displayName={currentProfile.displayName}
                handle={currentProfile.handle}
              />
            </div>
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

      <div className="space-y-3">
        <Link
          href="/profile/liquidity-provider"
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          Liquidity Provider
        </Link>

        <button
          type="button"
          onClick={() => handleComingSoon("Sign out")}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}
