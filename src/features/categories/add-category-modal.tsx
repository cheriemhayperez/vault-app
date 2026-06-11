"use client";

import { useCallback, useEffect, useState } from "react";

import { CurrencyAmountField } from "@/components/shared/currency-amount-field";
import { ColorSwatchPicker } from "@/components/shared/color-swatch-picker";
import { FormErrorBanner } from "@/components/shared/form-error-banner";
import { FormFieldLabel } from "@/components/shared/form-field-label";
import { RecordCombobox } from "@/components/shared/record-combobox";
import { VaultModalFooter } from "@/components/shared/vault-modal-footer";
import { VaultModalHeader } from "@/components/shared/vault-modal-header";
import { VaultSubmitButton } from "@/components/shared/vault-submit-button";
import { Input, VAULT_FIELD_INPUT_CLASS } from "@/components/ui/input";
import {
  VaultModalOverlay,
  vaultModalPanelClass,
} from "@/components/ui/vault-modal-overlay";
import {
  insertPayCategory,
  updatePayCategory,
} from "@/api/categories";
import { getCurrentVaultUser } from "@/api/user";
import { useModalEscape } from "@/hooks/use-modal-escape";
import { useAppDispatch } from "@/store";
import { addCategory, replaceCategory } from "@/store/slices/categoriesSlice";
import {
  CATEGORY_COLOR_OPTIONS,
  DEFAULT_CATEGORY_COLOR,
  type PayCategory,
  type PayCategoryColorId,
  type PayCategoryKind,
} from "@/types/categories";
import { formatAmountInput, parseAmountInput } from "@/utils/format/formatters";

const TYPE_OPTIONS = [
  { value: "income" as const, label: "Income" },
  { value: "deduction" as const, label: "Deduction" },
];

const KIND_UNSET = "";
type CategoryKindValue = PayCategoryKind | typeof KIND_UNSET;

const isPayCategoryKind = (value: string): value is PayCategoryKind =>
  value === "income" || value === "deduction";

interface AddCategoryModalProps {
  open: boolean;
  editingCategory: PayCategory | null;
  onClose: () => void;
  onSuccess?: (message: string) => void;
}

export const AddCategoryModal = ({
  open,
  editingCategory,
  onClose,
  onSuccess,
}: AddCategoryModalProps) => {
  const dispatch = useAppDispatch();
  const [name, setName] = useState("");
  const [kind, setKind] = useState<CategoryKindValue>(KIND_UNSET);
  const [hasKindSelection, setHasKindSelection] = useState(false);
  const [color, setColor] = useState<PayCategoryColorId>(DEFAULT_CATEGORY_COLOR);
  const [defaultAmount, setDefaultAmount] = useState("");
  const [openCombobox, setOpenCombobox] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const isEdit = Boolean(editingCategory);

  useEffect(() => {
    if (!open) {
      return;
    }
    if (editingCategory) {
      setName(editingCategory.name);
      setKind(editingCategory.kind);
      setHasKindSelection(true);
      setColor(editingCategory.color ?? DEFAULT_CATEGORY_COLOR);
      setDefaultAmount(
        editingCategory.defaultAmount
          ? formatAmountInput(String(editingCategory.defaultAmount))
          : "",
      );
    } else {
      setName("");
      setKind(KIND_UNSET);
      setHasKindSelection(false);
      setColor(DEFAULT_CATEGORY_COLOR);
      setDefaultAmount("");
    }
    setOpenCombobox(false);
    setSaveError(null);
  }, [open, editingCategory]);

  const canSubmit = name.trim().length > 0 && isPayCategoryKind(kind);

  const closeCombobox = useCallback(() => {
    setOpenCombobox(false);
  }, []);

  useModalEscape(onClose, {
    open,
    nestedOpen: openCombobox,
    onNestedClose: closeCombobox,
  });

  if (!open) {
    return null;
  }

  const parsedDefault = parseAmountInput(defaultAmount);
  const defaultAmountValue =
    defaultAmount.trim() && !Number.isNaN(parsedDefault) && parsedDefault > 0
      ? parsedDefault
      : undefined;

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed || !isPayCategoryKind(kind) || isSaving) {
      return;
    }

    const payload = {
      name: trimmed,
      kind,
      color,
      defaultAmount: defaultAmountValue,
    };

    setIsSaving(true);
    setSaveError(null);

    try {
      const user = await getCurrentVaultUser();
      if (!user) {
        return;
      }

      if (isEdit && editingCategory) {
        const saved = await updatePayCategory(user.id, editingCategory.id, payload);
        dispatch(replaceCategory(saved));
      } else {
        const saved = await insertPayCategory(user.id, payload);
        dispatch(addCategory(saved));
      }

      onSuccess?.(
        isEdit ? "Category updated successfully" : "Category added successfully",
      );
      onClose();
    } catch (error) {
      console.error("Failed to save category:", error);
      setSaveError(
        error instanceof Error ? error.message : "Could not save category.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <VaultModalOverlay ariaLabelledBy="category-modal-title" onClose={onClose}>
      <div className={`${vaultModalPanelClass} max-w-sm p-5 md:p-5`}>
        <VaultModalHeader
          titleId="category-modal-title"
          title={isEdit ? "Edit Category" : "Add Category"}
          description={
            isEdit
              ? "Update your category details"
              : "Create a new category for organizing your records"
          }
          onClose={onClose}
        />

        <div className="mt-5 space-y-4">
          {saveError ? <FormErrorBanner message={saveError} /> : null}

          <div className="space-y-1.5">
            <FormFieldLabel required htmlFor="category-name">
              Name
            </FormFieldLabel>
            <Input
              id="category-name"
              autoFocus
              value={name}
              placeholder="e.g., Bonus, SSS, etc."
              className={VAULT_FIELD_INPUT_CLASS}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleSubmit();
                }
              }}
            />
          </div>

          <RecordCombobox
            label="Type"
            placeholder="Select type"
            value={kind}
            emptyValue={KIND_UNSET}
            hasUserSelection={hasKindSelection}
            required
            options={TYPE_OPTIONS}
            isOpen={openCombobox}
            onOpenChange={setOpenCombobox}
            onChange={(value) => {
              if (isPayCategoryKind(value)) {
                setKind(value);
                setHasKindSelection(true);
              }
            }}
          />

          <div className="space-y-1.5">
            <FormFieldLabel required>Color</FormFieldLabel>
            <ColorSwatchPicker
              options={CATEGORY_COLOR_OPTIONS}
              value={color}
              onChange={(id) => setColor(id as PayCategoryColorId)}
            />
          </div>

          <CurrencyAmountField
            id="category-default-amount"
            label="Default Amount (Optional)"
            value={defaultAmount}
            onChange={setDefaultAmount}
            helperText={
              <p className="text-[11px] leading-snug text-slate-500">
                Pre-fill this amount when creating records
              </p>
            }
          />
        </div>

        <VaultModalFooter
          onCancel={onClose}
          cancelDisabled={isSaving}
          className="mt-5 flex justify-end gap-2"
        >
          <VaultSubmitButton
            type="button"
            label={isEdit ? "Update" : "Create"}
            mode={isEdit ? "update" : "save"}
            isProcessing={isSaving}
            disabled={!canSubmit}
            onClick={() => void handleSubmit()}
          />
        </VaultModalFooter>
      </div>
    </VaultModalOverlay>
  );
};
