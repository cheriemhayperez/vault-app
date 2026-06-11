"use client";

import { AlertCircle } from "lucide-react";
import type { ReactNode } from "react";

interface FormErrorBannerProps {
  message: ReactNode;
  variant?: "form" | "page";
}

export const FormErrorBanner = ({
  message,
  variant = "form",
}: FormErrorBannerProps) => {
  if (variant === "page") {
    return (
      <p role="alert" className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {message}
      </p>
    );
  }

  return (
    <div
      role="alert"
      className="flex gap-3 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-3"
    >
      <AlertCircle
        className="mt-0.5 size-5 shrink-0 text-rose-600"
        aria-hidden
      />
      <p className="min-w-0 flex-1 text-sm leading-snug text-rose-900">{message}</p>
    </div>
  );
};
