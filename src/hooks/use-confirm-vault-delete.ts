"use client";

import { useState } from "react";

import { useVaultToast } from "@/hooks/use-vault-toast";
import { runVaultUserAction } from "@/utils/runVaultUserAction";

interface UseConfirmVaultDeleteOptions<T> {
  deleteFn: (item: T, userId: string) => Promise<void>;
  onDeleted: (item: T) => void;
  successMessage: string;
}

/** Shared delete flow: confirm dialog state + safe Supabase delete + toast feedback. */
export const useConfirmVaultDelete = <T>({
  deleteFn,
  onDeleted,
  successMessage,
}: UseConfirmVaultDeleteOptions<T>) => {
  const [deletingItem, setDeletingItem] = useState<T | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toastMessage, toastVariant, setToastMessage, showToastError } =
    useVaultToast();

  const confirmDelete = async () => {
    if (!deletingItem || isDeleting) {
      return;
    }

    const item = deletingItem;
    setIsDeleting(true);
    await runVaultUserAction({
      run: (userId) => deleteFn(item, userId),
      onSuccess: () => {
        onDeleted(item);
        setDeletingItem(null);
        setToastMessage(successMessage);
      },
      onError: showToastError,
    });
    setIsDeleting(false);
  };

  return {
    deletingItem,
    setDeletingItem,
    isDeleting,
    confirmDelete,
    toastMessage,
    toastVariant,
    setToastMessage,
  };
};
