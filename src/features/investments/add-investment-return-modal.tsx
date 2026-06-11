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
import { recordInvestmentPayout } from "@/api/investments";
import { getCurrentVaultUser } from "@/api/user";
import { useModalEscape } from "@/hooks/use-modal-escape";
import type { InvestmentReturnType, VaultInvestment } from "@/types/investments";
import { INVESTMENT_RETURN_TYPE_OPTIONS } from "@/types/investments";
import { formatAmountInput, parseAmountInput } from "@/utils/format/formatters";
import { getTodayInputDate } from "@/utils/date/dateInput";

const RETURN_TYPE_SELECT_OPTIONS = INVESTMENT_RETURN_TYPE_OPTIONS.map(
  (option) => ({
    value: option.value,
    label: option.label,
  }),
);

interface AddInvestmentReturnModalProps {
  open: boolean;
  investment: VaultInvestment | null;
  onClose: () => void;
  onSaved: (investment: VaultInvestment) => void;
}

export const AddInvestmentReturnModal = ({
  open,
  investment,
  onClose,
  onSaved,
}: AddInvestmentReturnModalProps) => {
  const [type, setType] = useState<InvestmentReturnType>("dividend");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(getTodayInputDate);
  const [notes, setNotes] = useState("");
  const [amountError, setAmountError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    setType("dividend");
    setAmount("");
    setDate(getTodayInputDate());
    setNotes("");
    setAmountError(null);
    setFormError(null);
    setIsSaving(false);
  }, [open, investment?.id]);

  useModalEscape(onClose, { open: open && Boolean(investment), disabled: isSaving });

  if (!open || !investment) {
    return null;
  }

  const parsedAmount = parseAmountInput(amount);
  const hasValidAmount = Number.isFinite(parsedAmount) && parsedAmount > 0;
  const sellExceedsPrincipal =
    type === "sell" && hasValidAmount && parsedAmount > investment.amount;
  const canSubmit = !isSaving && hasValidAmount && !sellExceedsPrincipal;

  const handleSubmit = async () => {
    setFormError(null);

    if (!hasValidAmount) {
      setAmountError("Amount must be a valid number");
      return;
    }
    setAmountError(null);

    if (type === "sell" && parsedAmount > investment.amount) {
      setAmountError("Cannot exceed active principal");
      return;
    }

    setIsSaving(true);
    try {
      const user = await getCurrentVaultUser();
      if (!user) {
        setFormError("You must be signed in to record a payout.");
        return;
      }

      const saved = await recordInvestmentPayout(user.id, investment, {
        type,
        amount: parsedAmount,
        date,
        notes: notes.trim() || undefined,
      });

      onSaved(saved);
      onClose();
    } catch (error) {
      console.error("Failed to record payout:", error);
      setFormError(
        error instanceof Error
          ? error.message
          : "Could not record payout. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <VaultModalOverlay ariaLabelledBy="add-return-title" onClose={onClose}>
      <form
        className={`${vaultModalPanelClass} max-w-md`}
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <VaultModalHeader
          titleId="add-return-title"
          title="Add Return/Payout"
          description={`Record a return from ${investment.name}`}
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
                Active principal: ₱{formatAmountInput(String(investment.amount))}
                . This amount will be subtracted from your investment balance.
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                Dividends and interest do not reduce your invested principal.
              </p>
            )}
          </div>

          <CurrencyAmountField
            label="Amount"
            required
            value={amount}
            onChange={setAmount}
            inputClassName="pl-9"
            error={amountError ?? undefined}
          />

          <div className="space-y-1.5">
            <FormFieldLabel required>Date</FormFieldLabel>
            <DatePicker
              value={date}
              aria-label="Return date"
              onChange={setDate}
            />
          </div>

          <div className="space-y-1.5">
            <FormFieldLabel optional>Notes</FormFieldLabel>
            <Textarea
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
          className="mt-6 flex justify-end gap-3"
        >
          <VaultSubmitButton
            type="submit"
            label="Add Return"
            mode="save"
            isProcessing={isSaving}
            disabled={!canSubmit}
          />
        </VaultModalFooter>
      </form>
    </VaultModalOverlay>
  );
};
