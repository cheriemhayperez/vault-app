"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { CurrencyAmountField } from "@/components/shared/currency-amount-field";
import { FormErrorBanner } from "@/components/shared/form-error-banner";
import { FormFieldLabel } from "@/components/shared/form-field-label";
import { VaultModalFooter } from "@/components/shared/vault-modal-footer";
import { VaultModalHeader } from "@/components/shared/vault-modal-header";
import { VaultSubmitButton } from "@/components/shared/vault-submit-button";
import { RecordCombobox } from "@/components/shared/record-combobox";
import { Input } from "@/components/ui/input";
import {
  VaultModalOverlay,
  vaultModalPanelClass,
} from "@/components/ui/vault-modal-overlay";
import { insertVaultRecord } from "@/api/ledger";
import { getCurrentVaultUser } from "@/api/user";
import { useModalEscape } from "@/hooks/use-modal-escape";
import { useAppDispatch, useAppSelector } from "@/store";
import { executeTransaction } from "@/store/slices/financialSlice";
import type { Transaction } from "@/types/financial";
import { toCategoryComboboxOption } from "@/types/categories";
import { formatAmountInput, parseAmountInput } from "@/utils/format/formatters";
import { getTodayInputDate } from "@/utils/date/dateInput";
import {
  formatSalaryAdditionalPayErrorMessage,
  isSalaryCategoryName,
  SUGGESTED_ADDITIONAL_PAY_EXAMPLES,
} from "@/utils/additionalPayTypes";
import {
  formatSalaryLinkOptionLabel,
  getSalaryIncomeRecords,
} from "@/utils/payRecords";
import { createTempTransactionId } from "@/utils/transactionIds";

const STANDALONE_LINK = "";

