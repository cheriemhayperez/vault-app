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
    badgeClass: "bg-emerald-50 text-emerald-700",
    countLabel: "categories",
  },
  deduction: {
    label: "Deduction",
    badgeClass: "bg-rose-50 text-rose-700",
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
          className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${meta.badgeClass}`}
        >
          {meta.label}
        </span>
        <span className="text-sm text-slate-500">
          {categories.length} {meta.countLabel}
        </span>
      </div>

      <ul className="space-y-2">
        {categories.map((category) => (
          <li
            key={category.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/60 px-4 py-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                className={`size-2.5 shrink-0 rounded-full ${getCategoryColorSwatchClass(category.color)}`}
              />
              <span className="truncate text-sm font-semibold text-slate-900">
                {category.name}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => onEdit(category)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-slate-600"
                aria-label={`Edit ${category.name}`}
              >
                <Pencil className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(category)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
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

      <div className="flex items-start gap-3 border-b border-slate-100 pb-6">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-violet-50">
          <Tags className="size-5 text-violet-600" />
        </div>
        <div>
          <h2 className="font-semibold tracking-tight text-slate-900">Categories</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Income and deduction types
          </p>
        </div>
      </div>

      <div className="pt-6">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-sm font-semibold text-slate-900">Categories</h3>
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-violet-200 hover:bg-violet-50/50"
          >
            <Plus className="size-4" />
            Add
          </button>
        </div>

        {totalCount === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/40 px-6 py-14 text-center">
            <Tags className="size-10 text-slate-300" strokeWidth={1.5} />
            <p className="mt-4 text-sm font-semibold text-slate-600">
              No categories yet
            </p>
            <p className="mt-1 max-w-xs text-sm text-slate-500">
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
