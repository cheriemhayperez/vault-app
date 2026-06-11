"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

import { CurrencyAmountField, VIOLET_AMOUNT_INPUT_CLASS } from "@/components/shared/currency-amount-field";
import { FormFieldLabel } from "@/components/shared/form-field-label";
import { RecordCombobox } from "@/components/shared/record-combobox";
import { VaultModalHeader } from "@/components/shared/vault-modal-header";
import { VaultSubmitButton } from "@/components/shared/vault-submit-button";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import {
  VaultModalOverlay,
  vaultModalPanelClass,
} from "@/components/ui/vault-modal-overlay";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  insertVaultRecord,
  updateVaultRecord,
} from "@/api/ledger";
import { getCurrentVaultUser } from "@/api/user";
import { useModalEscape } from "@/hooks/use-modal-escape";
import {
  executeTransaction,
  updatePayRecord,
} from "@/store/slices/financialSlice";
import {
  toCategoryComboboxOption,
  type PayCategoryKind,
} from "@/types/categories";
import type { Transaction } from "@/types/financial";
import { formatAmountInput, parseAmountInput } from "@/utils/format/formatters";
import { getTodayInputDate } from "@/utils/date/dateInput";
import {
  getRecordDescriptionDisplay,
  timestampToInputDate,
} from "@/utils/payRecords";
import { createTempTransactionId } from "@/utils/transactionIds";

const TYPE_UNSET = "";
type RecordTypeValue = PayCategoryKind | typeof TYPE_UNSET;

const TYPE_OPTIONS = [
  { value: "income" as const, label: "Income" },
  { value: "deduction" as const, label: "Deduction" },
];

const isRecordType = (value: string): value is PayCategoryKind =>
  value === "income" || value === "deduction";

interface PayRecordModalProps {
  open: boolean;
  mode: "add" | "edit";
  record?: Transaction | null;
  initialRecordType?: PayCategoryKind;
  initialCategoryId?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PayRecordModal = ({
  open,
  mode,
  record,
  initialRecordType,
  initialCategoryId,
  onClose,
  onSuccess,
}: PayRecordModalProps) => {
  const dispatch = useAppDispatch();
  const { income, deduction } = useAppSelector((state) => state.categories);

  const [amount, setAmount] = useState("");
  const [recordDate, setRecordDate] = useState(getTodayInputDate);
  const [recordType, setRecordType] = useState<RecordTypeValue>(TYPE_UNSET);
  const [hasTypeSelection, setHasTypeSelection] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [openCombobox, setOpenCombobox] = useState<"type" | "category" | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);

  const categoriesForType = useMemo(() => {
    if (recordType === "income") {
      return income;
    }
    if (recordType === "deduction") {
      return deduction;
    }
    return [];
  }, [recordType, income, deduction]);

  const hasCategories = categoriesForType.length > 0;

  const categoryOptions = useMemo(
    () => categoriesForType.map(toCategoryComboboxOption),
    [categoriesForType],
  );

