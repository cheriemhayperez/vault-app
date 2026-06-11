"use client";

import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog";

interface DeleteExpenseDialogProps {
  open: boolean;
  expenseLabel: string;
  isDeleting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteExpenseDialog = ({
  open,
  expenseLabel,
  isDeleting = false,
  onClose,
  onConfirm,
}: DeleteExpenseDialogProps) => (
  <DeleteConfirmDialog
    open={open}
    title="Delete Expense"
    message={
      <>
        Are you sure you want to delete &quot;{expenseLabel}&quot;? This action
        cannot be undone.
      </>
    }
    isDeleting={isDeleting}
    onClose={onClose}
    onConfirm={onConfirm}
  />
);
