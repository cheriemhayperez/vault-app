"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";

interface FormWarningBannerProps {
  title: string;
  message: ReactNode;
  actionHref?: string;
  actionLabel?: string;
  onActionClick?: () => void;
}

export const FormWarningBanner = ({
  title,
  message,
  actionHref,
  actionLabel = "Go to Manage Categories",
  onActionClick,
}: FormWarningBannerProps) => (
  <div
    role="alert"
    className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3"
  >
    <AlertTriangle
      className="mt-0.5 size-5 shrink-0 text-amber-600"
      aria-hidden
    />
    <div className="min-w-0 flex-1">
      <p className="text-sm font-semibold text-amber-950">{title}</p>
      <p className="mt-1 text-sm leading-snug text-amber-900/90">{message}</p>
      {actionHref ? (
        <Link
          href={actionHref}
          onClick={onActionClick}
          className="mt-2.5 inline-flex items-center rounded-md border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-950 shadow-sm transition hover:bg-amber-100"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  </div>
);
