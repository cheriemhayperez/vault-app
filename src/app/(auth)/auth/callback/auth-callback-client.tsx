"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { PageLoadingSpinner } from "@/components/ui/page-loading-spinner";
import { supabase } from "@/lib/supabaseClient";

export const AuthCallbackClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const finishSignIn = async () => {
      const oauthError = searchParams.get("error_description");
      if (oauthError) {
        if (mounted) {
          setErrorMessage(oauthError);
        }
        return;
      }

      const code = searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          if (mounted) {
            setErrorMessage(error.message);
          }
          return;
        }
      } else {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          if (mounted) {
            setErrorMessage(error.message);
          }
          return;
        }

        if (!data.session) {
          if (mounted) {
            setErrorMessage("Sign-in could not be completed. Please try again.");
          }
          return;
        }
      }

      router.replace("/dashboard");
    };

    void finishSignIn();

    return () => {
      mounted = false;
    };
  }, [router, searchParams]);

  if (errorMessage) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="max-w-md text-sm text-slate-600">{errorMessage}</p>
        <button
          type="button"
          onClick={() => router.replace("/login")}
          className="rounded-xl bg-violet-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-600"
        >
          Back to login
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center">
      <PageLoadingSpinner label="Signing you in…" />
    </div>
  );
};
