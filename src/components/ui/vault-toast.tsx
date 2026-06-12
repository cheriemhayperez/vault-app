"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Check, Info, X } from "lucide-react";

export type VaultToastVariant = "success" | "error" | "info";

interface VaultToastProps {
  message: string;
  onClose: () => void;
  variant?: VaultToastVariant;
}

const variantStyles: Record<
  VaultToastVariant,
  {
    container: string;
    iconWrap: string;
    text: string;
    close: string;
  }
> = {
  success: {
    container: "border-violet-200 bg-violet-50 text-violet-900",
    iconWrap: "bg-violet-600",
    text: "text-violet-900",
    close: "text-violet-600 hover:bg-violet-100/80",
  },
  error: {
    container: "border-rose-200 bg-rose-50 text-rose-900",
    iconWrap: "bg-rose-600",
    text: "text-rose-900",
    close: "text-rose-600 hover:bg-rose-100/80",
  },
  info: {
    container: "border-sky-200 bg-sky-50 text-sky-900",
    iconWrap: "bg-sky-600",
    text: "text-sky-900",
    close: "text-sky-600 hover:bg-sky-100/80",
  },
};

export const VaultToast = ({
  message,
  onClose,
  variant = "success",
}: VaultToastProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const styles = variantStyles[variant];

  useEffect(() => {
    const frameId = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`fixed right-4 top-20 z-[100] flex max-w-sm items-center gap-3 rounded-xl border py-3 pl-3 pr-2 text-sm font-medium shadow-lg transition-all duration-300 ease-out md:right-6 ${styles.container} ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "-translate-y-2 opacity-0"
      }`}
    >
      <span
        className={`flex size-6 shrink-0 items-center justify-center rounded-full ${styles.iconWrap}`}
        aria-hidden
      >
        {variant === "error" ? (
          <AlertCircle className="size-3.5 text-white" strokeWidth={2.5} />
        ) : variant === "info" ? (
          <Info className="size-3.5 text-white" strokeWidth={2.5} />
        ) : (
          <Check className="size-3.5 text-white" strokeWidth={3} />
        )}
      </span>
      <span className={`min-w-0 flex-1 leading-snug ${styles.text}`}>
        {message}
      </span>
      <button
        type="button"
        onClick={onClose}
        className={`flex size-7 shrink-0 items-center justify-center rounded-full transition ${styles.close}`}
        aria-label="Dismiss notification"
      >
        <X className="size-4" />
      </button>
    </div>
  );
};
