"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface VaultModalOverlayProps {
  onClose: () => void;
  children: ReactNode;
  ariaLabelledBy?: string;
}

export const VaultModalOverlay = ({
  onClose,
  children,
  ariaLabelledBy,
}: VaultModalOverlayProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={ariaLabelledBy}
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40"
        aria-label="Close dialog"
        onClick={onClose}
      />
      {children}
    </div>,
    document.body,
  );
};

export const vaultModalPanelClass =
  "relative z-10 w-full max-w-lg max-h-[min(90dvh,680px)] overflow-y-auto rounded-xl border border-slate-100 bg-white p-6 shadow-xl";
