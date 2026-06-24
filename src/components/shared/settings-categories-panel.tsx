"use client";

import { useState } from "react";
import { Pencil, Plus, Tags, Trash2 } from "lucide-react";

import { AddCategoryModal } from "@/features/categories/add-category-modal";
import { VaultToast } from "@/components/ui/vault-toast";
import { DeleteCategoryDialog } from "@/features/categories/delete-category-dialog";
import {
  deletePayCategoryForUser,
  removePayCategoryFromStore,
} from "@/features/categories/pay-category-store";
import { useConfirmVaultDelete } from "@/hooks/use-confirm-vault-delete";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  getCategoryColorSwatchClass,
  type PayCategory,
  type PayCategoryKind,
} from "@/types/categories";

const KIND_META: Record<
  PayCategoryKind,
  { label: string; badgeClass: string; countLabel: string }
> = {
  income: {
    label: "Income",
    badgeClass:
      "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/50 dark:bg-emerald-500/10 dark:text-emerald-400",
    countLabel: "categories",
  },
  deduction: {
    label: "Deduction",
    badgeClass:
      "border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/50 dark:bg-rose-500/10 dark:text-rose-400",
    countLabel: "categories",
  },
};

interface CategoryGroupProps {
  kind: PayCategoryKind;
  categories: PayCategory[];
  onEdit: (category: PayCategory) => void;
  onDelete: (category: PayCategory) => void;
}

const CategoryGroup = ({
  kind,
  categories,
  onEdit,
  onDelete,
}: CategoryGroupProps) => {
  const meta = KIND_META[kind];

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.badgeClass}`}
        >
          {meta.label}
        </span>
        <span className="text-sm text-slate-500 dark:text-zinc-500">
          {categories.length} {meta.countLabel}
        </span>
      </div>

      <ul className="space-y-2">
        {categories.map((category) => (
          <li
            key={category.id}
            className="vault-category-card group flex items-center justify-between gap-3 rounded-lg px-4 py-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                className={`size-2.5 shrink-0 rounded-full ${getCategoryColorSwatchClass(category.color)}`}
              />
              <span className="truncate text-sm font-semibold text-slate-900 dark:text-zinc-50">
                {category.name}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-0.5">
              <button
                type="button"
                onClick={() => onEdit(category)}
                className="vault-category-action-edit"
                aria-label={`Edit ${category.name}`}
              >
                <Pencil className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(category)}
                className="vault-category-action-delete"
                aria-label={`Delete ${category.name}`}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const SettingsCategoriesPanel = () => {
  const dispatch = useAppDispatch();
  const { income, deduction } = useAppSelector((state) => state.categories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<PayCategory | null>(
    null,
  );

  const {
    deletingItem: deletingCategory,
    setDeletingItem: setDeletingCategory,
    isDeleting,
    confirmDelete,
    toastMessage,
    toastVariant,
    setToastMessage,
  } = useConfirmVaultDelete<PayCategory>({
    deleteFn: (category, userId) => deletePayCategoryForUser(userId, category),
    onDeleted: (category) => removePayCategoryFromStore(dispatch, category),
    successMessage: "Category deleted successfully",
  });

  const totalCount = income.length + deduction.length;

  const openAdd = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const openEdit = (category: PayCategory) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  return (
    <>
      {toastMessage ? (
        <VaultToast
          message={toastMessage}
          variant={toastVariant}
          onClose={() => setToastMessage(null)}
        />
      ) : null}

      <div
        className={`settings-panel-header settings-panel-header--categories${
          totalCount === 0 ? " settings-panel-header--categories-empty" : ""
        }`}
      >
        <div className="vault-settings-panel-header-icon">
          <Tags className="size-4" />
        </div>
        <div>
          <h2 className="font-semibold tracking-tight text-slate-900 dark:text-zinc-50">
            Categories
          </h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-zinc-400">
            Income and deduction types
          </p>
        </div>
      </div>

      <div
        className={`settings-panel-body settings-panel-body--categories${
          totalCount === 0 ? " settings-panel-body--categories-empty" : ""
        }`}
      >
        <div className="settings-panel-categories-toolbar flex items-center justify-between gap-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-50">
            Categories
          </h3>
          <button
            type="button"
            onClick={openAdd}
            className="vault-category-add-btn"
          >
            <Plus className="size-4" />
            Add
          </button>
        </div>

        {totalCount === 0 ? (
          <div className="vault-settings-categories-empty mt-6">
            <Tags
              className="vault-settings-categories-empty-icon size-10"
              strokeWidth={1.5}
            />
            <p className="vault-settings-categories-empty-title mt-4 text-sm font-semibold">
              No categories yet
            </p>
            <p className="vault-settings-categories-empty-copy mt-1 max-w-xs text-sm">
              Add categories to organize your income and deductions.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            <CategoryGroup
              kind="income"
              categories={income}
              onEdit={openEdit}
              onDelete={setDeletingCategory}
            />
            <CategoryGroup
              kind="deduction"
              categories={deduction}
              onEdit={openEdit}
              onDelete={setDeletingCategory}
            />
          </div>
        )}
      </div>

      <AddCategoryModal
        open={isModalOpen}
        editingCategory={editingCategory}
        onClose={closeModal}
        onSuccess={setToastMessage}
      />

      <DeleteCategoryDialog
        open={Boolean(deletingCategory)}
        categoryName={deletingCategory?.name ?? ""}
        isDeleting={isDeleting}
        onClose={() => setDeletingCategory(null)}
        onConfirm={() => void confirmDelete()}
      />
    </>
  );
};
