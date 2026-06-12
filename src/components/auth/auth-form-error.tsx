"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface AuthFormErrorProps {
  message: string | null;
  variant?: "error" | "success" | "info";
  tone?: "light" | "glass";
  dismissible?: boolean;
  onDismiss?: () => void;
  autoDismissMs?: number;
}

export const AuthFormError = ({
  message,
  variant = "error",
  tone = "light",
  dismissible = false,
  onDismiss,
  autoDismissMs,
}: AuthFormErrorProps) => {
  useEffect(() => {
    if (!message || !onDismiss || !autoDismissMs) {
      return;
    }

    const timer = window.setTimeout(onDismiss, autoDismissMs);
    return () => window.clearTimeout(timer);
  }, [message, onDismiss, autoDismissMs]);

  if (!message) {
    return null;
  }

  const styles =
    tone === "glass"
      ? variant === "success"
        ? "border-violet-400/30 bg-violet-500/10 text-violet-200"
        : variant === "info"
          ? "border-sky-400/30 bg-sky-500/10 text-sky-200"
          : "border-rose-400/30 bg-rose-500/10 text-rose-300"
      : variant === "success"
        ? "border-violet-100 bg-violet-50 text-violet-700"
        : variant === "info"
          ? "border-sky-100 bg-sky-50 text-sky-700"
          : "border-rose-100 bg-rose-50 text-rose-600";

  const closeStyles =
    tone === "glass"
      ? variant === "success"
        ? "text-violet-200 hover:bg-violet-500/20"
        : variant === "info"
          ? "text-sky-200 hover:bg-sky-500/20"
          : "text-rose-300 hover:bg-rose-500/20"
      : variant === "success"
        ? "text-violet-600 hover:bg-violet-100/80"
        : variant === "info"
          ? "text-sky-600 hover:bg-sky-100/80"
          : "text-rose-600 hover:bg-rose-100/80";

  const showDismiss = dismissible && onDismiss;

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${styles}`}
    >
      <p className="min-w-0 flex-1 leading-snug">{message}</p>
      {showDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full transition ${closeStyles}`}
          aria-label="Dismiss message"
        >
          <X className="size-3.5" strokeWidth={2.5} />
        </button>
      ) : null}
    </div>
  );
};
