"use client";

import { Loader2, X } from "lucide-react";

import { VaultModalCancelButton } from "@/components/shared/vault-modal-cancel-button";
import {
  VaultModalOverlay,
  vaultModalPanelClass,
} from "@/components/ui/vault-modal-overlay";
import { useModalEscape } from "@/hooks/use-modal-escape";

export type ReminderActionVariant =
  | "dismiss"
  | "complete"
  | "delete"
  | "restore";

const COPY: Record<
  ReminderActionVariant,
  { title: string; body: string; confirm: string; confirmClass: string }
> = {
  dismiss: {
    title: "Dismiss Reminder",
    body: "Are you sure you want to dismiss this reminder? You can restore it later from the Dismissed tab.",
    confirm: "Confirm",
    confirmClass: "bg-violet-600 hover:bg-violet-700",
  },
  complete: {
    title: "Mark as Completed",
    body: "Mark this reminder as completed? This will create the next occurrence based on your recurrence pattern.",
    confirm: "Confirm",
    confirmClass: "bg-violet-600 hover:bg-violet-700",
  },
  restore: {
    title: "Restore Reminder",
    body: "Are you sure you want to restore this reminder to pending status?",
    confirm: "Confirm",
    confirmClass: "bg-violet-600 hover:bg-violet-700",
  },
  delete: {
    title: "Delete Reminder",
    body: "Are you sure you want to delete this reminder? This action cannot be undone.",
    confirm: "Delete",
    confirmClass: "bg-rose-500 hover:bg-rose-600",
  },
};

interface ReminderActionDialogProps {
  open: boolean;
  variant: ReminderActionVariant;
  isLoading?: boolean;
  isClosing?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ReminderActionDialog = ({
  open,
  variant,
  isLoading = false,
  isClosing = false,
  onClose,
  onConfirm,
}: ReminderActionDialogProps) => {
  const copy = COPY[variant];
  const isLocked = isLoading || isClosing;

  useModalEscape(onClose, { open, disabled: isLocked });

  if (!open) {
    return null;
  }

  return (
    <VaultModalOverlay
      ariaLabelledBy="reminder-action-title"
      onClose={isLocked ? () => undefined : onClose}
    >
      <div
        className={`${vaultModalPanelClass} max-w-md transition-all duration-300 ease-in-out ${
          isClosing ? "scale-[0.98] opacity-0" : "scale-100 opacity-100"
        }`}
      >
        <div className="relative">
          <button
            type="button"
            onClick={onClose}
            disabled={isLocked}
            className="vault-modal-close-btn absolute right-0 top-0 disabled:opacity-50"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
          <h2
            id="reminder-action-title"
            className="pr-8 text-center text-lg font-semibold tracking-tight text-slate-900 md:pr-0 md:text-left"
          >
            {copy.title}
          </h2>
        </div>

        <p className="mt-3 text-center text-sm text-slate-600 md:text-left">
          {copy.body}
        </p>

        <div className="mt-6 flex flex-col gap-2 md:flex-row md:justify-end">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLocked}
            aria-busy={isLoading}
            className={`order-1 w-full rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 ease-in-out disabled:cursor-not-allowed md:order-2 md:w-auto md:py-2 ${copy.confirmClass} ${
              isLoading ? "opacity-90" : "hover:opacity-100"
            }`}
          >
            <span className="inline-flex min-h-5 min-w-[6.5rem] items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  {variant === "delete" ? "Deleting..." : "Processing..."}
                </>
              ) : (
                copy.confirm
              )}
            </span>
          </button>
          <VaultModalCancelButton
            onClick={onClose}
            disabled={isLocked}
            className="order-2 w-full py-2.5 transition disabled:cursor-not-allowed md:order-1 md:w-auto md:py-2"
          />
        </div>
      </div>
    </VaultModalOverlay>
  );
};
