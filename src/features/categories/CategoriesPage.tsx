"use client";

import { Plus } from "lucide-react";

import { AddCategoryModal } from "./add-category-modal";
import { DeleteCategoryDialog } from "./delete-category-dialog";
import { RecordActionsMenu } from "@/components/shared/record-actions-menu";
import { VaultPageHeaderActions } from "@/components/layout/vault-page-header-actions";
import { Button } from "@/components/ui/button";
import { VaultToast } from "@/components/ui/vault-toast";
import { useAppSelector } from "@/store";
import { useCategories } from "@/features/categories/hooks/use-categories";
import {
  CATEGORY_ACTIONS_TRIGGER_CLASS,
  DEDUCTION_PANEL,
  INCOME_PANEL,
} from "@/features/categories/config";
import {
  getCategoryColorSwatchClass,
  type PayCategory,
  type PayCategoryKind,
} from "@/types/categories";

const CategoryPanel = ({
  kind,
  title,
  titleClass,
  description,
  emptyLabel,
  openMenuId,
  onOpenMenuChange,
  onEdit,
  onDelete,
}: {
  kind: PayCategoryKind;
  title: string;
  titleClass: string;
  description: string;
  emptyLabel: string;
  openMenuId: string | null;
  onOpenMenuChange: (id: string | null) => void;
  onEdit: (category: PayCategory) => void;
  onDelete: (category: PayCategory, kind: PayCategoryKind) => void;
}) => {
  const categories = useAppSelector((state) => state.categories[kind]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h2
        className={`text-[11px] font-bold uppercase tracking-wider ${titleClass}`}
      >
        {title}
      </h2>
      <p className="mt-1 text-sm text-slate-500">{description}</p>

      {categories.length === 0 ? (
        <p className="mt-8 text-sm text-slate-400">{emptyLabel}</p>
      ) : (
        <ul className="mt-5 space-y-3">
          {categories.map((category) => (
            <li
              key={category.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={`size-2.5 shrink-0 rounded-full ${getCategoryColorSwatchClass(category.color)}`}
                />
                <span className="truncate text-sm font-semibold text-slate-900">
                  {category.name}
                </span>
              </div>
              <RecordActionsMenu
                isOpen={openMenuId === category.id}
                onOpenChange={(isOpen) =>
                  onOpenMenuChange(isOpen ? category.id : null)
                }
                onEdit={() => onEdit(category)}
                onDelete={() => onDelete(category, kind)}
                triggerClassName={CATEGORY_ACTIONS_TRIGGER_CLASS}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export const CategoriesPage = () => {
  const {
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
  } = useCategories();

  return (
    <>
      {toastMessage ? (
        <VaultToast
          message={toastMessage}
          variant={toastVariant}
          onClose={() => setToastMessage(null)}
        />
      ) : null}

      <VaultPageHeaderActions>
        <Button
          type="button"
          className="shrink-0 rounded-lg bg-violet-600 px-4 hover:bg-violet-700"
          onClick={openAdd}
        >
          <Plus className="mr-1.5 size-4" />
          Add Category
        </Button>
      </VaultPageHeaderActions>

      <div className="space-y-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <CategoryPanel
            {...INCOME_PANEL}
            openMenuId={openMenuId}
            onOpenMenuChange={setOpenMenuId}
            onEdit={openEdit}
            onDelete={openDeleteCategory}
          />
          <CategoryPanel
            {...DEDUCTION_PANEL}
            openMenuId={openMenuId}
            onOpenMenuChange={setOpenMenuId}
            onEdit={openEdit}
            onDelete={openDeleteCategory}
          />
        </div>
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
        isDeleting={isDeletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={() => void confirmDeleteCategory()}
      />
    </>
  );
};
