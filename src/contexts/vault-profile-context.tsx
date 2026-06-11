"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";

import { getVaultAvatarUrl } from "@/api/profile";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentVaultUser, getVaultUserDisplayName } from "@/api/user";

export interface VaultProfileSnapshot {
  displayName: string;
  avatarUrl: string | null;
  email: string;
}

interface VaultProfileContextValue {
  profile: VaultProfileSnapshot;
  refreshProfile: () => Promise<void>;
}

const DEFAULT_PROFILE: VaultProfileSnapshot = {
  displayName: "Guest",
  avatarUrl: null,
  email: "",
};

const VaultProfileContext = createContext<VaultProfileContextValue | null>(null);

const profileFromUser = (user: User | null): VaultProfileSnapshot => ({
  displayName: getVaultUserDisplayName(user),
  avatarUrl: getVaultAvatarUrl(user),
  email: user?.email?.trim() ?? "",
});

export const VaultProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<VaultProfileSnapshot>(DEFAULT_PROFILE);

  const refreshProfile = useCallback(async () => {
    const user = await getCurrentVaultUser();
    setProfile(profileFromUser(user));
  }, []);

  useEffect(() => {
    let isMounted = true;

    const syncProfile = (user: User | null) => {
      if (isMounted) {
        setProfile(profileFromUser(user));
      }
    };

    void getCurrentVaultUser().then(syncProfile);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        event === "INITIAL_SESSION" ||
        event === "SIGNED_IN" ||
        event === "SIGNED_OUT"
      ) {
        syncProfile(session?.user ?? null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      profile,
      refreshProfile,
    }),
    [profile, refreshProfile],
  );

  return (
    <VaultProfileContext.Provider value={value}>
      {children}
    </VaultProfileContext.Provider>
  );
};

export const useVaultProfile = (): VaultProfileContextValue => {
  const context = useContext(VaultProfileContext);
  if (!context) {
    throw new Error("useVaultProfile must be used within VaultProfileProvider");
  }
  return context;
};

export const PROFILE_REFRESH_AFTER_TOAST_MS = 450;
