"use client";

import { useCallback, useState } from "react";

import type { VaultToastVariant } from "@/components/ui/vault-toast";
import { useAutoDismissToast } from "@/hooks/use-auto-dismiss-toast";

interface VaultToastState {
  message: string;
  variant: VaultToastVariant;
}

/** Toast message + variant with auto-dismiss. Success is the default for `setToastMessage`. */
export const useVaultToast = () => {
  const [toast, setToast] = useState<VaultToastState | null>(null);

  useAutoDismissToast(toast?.message ?? null, (value) => {
    if (!value) {
      setToast(null);
    }
  });

  const setToastMessage = useCallback((message: string | null) => {
    if (message === null) {
      setToast(null);
      return;
    }
    setToast({ message, variant: "success" });
  }, []);

  const showToastError = useCallback((message: string) => {
    setToast({ message, variant: "error" });
  }, []);

  const showToastInfo = useCallback((message: string) => {
    setToast({ message, variant: "info" });
  }, []);

  const clearToast = useCallback(() => {
    setToast(null);
  }, []);

  return {
    toastMessage: toast?.message ?? null,
    toastVariant: toast?.variant ?? "success",
    setToastMessage,
    showToastError,
    showToastInfo,
    clearToast,
  };
};
