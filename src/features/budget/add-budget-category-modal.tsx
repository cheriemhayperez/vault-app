"use client";

import { useEffect, useState } from "react";

import { ColorSwatchPicker } from "@/components/shared/color-swatch-picker";
import { FormErrorBanner } from "@/components/shared/form-error-banner";
import { FormFieldLabel } from "@/components/shared/form-field-label";
import { VaultModalFooter } from "@/components/shared/vault-modal-footer";
import { VaultModalHeader } from "@/components/shared/vault-modal-header";
import { VaultSubmitButton } from "@/components/shared/vault-submit-button";
import { Input } from "@/components/ui/input";
import {
  VaultModalOverlay,
  vaultModalPanelClass,
} from "@/components/ui/vault-modal-overlay";
import {
  insertBudgetCategory,
  resolveBudgetMonthlyPeriod,
  updateBudgetCategory,
} from "@/api/categories";
import { getCurrentVaultUser } from "@/api/user";
import { useModalEscape } from "@/hooks/use-modal-escape";
import { useAppDispatch } from "@/store";
import { useDashboardPeriod } from "@/contexts/dashboard-period-context";
import {
  addBudgetCategory,
  replaceBudgetCategory,
} from "@/store/slices/budgetCategoriesSlice";
import {
  BUDGET_CATEGORY_COLOR_OPTIONS,
  DEFAULT_BUDGET_CATEGORY_COLOR,
  getBucketCategoryNamePlaceholder,
  getBucketPercentLabel,
  type BudgetCategoryColorId,
  type BudgetExpenseCategory,
} from "@/types/budgetCategories";
import type { BudgetCategory } from "@/types/financial";

interface AddBudgetCategoryModalProps {
  open: boolean;
  bucket: BudgetCategory | null;
  editingCategory: BudgetExpenseCategory | null;
  onClose: () => void;
  onSuccess?: (message: string) => void;
}

export const AddBudgetCategoryModal = ({
  open,
  bucket,
  editingCategory,
  onClose,
  onSuccess,
}: AddBudgetCategoryModalProps) => {
  const dispatch = useAppDispatch();
  const { filter } = useDashboardPeriod();
  const [name, setName] = useState("");
  const [sharePercent, setSharePercent] = useState("0");
  const [color, setColor] = useState<BudgetCategoryColorId>(
    DEFAULT_BUDGET_CATEGORY_COLOR,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const isEdit = Boolean(editingCategory);
  const activeBucket = editingCategory?.bucket ?? bucket;

  useEffect(() => {
    if (!open) {
      return;
    }
    if (editingCategory) {
      setName(editingCategory.name);
      setSharePercent(String(editingCategory.sharePercent));
      setColor(editingCategory.color);
    } else {
      setName("");
      setSharePercent("0");
      setColor(DEFAULT_BUDGET_CATEGORY_COLOR);
    }
    setSaveError(null);
  }, [open, editingCategory]);

  useModalEscape(onClose, { open: open && Boolean(activeBucket) });

  if (!open || !activeBucket) {
    return null;
  }

  const parsedSharePercent = Number(sharePercent);
  const safeSharePercent = Number.isFinite(parsedSharePercent)
    ? Math.min(100, Math.max(0, parsedSharePercent))
    : 0;
  const canSubmit = name.trim().length > 0;

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed || isSaving) {
      return;
    }

    const monthlyPeriod =
      isEdit && editingCategory
        ? editingCategory.monthlyPeriod
        : resolveBudgetMonthlyPeriod(filter);

    const payload = {
      name: trimmed,
      bucket: activeBucket,
      color,
      sharePercent: safeSharePercent,
      monthlyPeriod,
    };

    setIsSaving(true);
    setSaveError(null);

    try {
      const user = await getCurrentVaultUser();
      if (!user) {
        return;
      }

      if (isEdit && editingCategory) {
        const saved = await updateBudgetCategory(
          user.id,
          editingCategory.id,
          payload,
        );
        dispatch(replaceBudgetCategory(saved));
      } else {
        const saved = await insertBudgetCategory(user.id, payload);
        dispatch(addBudgetCategory(saved));
      }

      onSuccess?.(
        isEdit
          ? "Budget category updated successfully"
          : "Budget category added successfully",
      );
      onClose();
    } catch (error) {
      console.error("Failed to save budget category:", error);
      setSaveError(
        error instanceof Error ? error.message : "Could not save budget category.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <VaultModalOverlay
      ariaLabelledBy="budget-category-modal-title"
      onClose={onClose}
    >
      <div className={`${vaultModalPanelClass} max-w-sm`}>
        <VaultModalHeader
          titleId="budget-category-modal-title"
          title={isEdit ? "Edit Category" : "Add Category"}
          onClose={onClose}
        />

        <div className="mt-6 space-y-4">
          {saveError ? <FormErrorBanner message={saveError} /> : null}

          <div className="space-y-1.5">
            <FormFieldLabel htmlFor="budget-category-name" required>
              Name
            </FormFieldLabel>
            <Input
              id="budget-category-name"
              autoFocus
              value={name}
              placeholder={getBucketCategoryNamePlaceholder(activeBucket)}
              className="h-10"
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleSubmit();
                }
              }}
            />
          </div>

          <div className="space-y-1.5">
            <FormFieldLabel htmlFor="budget-category-share-percent">
              {getBucketPercentLabel(activeBucket)}
            </FormFieldLabel>
            <div className="flex items-center gap-2">
              <Input
                id="budget-category-share-percent"
                type="number"
                min={0}
                max={100}
                value={sharePercent}
                className="h-10 w-24"
                onChange={(event) => setSharePercent(event.target.value)}
              />
              <span className="text-sm text-slate-500">%</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <FormFieldLabel htmlFor="budget-category-color-blue">Color</FormFieldLabel>
            <ColorSwatchPicker
              layout="grid"
              options={BUDGET_CATEGORY_COLOR_OPTIONS}
              value={color}
              onChange={(id) => setColor(id as BudgetCategoryColorId)}
              getButtonId={(optionId) =>
                optionId === "blue" ? "budget-category-color-blue" : undefined
              }
            />
          </div>
        </div>

        <VaultModalFooter onCancel={onClose} cancelDisabled={isSaving}>
          <VaultSubmitButton
            type="button"
            label={isEdit ? "Save" : "Add"}
            mode="save"
            isProcessing={isSaving}
            disabled={!canSubmit}
            onClick={() => void handleSubmit()}
          />
        </VaultModalFooter>
      </div>
    </VaultModalOverlay>
  );
};
