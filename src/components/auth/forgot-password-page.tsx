"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";

import { AuthField } from "@/components/auth/auth-field";
import { AuthFormError } from "@/components/auth/auth-form-error";
import { VaultLogo } from "@/components/auth/vault-logo";
import { sendPasswordResetEmail } from "@/lib/passwordReset";

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setNotice(null);

    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setIsSending(true);

    try {
      const { error: resetError } = await sendPasswordResetEmail(email);
      if (resetError) {
        setError(resetError.message);
        return;
      }

      setNotice("Check your email for a reset link.");
      setEmail("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh w-full items-center justify-center overflow-x-hidden bg-gradient-to-br from-violet-50/80 via-slate-100 to-sky-100/70 px-4 py-8">
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
            Forgot Password
          </h1>
          <p className="mt-2 max-w-xs text-sm text-slate-500">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-4"
          aria-label="Forgot password form"
        >
          <AuthFormError message={error} />
          <AuthFormError message={notice} variant="success" />

          <AuthField
            label="Email"
            type="email"
            name="reset-email"
            placeholder="Email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError(null);
              setNotice(null);
            }}
            icon={<Mail className="size-4" strokeWidth={2} />}
          />

          <button
            type="submit"
            disabled={isSending}
            className="flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-700 to-indigo-800 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:from-violet-600 hover:to-indigo-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSending ? "Sending…" : "Send Reset Link"}
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
