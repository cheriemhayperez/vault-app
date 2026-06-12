import { supabase } from "@/lib/supabaseClient";

export const getPasswordResetRedirectUrl = () => {
  if (typeof window === "undefined") {
    return "";
  }

  return `${window.location.origin}/reset-password`;
};

export const sendPasswordResetEmail = (email: string) =>
  supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: getPasswordResetRedirectUrl(),
  });

export const updatePassword = (password: string) =>
  supabase.auth.updateUser({ password });