  const selectedCategory = useMemo(
    () => categoriesForType.find((category) => category.id === categoryId),
    [categoriesForType, categoryId],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    if (mode === "edit" && record) {
      setAmount(formatAmountInput(String(record.amount)));
      setRecordDate(timestampToInputDate(record.timestamp));
      setRecordType(record.direction === "CREDIT" ? "income" : "deduction");
      setHasTypeSelection(true);
      const descriptionDisplay = getRecordDescriptionDisplay(record);
      setDescription(descriptionDisplay === "—" ? "" : descriptionDisplay);
      setOpenCombobox(null);
      return;
    }

    const nextType = initialRecordType ?? TYPE_UNSET;
    const typeCategories =
      nextType === "income"
        ? income
        : nextType === "deduction"
          ? deduction
          : [];
    const presetCategory = initialCategoryId
      ? typeCategories.find((category) => category.id === initialCategoryId)
      : undefined;

    setAmount(
      presetCategory?.defaultAmount
        ? formatAmountInput(String(presetCategory.defaultAmount))
        : "",
    );
    setRecordDate(getTodayInputDate());
    setRecordType(nextType);
    setHasTypeSelection(Boolean(initialRecordType));
    setCategoryId(presetCategory?.id ?? "");
    setDescription("");
    setOpenCombobox(null);
  }, [
    open,
    mode,
    record,
    initialRecordType,
    initialCategoryId,
    income,
    deduction,
  ]);

  useEffect(() => {
    if (!open || mode !== "edit" || !record) {
      return;
    }

    const typeCategories = record.direction === "CREDIT" ? income : deduction;
    const match = record.categoryId
      ? typeCategories.find((category) => category.id === record.categoryId)
      : typeCategories.find(
          (category) => category.name === record.recordCategory,
        );
    setCategoryId(match?.id ?? "");
  }, [open, mode, record, income, deduction]);

  const closeCombobox = useCallback(() => {
    setOpenCombobox(null);
  }, []);

  useModalEscape(onClose, {
    open,
    disabled: isSaving,
    nestedOpen: Boolean(openCombobox),
    onNestedClose: closeCombobox,
  });

  if (!open) {
    return null;
  }

  const parsedAmount = parseAmountInput(amount);
  const isEdit = mode === "edit";
  const hasValidAmount = Number.isFinite(parsedAmount) && parsedAmount > 0;
  const hasValidType = isRecordType(recordType);
  const hasValidCategory = Boolean(categoryId && selectedCategory);
  const showCategoryField = isEdit || hasValidType;
  const canSubmit =
    !isSaving &&
    hasValidAmount &&
    hasValidType &&
    hasValidCategory &&
    hasCategories &&
    Boolean(recordDate);

  const buildPayload = (): Transaction | null => {
    if (!canSubmit || !selectedCategory) {
      return null;
    }

    const categoryLabel = selectedCategory.name;
    const [year, month, day] = recordDate.split("-").map(Number);
    const recordTimestamp = new Date(
      year,
      month - 1,
      day,
      12,
      0,
      0,
    ).toISOString();

    return {
      id: isEdit && record ? record.id : createTempTransactionId(),
      timestamp: recordTimestamp,
      merchantOrLabel: description.trim(),
      amount: parsedAmount,
      category: recordType === "income" ? "SAVINGS" : "NEEDS",
      direction: recordType === "income" ? "CREDIT" : "DEBIT",
      status: "COMPLETED",
      recordCategory: categoryLabel,
      categoryId: selectedCategory.id,
    };
  };

  const handleSubmit = async () => {
    const payload = buildPayload();
    if (!payload || isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      const user = await getCurrentVaultUser();
      if (!user) {
        return;
      }

      if (isEdit) {
        const saved = await updateVaultRecord(payload, user.id);
        dispatch(updatePayRecord(saved));
      } else {
        const saved = await insertVaultRecord(payload, user.id);
        dispatch(executeTransaction(saved));
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to save pay record:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const titleId = isEdit ? "edit-record-title" : "add-record-title";

  return (
    <VaultModalOverlay ariaLabelledBy={titleId} onClose={onClose}>
      <form
        className={vaultModalPanelClass}
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <VaultModalHeader
          titleId={titleId}
          title={isEdit ? "Edit Record" : "Add New Record"}
          description={
            isEdit
              ? "Update the details of this pay record."
              : "Add a new income or deduction record."
          }
          onClose={onClose}
        />

        <div className="mt-6 space-y-4 overflow-visible">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <CurrencyAmountField
              id="pay-record-amount"
              label="Amount"
              required
              autoFocus
              value={amount}
              onChange={setAmount}
              inputClassName={VIOLET_AMOUNT_INPUT_CLASS}
            />

            <div className="space-y-1.5">
              <FormFieldLabel required htmlFor="pay-record-date">
                Date
              </FormFieldLabel>
              <DatePicker
                id="pay-record-date"
                value={recordDate}
                aria-label="Record date"
                onChange={setRecordDate}
              />
            </div>
          </div>

          <RecordCombobox
            label="Type"
            required
            placeholder="Select type"
            value={recordType}
            emptyValue={TYPE_UNSET}
            hasUserSelection={hasTypeSelection || isEdit}
            options={TYPE_OPTIONS}
            isOpen={openCombobox === "type"}
            onOpenChange={(isOpen) => setOpenCombobox(isOpen ? "type" : null)}
            onChange={(value) => {
              setHasTypeSelection(true);
              const nextType = value as RecordTypeValue;
              if (nextType !== recordType) {
                setCategoryId("");
                setOpenCombobox(null);
              }
              setRecordType(nextType);
            }}
          />

          <AnimatePresence initial={false}>
            {showCategoryField ? (
              <motion.div
                key="pay-record-category"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-visible"
              >
                <RecordCombobox
                  label="Category"
                  required
                  placeholder="Select category"
                  value={categoryId}
                  options={categoryOptions}
                  disabled={!hasCategories}
                  isOpen={openCombobox === "category"}
                  onOpenChange={(isOpen) =>
                    setOpenCombobox(isOpen ? "category" : null)
                  }
                  onChange={(value) => {
                    setCategoryId(value);
                    if (mode !== "add") {
                      return;
                    }
                    const category = categoriesForType.find(
                      (item) => item.id === value,
                    );
                    if (category?.defaultAmount) {
                      setAmount(
                        formatAmountInput(String(category.defaultAmount)),
                      );
                    }
                  }}
                  helperText={
                    !hasCategories ? (
                      <p className="text-xs text-slate-500">
                        {isEdit ? (
                          <>
                            <Link
                              href="/categories"
                              className="font-medium text-violet-600 hover:text-violet-700"
                              onClick={onClose}
                            >
                              Create categories
                            </Link>{" "}
                            to assign a label.
                          </>
                        ) : (
                          <>
                            No {recordType} categories yet.{" "}
                            <Link
                              href="/categories"
                              className="font-medium text-violet-600 hover:text-violet-700"
                              onClick={onClose}
                            >
                              Create categories
                            </Link>{" "}
                            first to enable this field.
                          </>
                        )}
                      </p>
                    ) : undefined
                  }
                />
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="space-y-1.5">
            <FormFieldLabel htmlFor="pay-record-description">
              Description (Optional)
            </FormFieldLabel>
            <Textarea
              id="pay-record-description"
              rows={3}
              value={description}
              placeholder="Add a description..."
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

        </div>

        <div className="mt-6 flex justify-end">
          <VaultSubmitButton
            type="submit"
            label={isEdit ? "Update Record" : "Add Record"}
            mode={isEdit ? "update" : "save"}
            isProcessing={isSaving}
            disabled={!canSubmit}
          />
        </div>
      </form>
    </VaultModalOverlay>
  );
};
