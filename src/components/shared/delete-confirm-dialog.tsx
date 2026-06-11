"use client";

import type { ReactNode } from "react";

import { DeleteConfirmButton } from "@/components/shared/delete-confirm-button";
import { VaultModalFooter } from "@/components/shared/vault-modal-footer";
import { VaultModalHeader } from "@/components/shared/vault-modal-header";
import {
  VaultModalOverlay,
  vaultModalPanelClass,
} from "@/components/ui/vault-modal-overlay";
import { useModalEscape } from "@/hooks/use-modal-escape";

interface DeleteConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  isDeleting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmDialog = ({
  open,
  title,
  message,
  isDeleting = false,
  onClose,
  onConfirm,
}: DeleteConfirmDialogProps) => {
  const titleId = title.toLowerCase().replace(/\s+/g, "-");

  useModalEscape(onClose, { open, disabled: isDeleting });

  if (!open) {
    return null;
  }

  return (
    <VaultModalOverlay
      ariaLabelledBy={titleId}
      onClose={isDeleting ? () => undefined : onClose}
    >
      <div className={`${vaultModalPanelClass} max-w-md`}>
        <VaultModalHeader
          titleId={titleId}
          title={title}
          onClose={onClose}
          closeDisabled={isDeleting}
        />

        <p className="mt-3 text-sm text-slate-600">{message}</p>

        <VaultModalFooter onCancel={onClose} cancelDisabled={isDeleting}>
          <DeleteConfirmButton isProcessing={isDeleting} onClick={onConfirm} />
        </VaultModalFooter>
      </div>
    </VaultModalOverlay>
  );
};
