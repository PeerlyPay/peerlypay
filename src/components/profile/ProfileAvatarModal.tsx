"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { User, X } from "lucide-react";

interface ProfileAvatarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProfileAvatarModal({
  open,
  onOpenChange,
}: ProfileAvatarModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-fuchsia-500 text-white shadow-sm transition-transform active:scale-95"
          aria-label="Open profile picture"
        >
          <User className="h-7 w-7" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/55 backdrop-blur-md" />
        <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-6 focus:outline-none">
          <Dialog.Title className="sr-only">Profile picture</Dialog.Title>
          <div className="relative">
            <div className="flex h-72 w-72 items-center justify-center rounded-full border-8 border-white bg-fuchsia-500 text-white shadow-2xl sm:h-80 sm:w-80">
              <User className="h-24 w-24 sm:h-28 sm:w-28" />
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="absolute -right-2 -top-2 inline-flex size-8 items-center justify-center rounded-full border border-white/30 bg-black/50 text-white transition-colors hover:bg-black/70"
                aria-label="Close profile picture"
              >
                <X className="size-4" />
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
