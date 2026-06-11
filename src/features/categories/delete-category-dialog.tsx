"use client";

import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog";

interface DeleteCategoryDialogProps {
  open: boolean;
  categoryName: string;
  isDeleting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteCategoryDialog = ({
  open,
  categoryName,
  isDeleting = false,
  onClose,
  onConfirm,
}: DeleteCategoryDialogProps) => (
  <DeleteConfirmDialog
    open={open}
    title="Delete Category"
    message={
      <>
        Are you sure you want to delete &quot;{categoryName}&quot;? This action
        cannot be undone.
      </>
    }
    isDeleting={isDeleting}
    onClose={onClose}
    onConfirm={onConfirm}
  />
);
