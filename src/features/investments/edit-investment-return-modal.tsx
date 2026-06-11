"use client";

import { useEffect, useState } from "react";

import { CurrencyAmountField } from "@/components/shared/currency-amount-field";
import { FilterSelectMenu } from "@/components/shared/filter-select-menu";
import { FormErrorBanner } from "@/components/shared/form-error-banner";
import { FormFieldLabel } from "@/components/shared/form-field-label";
import { VaultModalFooter } from "@/components/shared/vault-modal-footer";
import { VaultModalHeader } from "@/components/shared/vault-modal-header";
import { VaultSubmitButton } from "@/components/shared/vault-submit-button";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import {
  VaultModalOverlay,
  vaultModalPanelClass,
} from "@/components/ui/vault-modal-overlay";
import { updateInvestmentReturn } from "@/api/investments";
import { getCurrentVaultUser } from "@/api/user";
import { useModalEscape } from "@/hooks/use-modal-escape";
import type { InvestmentReturn, InvestmentReturnType, VaultInvestment } from "@/types/investments";
import { INVESTMENT_RETURN_TYPE_OPTIONS } from "@/types/investments";
import { formatAmountInput, parseAmountInput } from "@/utils/format/formatters";

const RETURN_TYPE_SELECT_OPTIONS = INVESTMENT_RETURN_TYPE_OPTIONS.map(
  (option) => ({
    value: option.value,
    label: option.label,
  }),
);

export interface EditInvestmentReturnTarget {
  investment: VaultInvestment;
  returnItem: InvestmentReturn;
}

interface EditInvestmentReturnModalProps {
  open: boolean;
  target: EditInvestmentReturnTarget | null;
  onClose: () => void;
  onSaved: (investment: VaultInvestment) => void;
}

export const EditInvestmentReturnModal = ({
  open,
  target,
  onClose,
  onSaved,
}: EditInvestmentReturnModalProps) => {
  const [type, setType] = useState<InvestmentReturnType>("dividend");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [amountError, setAmountError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open || !target) {
      return;
    }
    setType(target.returnItem.type);
    setAmount(formatAmountInput(String(target.returnItem.amount)));
    setDate(target.returnItem.date);
    setNotes(target.returnItem.notes ?? "");
    setAmountError(null);
    setFormError(null);
    setIsSaving(false);
  }, [open, target]);

  useModalEscape(onClose, { open: open && Boolean(target), disabled: isSaving });

  if (!open || !target) {
    return null;
  }

  const { investment, returnItem } = target;
  const parsedAmount = parseAmountInput(amount);
  const hasValidAmount = Number.isFinite(parsedAmount) && parsedAmount > 0;
  const restoredPrincipal =
    returnItem.type === "sell"
      ? investment.amount + returnItem.amount
      : investment.amount;
  const sellExceedsPrincipal =
    type === "sell" && hasValidAmount && parsedAmount > restoredPrincipal;
  const canSubmit = !isSaving && hasValidAmount && !sellExceedsPrincipal;

  const handleSubmit = async () => {
    setFormError(null);

    if (!hasValidAmount) {
      setAmountError("Amount must be a valid number");
      return;
    }
    setAmountError(null);

    if (type === "sell" && parsedAmount > restoredPrincipal) {
      setAmountError("Cannot exceed active principal");
      return;
    }

    setIsSaving(true);
    try {
      const user = await getCurrentVaultUser();
      if (!user) {
        setFormError("You must be signed in to update a return.");
        return;
      }

      const saved = await updateInvestmentReturn(
        user.id,
        investment,
        returnItem.id,
        {
          type,
          amount: parsedAmount,
          date,
          notes: notes.trim() || undefined,
        },
      );

      onSaved(saved);
      onClose();
    } catch (error) {
      console.error("Failed to update return:", error);
      setFormError(
        error instanceof Error
          ? error.message
          : "Could not update return. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <VaultModalOverlay ariaLabelledBy="edit-return-title" onClose={onClose}>
      <form
        className={`${vaultModalPanelClass} !max-w-2xl`}
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <VaultModalHeader
          titleId="edit-return-title"
          title="Edit Return"
          description="Update your return details below."
          onClose={onClose}
        />

        <div className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <FormFieldLabel required>Type</FormFieldLabel>
            <FilterSelectMenu
              ariaLabel="Return type"
              value={type}
              options={RETURN_TYPE_SELECT_OPTIONS}
              minWidthClass="w-full"
              onChange={(value) => setType(value as InvestmentReturnType)}
            />
            {type === "sell" ? (
              <p className="text-xs text-slate-500">
                Active principal: ₱
                {formatAmountInput(String(restoredPrincipal))}. This amount will
                be subtracted from your investment balance.
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                Dividends and interest do not reduce your invested principal.
              </p>
            )}
          </div>

          <CurrencyAmountField
            id="edit-return-amount"
            label="Amount Received"
            required
            value={amount}
            onChange={setAmount}
            inputClassName="pl-9"
            error={amountError ?? undefined}
          />

          <div className="space-y-1.5">
            <FormFieldLabel required htmlFor="edit-return-date">
              Transaction Date
            </FormFieldLabel>
            <DatePicker
              id="edit-return-date"
              value={date}
              aria-label="Return date"
              onChange={setDate}
            />
          </div>

          <div className="space-y-1.5">
            <FormFieldLabel htmlFor="edit-return-notes">Notes</FormFieldLabel>
            <Textarea
              id="edit-return-notes"
              rows={3}
              value={notes}
              placeholder="e.g., '12-month contract @ 30% monthly, total pay-out ₱180,000'"
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>

          {formError ? <FormErrorBanner message={formError} /> : null}
        </div>

        <VaultModalFooter
          onCancel={onClose}
          className="mt-6 flex justify-end gap-3"
        >
          <VaultSubmitButton
            type="submit"
            label="Update Return"
            mode="update"
            isProcessing={isSaving}
            disabled={!canSubmit}
          />
        </VaultModalFooter>
      </form>
    </VaultModalOverlay>
  );
};
