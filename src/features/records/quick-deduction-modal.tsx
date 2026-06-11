"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

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
import { useAppDispatch, useAppSelector } from "@/store";
import { insertVaultRecord } from "@/api/ledger";
import { getCurrentVaultUser } from "@/api/user";
import { useModalEscape } from "@/hooks/use-modal-escape";
import { executeTransaction } from "@/store/slices/financialSlice";
import type { PayCategory } from "@/types/categories";
import type { Transaction } from "@/types/financial";
import { formatAmountInput, parseAmountInput } from "@/utils/format/formatters";
import { getTodayInputDate } from "@/utils/date/dateInput";
import {
  formatIncomeLinkOptionLabel,
  getLinkableIncomeRecords,
} from "@/utils/payRecords";
import { createTempTransactionId } from "@/utils/transactionIds";
import {
  formatQuickDeductionErrorMessage,
  isAllowedQuickDeductionType,
} from "@/utils/quickDeductionTypes";

const STANDALONE_LINK = "";

interface QuickDeductionModalProps {
  open: boolean;
  category: PayCategory | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const QuickDeductionModal = ({
  open,
  category,
  onClose,
  onSuccess,
}: QuickDeductionModalProps) => {
  const dispatch = useAppDispatch();
  const { transactions } = useAppSelector((state) => state.financial);

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [linkedSalaryId, setLinkedSalaryId] = useState(STANDALONE_LINK);
  const [salaryLinkChosen, setSalaryLinkChosen] = useState(false);
  const [openSalaryCombobox, setOpenSalaryCombobox] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const incomeRecords = useMemo(
    () =>
      getLinkableIncomeRecords(transactions).sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      ),
    [transactions],
  );

  const incomeLinkOptions = useMemo(
    () => [
      { value: STANDALONE_LINK, label: "No link (standalone)" },
      ...incomeRecords.map((record) => ({
        value: record.id,
        label: formatIncomeLinkOptionLabel(record),
      })),
    ],
    [incomeRecords],
  );

  const linkedIncomeRecord = useMemo(
    () => incomeRecords.find((record) => record.id === linkedSalaryId),
    [incomeRecords, linkedSalaryId],
  );

  useEffect(() => {
    if (!open || !category) {
      return;
    }

    setAmount(
      category.defaultAmount
        ? formatAmountInput(String(category.defaultAmount))
        : "",
    );
    setDescription("");
    setLinkedSalaryId(STANDALONE_LINK);
    setSalaryLinkChosen(false);
    setOpenSalaryCombobox(false);
    setFormError(null);
  }, [open, category]);

  const closeSalaryCombobox = useCallback(() => {
    setOpenSalaryCombobox(false);
  }, []);

  useModalEscape(onClose, {
    open: open && Boolean(category),
    nestedOpen: openSalaryCombobox,
    onNestedClose: closeSalaryCombobox,
  });

  if (!open || !category) {
    return null;
  }

  const parsedAmount = parseAmountInput(amount);
  const canSubmit = Number.isFinite(parsedAmount) && parsedAmount > 0;
  const descriptionPlaceholder = `${category.name} contribution`;

  const buildPayload = (): Transaction | null => {
    if (!canSubmit) {
      return null;
    }

    const today = getTodayInputDate();
    const [year, month, day] = today.split("-").map(Number);
    const timestamp = linkedIncomeRecord
      ? linkedIncomeRecord.timestamp
      : new Date(year, month - 1, day, 12, 0, 0).toISOString();

    const payload: Transaction = {
      id: createTempTransactionId(),
      timestamp,
      merchantOrLabel: description.trim(),
      amount: parsedAmount,
      category: "NEEDS",
      direction: "DEBIT",
      status: "COMPLETED",
      recordCategory: category.name,
      categoryId: category.id,
    };

    if (linkedIncomeRecord) {
      payload.linkedSalaryRecordId = linkedIncomeRecord.id;
    }

    return payload;
  };

  const handleSubmit = async () => {
    if (isSaving) {
      return;
    }

    if (!isAllowedQuickDeductionType(category.name)) {
      setFormError(formatQuickDeductionErrorMessage());
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

      const saved = await insertVaultRecord(payload, user.id);
      dispatch(executeTransaction(saved));
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to save deduction:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <VaultModalOverlay
      ariaLabelledBy="quick-deduction-title"
      onClose={onClose}
    >
      <div className={vaultModalPanelClass}>
        <VaultModalHeader
          titleId="quick-deduction-title"
          title={`Add ${category.name}`}
          description={`Add ${category.name} deduction and optionally link to income.`}
          onClose={onClose}
        />

        <div className="mt-6 space-y-4">
          {formError ? <FormErrorBanner message={formError} /> : null}

          <CurrencyAmountField
            id="quick-deduction-amount"
            label="Amount"
            required
            autoFocus
            value={amount}
            onChange={setAmount}
          />

          <div className="space-y-1.5">
            <FormFieldLabel htmlFor="quick-deduction-description">
              Description (optional)
            </FormFieldLabel>
            <Input
              id="quick-deduction-description"
              value={description}
              placeholder={descriptionPlaceholder}
              className="h-10 border-slate-300"
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <RecordCombobox
            label="Link to Income (optional)"
            placeholder="No link (standalone)"
            emptyValue={STANDALONE_LINK}
            hasUserSelection={salaryLinkChosen}
            value={linkedSalaryId}
            options={incomeLinkOptions}
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
            label={`Add ${category.name}`}
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
