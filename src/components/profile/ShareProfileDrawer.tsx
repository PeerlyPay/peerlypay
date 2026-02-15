"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ShareProfileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  displayName: string;
  handle: string;
}

export default function ShareProfileDrawer({
  open,
  onOpenChange,
  displayName,
  handle,
}: ShareProfileDrawerProps) {
  const [shareCopied, setShareCopied] = useState(false);

  const getProfileShareUrl = () => {
    if (typeof window === "undefined") {
      return "/profile";
    }

    return `${window.location.origin}/profile`;
  };

  const handleCopyProfileLink = async () => {
    try {
      await navigator.clipboard.writeText(getProfileShareUrl());
      setShareCopied(true);
      onOpenChange(false);
      toast.success("Profile link copied");
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      toast.error("Failed to copy profile link");
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator.share !== "function") {
      toast.info("Native sharing is not available on this device");
      return;
    }

    try {
      await navigator.share({
        title: `${displayName} on PeerlyPay`,
        text: `Check out ${handle} on PeerlyPay`,
        url: getProfileShareUrl(),
      });
      onOpenChange(false);
    } catch {
      // Ignore cancel and transient native share errors.
    }
  };

  const isNativeShareSupported = typeof navigator.share === "function";

  return (
    <Drawer
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (nextOpen) {
          setShareCopied(false);
        }
      }}
      direction="bottom"
    >
      <DrawerTrigger asChild>
        <button
          type="button"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 px-3 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          <Share2 className="size-3.5" />
          Share
        </button>
      </DrawerTrigger>
      <DrawerContent className="inset-x-0 mx-auto w-[calc(100%-2rem)] max-w-120 rounded-t-2xl border-gray-200 bg-white">
        <DrawerHeader className="px-5 pt-3 text-left">
          <DrawerTitle>Share profile</DrawerTitle>
          <DrawerDescription>Send your profile link to others.</DrawerDescription>
        </DrawerHeader>
        <div className="space-y-3 px-5 pb-1">
          <Label htmlFor="profile-share-link">Profile link</Label>
          <Input
            id="profile-share-link"
            value={getProfileShareUrl()}
            readOnly
            className="font-mono text-xs"
          />
        </div>
        <DrawerFooter className="px-5 pb-5">
          <Button onClick={handleCopyProfileLink}>
            {shareCopied ? (
              <>
                <Check className="size-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="size-4" />
                Copy link
              </>
            )}
          </Button>
          {isNativeShareSupported ? (
            <Button variant="outline" onClick={handleNativeShare}>
              <Share2 className="size-4" />
              Share...
            </Button>
          ) : null}
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
