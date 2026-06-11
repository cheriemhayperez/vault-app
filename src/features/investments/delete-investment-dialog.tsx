"use client";

import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog";

interface DeleteInvestmentDialogProps {
  open: boolean;
  isDeleting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteInvestmentDialog = ({
  open,
  isDeleting = false,
  onClose,
  onConfirm,
}: DeleteInvestmentDialogProps) => (
  <DeleteConfirmDialog
    open={open}
    title="Delete Investment"
    message="Are you sure you want to permanently delete this investment? This action cannot be undone."
    isDeleting={isDeleting}
    onClose={onClose}
    onConfirm={onConfirm}
  />
);
