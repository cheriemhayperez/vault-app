"use client";

import { useEffect } from "react";

/** Closes a modal/dialog when the user presses Escape. */
export const useModalEscape = (
  onClose: () => void,
  options: {
    open: boolean;
    disabled?: boolean;
    nestedOpen?: boolean;
    onNestedClose?: () => void;
  },
): void => {
  const { open, disabled = false, nestedOpen = false, onNestedClose } = options;

  useEffect(() => {
    if (!open || disabled) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }
      if (nestedOpen && onNestedClose) {
        onNestedClose();
        return;
      }
      onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose, disabled, nestedOpen, onNestedClose]);
};
