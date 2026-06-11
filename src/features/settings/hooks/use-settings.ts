"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

import { useTheme } from "@/contexts/theme-provider";
import {
  PROFILE_REFRESH_AFTER_TOAST_MS,
  useVaultProfile,
} from "@/contexts/vault-profile-context";
import { getVaultAvatarUrl, saveVaultProfile } from "@/api/profile";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentVaultUser, getVaultUserDisplayName } from "@/api/user";
import { useVaultToast } from "@/hooks/use-vault-toast";

const SETTINGS_SECTIONS = [
  "profile",
  "appearance",
  "preferences",
  "categories",
] as const;

export type SettingsSection = (typeof SETTINGS_SECTIONS)[number];

const SETTINGS_LOAD_MS = 480;

export const useSettings = () => {
  const { preference, setTheme } = useTheme();
  const { refreshProfile } = useVaultProfile();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("profile");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [savedFullName, setSavedFullName] = useState("");
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [savedAvatarUrl, setSavedAvatarUrl] = useState<string | null>(null);
  const [pendingPhotoFile, setPendingPhotoFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { toastMessage, toastVariant, setToastMessage } = useVaultToast();
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const [mobileNavOverflow, setMobileNavOverflow] = useState(false);

  useEffect(() => {
    const nav = mobileNavRef.current;
    if (!nav) {
      return;
    }

    const updateOverflow = () => {
      setMobileNavOverflow(nav.scrollWidth > nav.clientWidth + 1);
    };

    updateOverflow();
    nav.addEventListener("scroll", updateOverflow, { passive: true });
    window.addEventListener("resize", updateOverflow);

    const observer = new ResizeObserver(updateOverflow);
    observer.observe(nav);

    return () => {
      nav.removeEventListener("scroll", updateOverflow);
      window.removeEventListener("resize", updateOverflow);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const nav = mobileNavRef.current;
    if (!nav) {
      return;
    }

    const activeButton = nav.querySelector<HTMLElement>(
      `[data-settings-tab="${activeSection}"]`,
    );
    activeButton?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeSection]);

  useEffect(() => {
    let isMounted = true;
    const startedAt = Date.now();

    const finishLoading = () => {
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, SETTINGS_LOAD_MS - elapsed);
      window.setTimeout(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      }, remaining);
    };

    const loadProfile = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (!isMounted) {
          return;
        }

        if (data.user) {
          const displayName = getVaultUserDisplayName(data.user);
          const avatarUrl = getVaultAvatarUrl(data.user);

          setEmail(data.user.email?.trim() ?? "");
          setFullName(displayName);
          setSavedFullName(displayName);
          setProfilePhotoUrl(avatarUrl);
          setSavedAvatarUrl(avatarUrl);
        }
      } finally {
        finishLoading();
      }
    };

    setIsLoading(true);
    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const hasProfileChanges =
    fullName.trim() !== savedFullName.trim() || pendingPhotoFile !== null;

  const handleProfilePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setSaveError("Profile photo must be 2MB or smaller.");
      event.target.value = "";
      return;
    }

    setSaveError(null);
    setPendingPhotoFile(file);
    setProfilePhotoUrl((current) => {
      if (current?.startsWith("blob:")) {
        URL.revokeObjectURL(current);
      }
      return URL.createObjectURL(file);
    });

    event.target.value = "";
  };

  const handleSaveProfile = async () => {
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      setSaveError("Full name is required.");
      return;
    }

    if (!hasProfileChanges) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const user = await getCurrentVaultUser();
      if (!user) {
        throw new Error("You must be signed in to update your profile.");
      }

      const result = await saveVaultProfile({
        userId: user.id,
        fullName: trimmedName,
        avatarFile: pendingPhotoFile,
        existingAvatarUrl: savedAvatarUrl,
      });

      if (profilePhotoUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(profilePhotoUrl);
      }

      const nextAvatarUrl = getVaultAvatarUrl(result.user) ?? result.avatarUrl;
      setFullName(trimmedName);
      setSavedFullName(trimmedName);
      setSavedAvatarUrl(nextAvatarUrl);
      setProfilePhotoUrl(nextAvatarUrl);
      setPendingPhotoFile(null);
      setToastMessage("Profile updated");

      window.setTimeout(() => {
        void refreshProfile();
      }, PROFILE_REFRESH_AFTER_TOAST_MS);
    } catch (error) {
      console.error("Failed to save profile:", error);
      setSaveError(
        error instanceof Error ? error.message : "Could not save profile.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleFullNameChange = (value: string) => {
    setSaveError(null);
    setFullName(value);
  };

  useEffect(
    () => () => {
      if (profilePhotoUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(profilePhotoUrl);
      }
    },
    [profilePhotoUrl],
  );

  return {
    preference,
    setTheme,
    photoInputRef,
    mobileNavRef,
    isLoading,
    activeSection,
    setActiveSection,
    email,
    fullName,
    profilePhotoUrl,
    isSaving,
    saveError,
    toastMessage,
    toastVariant,
    setToastMessage,
    mobileNavOverflow,
    hasProfileChanges,
    handleProfilePhotoChange,
    handleSaveProfile,
    handleFullNameChange,
  };
};
