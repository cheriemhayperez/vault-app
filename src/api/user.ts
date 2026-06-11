import type { User } from "@supabase/supabase-js";

import { formatSupabaseError } from "@/lib/supabaseErrors";
import { supabase } from "@/lib/supabaseClient";

export const getVaultUserDisplayName = (user: User | null): string => {
  if (!user) {
    return "Guest";
  }

  const metadata = user.user_metadata ?? {};
  const fullName =
    typeof metadata.full_name === "string"
      ? metadata.full_name.trim()
      : typeof metadata.name === "string"
        ? metadata.name.trim()
        : "";

  if (fullName) {
    return fullName;
  }

  const email = user.email?.trim();
  if (!email) {
    return "Vault User";
  }

  const username = email.split("@")[0]?.trim();
  return username || "Vault User";
};

export const getVaultUserInitials = (displayName: string): string => {
  const parts = displayName
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }

  const compact = displayName.replace(/[^a-zA-Z0-9]/g, "");
  return (compact.slice(0, 2) || "VU").toUpperCase();
};

export const getCurrentVaultUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.warn("Vault auth:", formatSupabaseError(error));
    return null;
  }
  return data.user;
};
