"use client";

import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog";

interface DeleteRecordDialogProps {
  open: boolean;
  isDeleting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteRecordDialog = ({
  open,
  isDeleting = false,
  onClose,
  onConfirm,
}: DeleteRecordDialogProps) => (
  <DeleteConfirmDialog
    open={open}
    title="Delete Record"
    message="Are you sure you want to delete this record? This action cannot be undone."
    isDeleting={isDeleting}
    onClose={onClose}
    onConfirm={onConfirm}
  />
);
