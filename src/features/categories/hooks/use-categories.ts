"use client";

import { useState } from "react";

import {
  deletePayCategoryForUser,
  removePayCategoryFromStore,
} from "@/features/categories/pay-category-store";
import { useConfirmVaultDelete } from "@/hooks/use-confirm-vault-delete";
import { useAppDispatch } from "@/store";
import type { PayCategory, PayCategoryKind } from "@/types/categories";

export const useCategories = () => {
  const dispatch = useAppDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<PayCategory | null>(
    null,
  );
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const {
    deletingItem: deletingCategory,
    setDeletingItem: setDeletingCategory,
    isDeleting: isDeletingCategory,
    confirmDelete: confirmDeleteCategory,
    toastMessage,
    toastVariant,
    setToastMessage,
  } = useConfirmVaultDelete<PayCategory>({
    deleteFn: (category, userId) => deletePayCategoryForUser(userId, category),
    onDeleted: (category) => removePayCategoryFromStore(dispatch, category),
    successMessage: "Category deleted successfully",
  });

  const openAdd = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const openEdit = (category: PayCategory) => {
    setEditingCategory(category);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const openDeleteCategory = (
    category: PayCategory,
    _kind: PayCategoryKind,
  ) => {
    setOpenMenuId(null);
    setDeletingCategory(category);
  };

  return {
    isModalOpen,
    editingCategory,
    openMenuId,
    setOpenMenuId,
    openAdd,
    openEdit,
    closeModal,
    deletingCategory,
    setDeletingCategory,
    isDeletingCategory,
    openDeleteCategory,
    confirmDeleteCategory,
    toastMessage,
    toastVariant,
    setToastMessage,
  };
};
