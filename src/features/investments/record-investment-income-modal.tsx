"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { CurrencyAmountField } from "@/components/shared/currency-amount-field";
import { FormErrorBanner } from "@/components/shared/form-error-banner";
import { FormFieldLabel } from "@/components/shared/form-field-label";
import { FormWarningBanner } from "@/components/shared/form-warning-banner";
import { RecordCombobox } from "@/components/shared/record-combobox";
import { VaultModalFooter } from "@/components/shared/vault-modal-footer";
import { VaultModalHeader } from "@/components/shared/vault-modal-header";
import { VaultSubmitButton } from "@/components/shared/vault-submit-button";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import {
  VaultModalOverlay,
  vaultModalPanelClass,
} from "@/components/ui/vault-modal-overlay";
import { recordInvestmentIncome } from "@/api/investments";
import { getCurrentVaultUser } from "@/api/user";
import { useModalEscape } from "@/hooks/use-modal-escape";
import { useAppDispatch, useAppSelector } from "@/store";
import { executeTransaction } from "@/store/slices/financialSlice";
import { toCategoryComboboxOption } from "@/types/categories";
import type { Transaction } from "@/types/financial";
import type { VaultInvestment } from "@/types/investments";
import { formatAmountInput, parseAmountInput } from "@/utils/format/formatters";
import { getTodayInputDate } from "@/utils/date/dateInput";
import {
  isValidInvestmentIncomeCategory,
  resolveDefaultInvestmentIncomeCategoryId,
} from "@/utils/investmentIncomeCategories";

interface RecordInvestmentIncomeModalProps {
  open: boolean;
  investment: VaultInvestment | null;
  onClose: () => void;
  onSaved: (transaction: Transaction) => void;
}

