import { supabase } from "@/lib/supabaseClient";

export const isGoogleAuthEnabled =
  process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";

export const getOAuthRedirectUrl = () => {
  if (typeof window === "undefined") {
    return "";
  }

  return `${window.location.origin}/auth/callback`;
};

export const signInWithGoogle = () =>
  supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: getOAuthRedirectUrl(),
    },
  });
