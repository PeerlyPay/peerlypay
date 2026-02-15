"use client";

import { useState } from "react";
import { PencilLine } from "lucide-react";
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

export interface EditableProfile {
  displayName: string;
  handle: string;
  bio: string;
}

interface EditProfileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialProfile: EditableProfile;
  onSave: (profile: EditableProfile) => void;
}

export default function EditProfileDrawer({
  open,
  onOpenChange,
  initialProfile,
  onSave,
}: EditProfileDrawerProps) {
  const [profileForm, setProfileForm] = useState<EditableProfile>({
    displayName: "",
    handle: "",
    bio: "",
  });

  const normalizedDraftHandle = profileForm.handle.trim().startsWith("@")
    ? profileForm.handle.trim()
    : `@${profileForm.handle.trim()}`;

  const hasProfileChanges =
    profileForm.displayName.trim() !== initialProfile.displayName ||
    normalizedDraftHandle !== initialProfile.handle ||
    profileForm.bio.trim() !== initialProfile.bio;

  const handleSaveProfile = () => {
    const nextDisplayName = profileForm.displayName.trim();
    const nextHandle = profileForm.handle.trim();
    const nextBio = profileForm.bio.trim();

    if (!nextDisplayName) {
      toast.error("Display name is required");
      return;
    }

    if (!nextHandle) {
      toast.error("Handle is required");
      return;
    }

    const normalizedHandle = nextHandle.startsWith("@")
      ? nextHandle
      : `@${nextHandle}`;

    onSave({
      displayName: nextDisplayName,
      handle: normalizedHandle,
      bio: nextBio || initialProfile.bio,
    });
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerTrigger asChild>
        <button
          type="button"
          onClick={() => setProfileForm(initialProfile)}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 px-3 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          <PencilLine className="size-3.5" />
          Edit
        </button>
      </DrawerTrigger>
      <DrawerContent className="inset-x-0 mx-auto w-[calc(100%-2rem)] max-w-120 rounded-t-2xl border-gray-200 bg-white">
        <DrawerHeader className="px-5 pt-3 text-left">
          <DrawerTitle>Edit profile</DrawerTitle>
          <DrawerDescription>Update your public profile details.</DrawerDescription>
        </DrawerHeader>
        <div className="space-y-4 px-5 pb-1">
          <div className="space-y-2">
            <Label htmlFor="profile-display-name">Display name</Label>
            <Input
              id="profile-display-name"
              value={profileForm.displayName}
              onChange={(event) =>
                setProfileForm((current) => ({
                  ...current,
                  displayName: event.target.value,
                }))
              }
              placeholder="Your display name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-handle">Handle</Label>
            <Input
              id="profile-handle"
              value={profileForm.handle}
              onChange={(event) =>
                setProfileForm((current) => ({
                  ...current,
                  handle: event.target.value,
                }))
              }
              placeholder="@yourhandle"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-bio">Bio</Label>
            <textarea
              id="profile-bio"
              value={profileForm.bio}
              onChange={(event) =>
                setProfileForm((current) => ({
                  ...current,
                  bio: event.target.value,
                }))
              }
              placeholder="Tell others about your trading style"
              rows={3}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none transition focus-visible:border-gray-400"
            />
          </div>
        </div>
        <DrawerFooter className="px-5 pb-5">
          <Button onClick={handleSaveProfile} disabled={!hasProfileChanges}>
            Save changes
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