export const RecordInvestmentIncomeModal = ({
  open,
  investment,
  onClose,
  onSaved,
}: RecordInvestmentIncomeModalProps) => {
  const dispatch = useAppDispatch();
  const { income } = useAppSelector((state) => state.categories);
  const [amount, setAmount] = useState("");
  const [recordDate, setRecordDate] = useState(getTodayInputDate);
  const [categoryId, setCategoryId] = useState("");
  const [notes, setNotes] = useState("");
  const [amountError, setAmountError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const investmentIncomeCategories = useMemo(
    () =>
      income.filter((category) =>
        isValidInvestmentIncomeCategory(category.name),
      ),
    [income],
  );

  const categoryOptions = useMemo(
    () => investmentIncomeCategories.map(toCategoryComboboxOption),
    [investmentIncomeCategories],
  );

  const hasInvestmentIncomeCategories = investmentIncomeCategories.length > 0;
  const hasPayrollOnlyCategories =
    income.length > 0 && !hasInvestmentIncomeCategories;

  const selectedCategory = useMemo(
    () =>
      investmentIncomeCategories.find((category) => category.id === categoryId),
    [investmentIncomeCategories, categoryId],
  );

  useEffect(() => {
    if (!open || !investment) {
      return;
    }
    setAmount("");
    setRecordDate(getTodayInputDate());
    setCategoryId(resolveDefaultInvestmentIncomeCategoryId(income));
    setNotes("");
    setAmountError(null);
    setCategoryError(null);
    setFormError(null);
    setIsCategoryOpen(false);
  }, [open, investment?.id, income]);

  const closeCategoryCombobox = useCallback(() => {
    setIsCategoryOpen(false);
  }, []);

  useModalEscape(onClose, {
    open: open && Boolean(investment),
    disabled: isSaving,
    nestedOpen: isCategoryOpen,
    onNestedClose: closeCategoryCombobox,
  });

  if (!open || !investment) {
    return null;
  }

  const parsedAmount = parseAmountInput(amount);
  const hasValidAmount = Number.isFinite(parsedAmount) && parsedAmount > 0;
  const hasValidCategory = Boolean(categoryId && selectedCategory);
  const canSubmit =
    !isSaving &&
    hasValidAmount &&
    hasValidCategory &&
    hasInvestmentIncomeCategories &&
    Boolean(recordDate);

  const categoryHelperText = categoryError ? (
    <p className="text-xs text-rose-500">{categoryError}</p>
  ) : hasInvestmentIncomeCategories ? (
    <p className="text-xs leading-snug text-slate-500">
      This transaction will be logged to your Pay Records as an investment
      return payout.
    </p>
  ) : null;

  const handleSubmit = async () => {
    setFormError(null);

    if (!hasValidAmount) {
      setAmountError("Amount must be a valid number");
      return;
    }
    setAmountError(null);

    if (!hasValidCategory || !selectedCategory) {
      setCategoryError("Select an investment income category");
      return;
    }
    setCategoryError(null);

    setIsSaving(true);
    try {
      const user = await getCurrentVaultUser();
      if (!user) {
        setFormError("You must be signed in to record income.");
        return;
      }

      const savedTransaction = await recordInvestmentIncome(user.id, investment, {
        amount: parsedAmount,
        date: recordDate,
        description: notes,
        categoryId: selectedCategory.id,
        categoryName: selectedCategory.name,
      });

      dispatch(executeTransaction(savedTransaction));
      onSaved(savedTransaction);
      onClose();
    } catch (error) {
      console.error("Failed to record income:", error);
      setFormError("Could not record income. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <VaultModalOverlay ariaLabelledBy="record-income-title" onClose={onClose}>
      <form
        className={`${vaultModalPanelClass} max-w-md`}
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <VaultModalHeader
          titleId="record-income-title"
          title="Record as Income"
          description={`Create a pay record for ${investment.name}`}
          onClose={onClose}
        />

        <div className="mt-6 space-y-4">
          {!hasInvestmentIncomeCategories ? (
            <FormWarningBanner
              title="No investment income categories"
              message={
                hasPayrollOnlyCategories
                  ? "Payroll types like Salary can't be used here. Create investment income categories to track asset payouts."
                  : "Create investment income categories to track asset payouts properly."
              }
              actionHref="/categories"
              actionLabel="Manage categories"
              onActionClick={onClose}
            />
          ) : null}

          <CurrencyAmountField
            id="investment-income-amount"
            label="Amount"
            required
            autoFocus
            value={amount}
            onChange={setAmount}
            inputClassName="pl-9"
            error={amountError ?? undefined}
          />

          <div className="space-y-1.5">
            <FormFieldLabel required htmlFor="investment-income-date">
              Date
            </FormFieldLabel>
            <DatePicker
              id="investment-income-date"
              value={recordDate}
              aria-label="Income date"
              onChange={setRecordDate}
            />
          </div>

          <RecordCombobox
            label="Category"
            required
            placeholder={
              hasInvestmentIncomeCategories
                ? "Select category"
                : "No categories available"
            }
            value={categoryId}
            options={categoryOptions}
            disabled={!hasInvestmentIncomeCategories}
            isOpen={isCategoryOpen}
            onOpenChange={setIsCategoryOpen}
            onChange={(value) => {
              setCategoryId(value);
              if (value) {
                setCategoryError(null);
              }
            }}
            helperText={categoryHelperText}
          />

          <div className="space-y-1.5">
            <FormFieldLabel htmlFor="investment-income-notes">
              Notes
            </FormFieldLabel>
            <Textarea
              id="investment-income-notes"
              rows={3}
              value={notes}
              placeholder="Optional notes..."
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>

          {formError ? <FormErrorBanner message={formError} /> : null}
        </div>

        <VaultModalFooter
          onCancel={onClose}
          cancelDisabled={isSaving}
          className="mt-6 flex justify-end gap-3"
        >
          <VaultSubmitButton
            type="submit"
            label="Record Income"
            mode="save"
            isProcessing={isSaving}
            disabled={!canSubmit}
          />
        </VaultModalFooter>
      </form>
    </VaultModalOverlay>
  );
};
