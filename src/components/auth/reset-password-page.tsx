"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";

import { AuthField } from "@/components/auth/auth-field";
import { AuthFormError } from "@/components/auth/auth-form-error";
import { VaultLogo } from "@/components/auth/vault-logo";
import { PageLoadingSpinner } from "@/components/ui/page-loading-spinner";
import { updatePassword } from "@/lib/passwordReset";
import { supabase } from "@/lib/supabaseClient";

const MIN_PASSWORD_LENGTH = 8;

const ResetPasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const prepareRecoverySession = async () => {
      const oauthError = searchParams.get("error_description");
      if (oauthError) {
        if (mounted) {
          setInitError(oauthError);
        }
        return;
      }

      const code = searchParams.get("code");
      if (code) {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          if (mounted) {
            setInitError(exchangeError.message);
          }
          return;
        }
      } else {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          if (mounted) {
            setInitError(sessionError.message);
          }
          return;
        }

        if (!data.session) {
          if (mounted) {
            setInitError(
              "This reset link is invalid or has expired. Please request a new one.",
            );
          }
          return;
        }
      }

      if (mounted) {
        setIsReady(true);
      }
    };

    void prepareRecoverySession();

    return () => {
      mounted = false;
    };
  }, [searchParams]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSaving(true);

    try {
      const { error: updateError } = await updatePassword(password);
      if (updateError) {
        setError(updateError.message);
        return;
      }

      await supabase.auth.signOut();
      router.replace("/login?reset=success");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (initError) {
    return (
      <div className="relative flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-gradient-to-br from-violet-50/80 via-slate-100 to-sky-100/70 px-4 py-8">
        <div className="relative w-full max-w-md rounded-2xl bg-white px-8 py-10 text-center shadow-[0_24px_70px_-18px_rgba(76,29,149,0.35)] sm:px-10 sm:py-12">
          <AuthFormError message={initError} />
          <Link
            href="/forgot-password"
            className="mt-6 inline-block text-sm font-medium text-violet-700 transition hover:text-violet-600"
          >
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-50/80 via-slate-100 to-sky-100/70">
        <PageLoadingSpinner label="Verifying reset link…" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-gradient-to-br from-violet-50/80 via-slate-100 to-sky-100/70 px-4 py-8">
      <div
        className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-violet-300/30 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-8 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl"
        aria-hidden
      />

      <div className="relative w-full max-w-md rounded-2xl bg-white px-8 py-10 shadow-[0_24px_70px_-18px_rgba(76,29,149,0.35)] sm:px-10 sm:py-12">
        <div className="flex flex-col items-center text-center">
          <VaultLogo className="h-10 w-auto" height={40} />
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
            Reset Password
          </h1>
          <p className="mt-2 max-w-xs text-sm text-slate-500">
            Enter your new password below
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-4"
          aria-label="Reset password form"
        >
          <AuthFormError message={error} />

          <AuthField
            label="New Password"
            type="password"
            name="new-password"
            placeholder="New password"
            autoComplete="new-password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError(null);
            }}
            icon={<Lock className="size-4" strokeWidth={2} />}
          />

          <AuthField
            label="Confirm Password"
            type="password"
            name="confirm-password"
            placeholder="Confirm password"
            autoComplete="new-password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
              setError(null);
            }}
            icon={<Lock className="size-4" strokeWidth={2} />}
          />

          <button
            type="submit"
            disabled={isSaving}
            className="flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-700 to-indigo-800 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:from-violet-600 hover:to-indigo-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving…" : "Update Password"}
          </button>
        </form>

        <p className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 transition hover:text-violet-600"
          >
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export const ResetPasswordPage = () => (
  <Suspense
    fallback={
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-50/80 via-slate-100 to-sky-100/70">
        <PageLoadingSpinner label="Verifying reset link…" />
      </div>
    }
  >
    <ResetPasswordForm />
  </Suspense>
);