interface AdditionalPayModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AdditionalPayModal = ({
  open,
  onClose,
  onSuccess,
}: AdditionalPayModalProps) => {
  const dispatch = useAppDispatch();
  const { transactions } = useAppSelector((state) => state.financial);
  const incomeCategories = useAppSelector((state) => state.categories.income);

  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [openTypeCombobox, setOpenTypeCombobox] = useState(false);
  const [linkedSalaryId, setLinkedSalaryId] = useState(STANDALONE_LINK);
  const [salaryLinkChosen, setSalaryLinkChosen] = useState(false);
  const [openSalaryCombobox, setOpenSalaryCombobox] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const salaryRecords = useMemo(
    () =>
      getSalaryIncomeRecords(transactions).sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      ),
    [transactions],
  );

  const salaryLinkOptions = useMemo(
    () => [
      { value: STANDALONE_LINK, label: "No link (standalone)" },
      ...salaryRecords.map((record) => ({
        value: record.id,
        label: formatSalaryLinkOptionLabel(record),
      })),
    ],
    [salaryRecords],
  );

  const linkedSalaryRecord = useMemo(
    () => salaryRecords.find((record) => record.id === linkedSalaryId),
    [salaryRecords, linkedSalaryId],
  );

  const typeOptions = useMemo(
    () => incomeCategories.map(toCategoryComboboxOption),
    [incomeCategories],
  );

  const selectedCategory = useMemo(
    () => incomeCategories.find((category) => category.id === categoryId),
    [incomeCategories, categoryId],
  );

  const hasIncomeCategories = incomeCategories.length > 0;
  const isSalaryTypeSelected =
    Boolean(selectedCategory) &&
    isSalaryCategoryName(selectedCategory?.name ?? "");

  useEffect(() => {
    if (!open) {
      return;
    }

    setCategoryId("");
    setAmount("");
    setDescription("");
    setOpenTypeCombobox(false);
    setLinkedSalaryId(STANDALONE_LINK);
    setSalaryLinkChosen(false);
    setOpenSalaryCombobox(false);
    setFormError(null);
  }, [open]);

  useEffect(() => {
    if (!open || !selectedCategory?.defaultAmount) {
      return;
    }
    setAmount(formatAmountInput(String(selectedCategory.defaultAmount)));
  }, [open, selectedCategory?.id, selectedCategory?.defaultAmount]);

  const handleNestedEscape = useCallback(() => {
    if (openSalaryCombobox) {
      setOpenSalaryCombobox(false);
      return;
    }
    if (openTypeCombobox) {
      setOpenTypeCombobox(false);
    }
  }, [openSalaryCombobox, openTypeCombobox]);

  useModalEscape(onClose, {
    open,
    nestedOpen: openTypeCombobox || openSalaryCombobox,
    onNestedClose: handleNestedEscape,
  });

  if (!open) {
    return null;
  }

  const parsedAmount = parseAmountInput(amount);
  const canSubmit =
    hasIncomeCategories &&
    Boolean(categoryId) &&
    Number.isFinite(parsedAmount) &&
    parsedAmount > 0;

  const buildPayload = (): Transaction | null => {
    if (!canSubmit || !selectedCategory || isSalaryTypeSelected) {
      return null;
    }

    const today = getTodayInputDate();
    const [year, month, day] = today.split("-").map(Number);
    const timestamp = linkedSalaryRecord
      ? linkedSalaryRecord.timestamp
      : new Date(year, month - 1, day, 12, 0, 0).toISOString();

    const payload: Transaction = {
      id: createTempTransactionId(),
      timestamp,
      merchantOrLabel: description.trim(),
      amount: parsedAmount,
      category: "SAVINGS",
      direction: "CREDIT",
      status: "COMPLETED",
      recordCategory: selectedCategory.name,
    };

    if (linkedSalaryRecord) {
      payload.linkedSalaryRecordId = linkedSalaryRecord.id;
    }

    return payload;
  };

  const handleSubmit = async () => {
    if (isSaving) {
      return;
    }

    if (isSalaryTypeSelected) {
      setFormError(formatSalaryAdditionalPayErrorMessage());
      return;
    }

    setFormError(null);
    const payload = buildPayload();
    if (!payload) {
      return;
    }

    setIsSaving(true);
    try {
      const user = await getCurrentVaultUser();
      if (!user) {
        return;
      }

      const saved = await insertVaultRecord(
        {
          ...payload,
          categoryId: selectedCategory?.id,
        },
        user.id,
      );
      dispatch(executeTransaction(saved));
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to save additional pay:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <VaultModalOverlay ariaLabelledBy="additional-pay-title" onClose={onClose}>
      <div className={vaultModalPanelClass}>
        <VaultModalHeader
          titleId="additional-pay-title"
          title="Add Additional Pay"
          description="Select the type and enter the amount."
          onClose={onClose}
        />

        <div className="mt-6 space-y-4">
          {formError ? <FormErrorBanner message={formError} /> : null}

          <RecordCombobox
            label="Type"
            required
            placeholder="Select type"
            value={categoryId}
            options={typeOptions}
            disabled={!hasIncomeCategories}
            isOpen={openTypeCombobox}
            onOpenChange={setOpenTypeCombobox}
            onChange={(value) => {
              setCategoryId(value);
              setFormError(null);
            }}
            helperText={
              !hasIncomeCategories ? (
                <p className="text-xs text-slate-500">
                  <Link
                    href="/categories"
                    className="font-medium text-violet-600 hover:text-violet-700"
                    onClick={onClose}
                  >
                    Create an income category
                  </Link>{" "}
                  (e.g. {SUGGESTED_ADDITIONAL_PAY_EXAMPLES}).
                </p>
              ) : undefined
            }
          />

          <CurrencyAmountField
            id="additional-pay-amount"
            label="Amount"
            required
            value={amount}
            disabled={!hasIncomeCategories}
            onChange={setAmount}
          />

          <div className="space-y-1.5">
            <FormFieldLabel htmlFor="additional-pay-description">
              Description (optional)
            </FormFieldLabel>
            <Input
              id="additional-pay-description"
              value={description}
              placeholder="e.g., Performance bonus"
              disabled={!hasIncomeCategories}
              className="h-10 border-slate-300"
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <RecordCombobox
            label="Link to Salary (optional)"
            placeholder="No link (standalone)"
            emptyValue={STANDALONE_LINK}
            hasUserSelection={salaryLinkChosen}
            value={linkedSalaryId}
            options={salaryLinkOptions}
            disabled={!hasIncomeCategories}
            isOpen={openSalaryCombobox}
            onOpenChange={setOpenSalaryCombobox}
            onChange={(value) => {
              setLinkedSalaryId(value);
              setSalaryLinkChosen(true);
            }}
          />
        </div>

        <VaultModalFooter onCancel={onClose} cancelDisabled={isSaving}>
          <VaultSubmitButton
            type="button"
            label="Add"
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
