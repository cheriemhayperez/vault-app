"use client";

import { useEffect } from "react";

export const useAutoDismissToast = (
  message: string | null,
  setMessage: (value: string | null) => void,
  delayMs = 3000,
): void => {
  useEffect(() => {
    if (!message) {
      return;
    }

    const timer = window.setTimeout(() => setMessage(null), delayMs);
    return () => window.clearTimeout(timer);
  }, [message, setMessage, delayMs]);
};
