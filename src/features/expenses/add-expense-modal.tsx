"use client";

import { useEffect, useMemo, useState } from "react";

import { CurrencyAmountField, VIOLET_AMOUNT_INPUT_CLASS } from "@/components/shared/currency-amount-field";
import { FormFieldLabel } from "@/components/shared/form-field-label";
import { VaultModalFooter } from "@/components/shared/vault-modal-footer";
import { VaultModalHeader } from "@/components/shared/vault-modal-header";
import { VaultSubmitButton } from "@/components/shared/vault-submit-button";
import { DatePicker } from "@/components/ui/date-picker";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  VaultModalOverlay,
  vaultModalPanelClass,
} from "@/components/ui/vault-modal-overlay";
import { useAppDispatch, useAppSelector } from "@/store";
import { insertVaultExpense, updateVaultExpense } from "@/api/ledger";
import { getCurrentVaultUser } from "@/api/user";
import { useModalEscape } from "@/hooks/use-modal-escape";
import {
  executeTransaction,
  updatePayRecord,
} from "@/store/slices/financialSlice";
import type { BudgetCategory, Transaction } from "@/types/financial";
import { formatAmountInput, parseAmountInput } from "@/utils/format/formatters";
import { createTempTransactionId } from "@/utils/transactionIds";
import { getTodayInputDate } from "@/utils/date/dateInput";
import { timestampToInputDate } from "@/utils/payRecords";

const BUCKET_MODAL_COPY: Record<
  BudgetCategory,
  {
    addTitle: string;
    editTitle: string;
    subtitle: string;
    submitLabel: string;
  }
> = {
  NEEDS: {
    addTitle: "Add Needs Expense",
    editTitle: "Edit Needs Expense",
    subtitle: "Essential expenses like rent, utilities, groceries",
    submitLabel: "Add Expense",
  },
  WANTS: {
    addTitle: "Add Wants Expense",
    editTitle: "Edit Wants Expense",
    subtitle: "Personal spending like dining, coffee, entertainment",
    submitLabel: "Add Wants",
  },
  SAVINGS: {
    addTitle: "Add Savings",
    editTitle: "Edit Savings",
    subtitle: "Transfers to emergency funds, MP2, stocks, and goals",
    submitLabel: "Add Savings",
  },
};

interface AddExpenseModalProps {
  open: boolean;
  bucket?: BudgetCategory | null;
  expense?: Transaction | null;
  onClose: () => void;
  onSuccess?: (message: string) => void;
}

export const AddExpenseModal = ({
  open,
  bucket = null,
  expense,
  onClose,
  onSuccess,
}: AddExpenseModalProps) => {
  const dispatch = useAppDispatch();
  const budgetCategories = useAppSelector((state) => state.budgetCategories);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState(getTodayInputDate);
  const [selectedBucket, setSelectedBucket] = useState<BudgetCategory>("NEEDS");
  const [budgetCategoryId, setBudgetCategoryId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const isEdit = Boolean(expense);
  const activeBucket = expense?.category ?? selectedBucket;
  const copy = BUCKET_MODAL_COPY[activeBucket];
  const showBucketPicker = !bucket && !expense;

  const categoriesForBucket = useMemo(
    () => budgetCategories[activeBucket] ?? [],
    [budgetCategories, activeBucket],
  );

  useEffect(() => {
    if (!open) {
      return;
    }
    if (expense) {
      setDescription(expense.merchantOrLabel);
      setAmount(formatAmountInput(String(expense.amount)));
      setExpenseDate(timestampToInputDate(expense.timestamp));
      setSelectedBucket(expense.category);
      setBudgetCategoryId(expense.budgetCategoryId ?? "");
    } else {
      setDescription("");
      setAmount("");
      setExpenseDate(getTodayInputDate());
      setSelectedBucket(bucket ?? "NEEDS");
      setBudgetCategoryId("");
    }
  }, [open, expense, bucket]);

  useModalEscape(onClose, { open });

  if (!open) {
    return null;
  }

  const parsedAmount = parseAmountInput(amount);
  const canSubmit = Number.isFinite(parsedAmount) && parsedAmount > 0;

  const handleSubmit = async () => {
    if (!canSubmit || isSaving) {
      return;
    }

    const timestamp = new Date(`${expenseDate}T12:00:00`).toISOString();
    const label = description.trim() || "Expense";
    const payload: Transaction = {
      id: expense?.id ?? createTempTransactionId(),
      timestamp,
      merchantOrLabel: label,
      amount: parsedAmount,
      category: activeBucket,
      direction: "DEBIT",
      status: "COMPLETED",
    };

    if (budgetCategoryId) {
      payload.budgetCategoryId = budgetCategoryId;
      payload.categoryId = budgetCategoryId;
    }

    setIsSaving(true);
    try {
      const user = await getCurrentVaultUser();
      if (!user) {
        return;
      }

      if (isEdit) {
        const saved = await updateVaultExpense(payload, user.id);
        dispatch(updatePayRecord(saved));
      } else {
        const saved = await insertVaultExpense(payload, user.id);
        dispatch(executeTransaction(saved));
      }

      onSuccess?.(
        isEdit ? "Expense updated successfully" : "Expense added successfully",
      );
      onClose();
    } catch (error) {
      console.error("Failed to save expense:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const titleId = isEdit ? "edit-expense-title" : "add-expense-title";

  return (
    <VaultModalOverlay ariaLabelledBy={titleId} onClose={onClose}>
      <div className={`${vaultModalPanelClass} max-w-md`}>
        <VaultModalHeader
          titleId={titleId}
          title={isEdit ? copy.editTitle : copy.addTitle}
          description={copy.subtitle}
          onClose={onClose}
        />

        <div className="mt-6 space-y-4">
          {showBucketPicker ? (
            <div className="space-y-1.5">
              <FormFieldLabel required>Budget Bucket</FormFieldLabel>
              <Select
                className="h-10 w-full"
                value={activeBucket}
                onChange={(event) => {
                  setSelectedBucket(event.target.value as BudgetCategory);
                  setBudgetCategoryId("");
                }}
              >
                <option value="NEEDS">Needs</option>
                <option value="WANTS">Wants</option>
                <option value="SAVINGS">Savings</option>
              </Select>
            </div>
          ) : null}

          <CurrencyAmountField
            label="Amount"
            required
            autoFocus
            value={amount}
            onChange={setAmount}
            inputClassName={VIOLET_AMOUNT_INPUT_CLASS}
          />

          <div className="space-y-1.5">
            <FormFieldLabel optional>Description</FormFieldLabel>
            <Textarea
              rows={3}
              value={description}
              placeholder="e.g., Electric bill, Groceries"
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <FormFieldLabel required>Date</FormFieldLabel>
            <DatePicker
              value={expenseDate}
              aria-label="Expense date"
              onChange={setExpenseDate}
            />
          </div>

          {categoriesForBucket.length > 0 ? (
            <div className="space-y-1.5">
              <FormFieldLabel optional>Category</FormFieldLabel>
              <Select
                className="h-10 w-full"
                value={budgetCategoryId}
                onChange={(event) => setBudgetCategoryId(event.target.value)}
              >
                <option value="">No category</option>
                {categoriesForBucket.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>
          ) : null}
        </div>

        <VaultModalFooter
          onCancel={onClose}
          cancelDisabled={isSaving}
          className="mt-6 flex justify-end gap-3"
        >
          <VaultSubmitButton
            type="button"
            label={isEdit ? "Save" : copy.submitLabel}
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
