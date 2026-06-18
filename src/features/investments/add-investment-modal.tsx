"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell } from "lucide-react";

import { CurrencyAmountField } from "@/components/shared/currency-amount-field";
import { FilterSelectMenu } from "@/components/shared/filter-select-menu";
import { FormFieldLabel } from "@/components/shared/form-field-label";
import { RecordCombobox } from "@/components/shared/record-combobox";
import { VaultModalFooter } from "@/components/shared/vault-modal-footer";
import { VaultModalHeader } from "@/components/shared/vault-modal-header";
import { VaultSubmitButton } from "@/components/shared/vault-submit-button";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  VaultModalOverlay,
  vaultModalPanelClass,
} from "@/components/ui/vault-modal-overlay";
import type { VaultInvestment } from "@/types/investments";
import {
  INVESTMENT_TRANSACTION_OPTIONS,
  INVESTMENT_TYPE_OPTIONS,
} from "@/types/investments";
import { createInvestmentId } from "@/utils/vaultInvestments";
import { formatAmountInput, parseAmountInput } from "@/utils/format/formatters";
import { getTodayInputDate } from "@/utils/date/dateInput";
import { useModalEscape } from "@/hooks/use-modal-escape";

const INVESTMENT_TYPE_SELECT_OPTIONS = INVESTMENT_TYPE_OPTIONS.map(
  (option) => ({
    value: option.value,
    label: option.label,
  }),
);

const INVESTMENT_TRANSACTION_SELECT_OPTIONS =
  INVESTMENT_TRANSACTION_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
  }));

const REMINDER_DURATION_OPTIONS = [
  { value: "3", label: "3 months" },
  { value: "6", label: "6 months" },
  { value: "12", label: "12 months (1 year)" },
  { value: "16", label: "16 months" },
  { value: "24", label: "24 months (2 years)" },
  { value: "36", label: "36 months (3 years)" },
  { value: "60", label: "60 months (5 years)" },
];

const getReminderDurationLabel = (value: string): string =>
  REMINDER_DURATION_OPTIONS.find((option) => option.value === value)?.label ??
  `${value} months`;

const STANDALONE_PARENT = "";

interface AddInvestmentModalProps {
  open: boolean;
  investment?: VaultInvestment | null;
  investments: VaultInvestment[];
  onClose: () => void;
  onSave: (investment: VaultInvestment) => void | Promise<void>;
}

export const AddInvestmentModal = ({
  open,
  investment,
  investments,
  onClose,
  onSave,
}: AddInvestmentModalProps) => {
  const isEdit = Boolean(investment);
  const [name, setName] = useState("");
  const [type, setType] = useState<VaultInvestment["type"]>("stocks");
  const [transactionType, setTransactionType] =
    useState<VaultInvestment["transactionType"]>("buy");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(getTodayInputDate);
  const [startedDate, setStartedDate] = useState(getTodayInputDate);
  const [notes, setNotes] = useState("");
  const [parentId, setParentId] = useState(STANDALONE_PARENT);
  const [parentLinkChosen, setParentLinkChosen] = useState(false);
  const [isParentLinkOpen, setIsParentLinkOpen] = useState(false);
  const [recurringReminder, setRecurringReminder] = useState(false);
  const [reminderDuration, setReminderDuration] = useState("12");
  const [nameError, setNameError] = useState<string | null>(null);
  const [amountError, setAmountError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const parentOptions = useMemo(
    () =>
      investments.filter(
        (item) =>
          !item.parentId &&
          item.transactionType === "buy" &&
          item.id !== investment?.id,
      ),
    [investments, investment?.id],
  );

  const parentComboboxOptions = useMemo(
    () => [
      { value: STANDALONE_PARENT, label: "None (standalone investment)" },
      ...parentOptions.map((item) => ({
        value: item.id,
        label: item.name,
      })),
    ],
    [parentOptions],
  );

  useEffect(() => {
    if (!open) {
      return;
    }
    if (investment) {
      setName(investment.name);
      setType(investment.type);
      setTransactionType(investment.transactionType);
      setAmount(formatAmountInput(String(investment.amount)));
      setDate(investment.date);
      setStartedDate(investment.startedDate ?? investment.date);
      setNotes(investment.notes ?? "");
      setParentId(investment.parentId ?? STANDALONE_PARENT);
      setParentLinkChosen(Boolean(investment.parentId));
      setRecurringReminder(Boolean(investment.recurringReminder));
      setReminderDuration(investment.reminderDuration ?? "12");
    } else {
      setName("");
      setType("stocks");
      setTransactionType("buy");
      setAmount("");
      setDate(getTodayInputDate());
      setStartedDate(getTodayInputDate());
      setNotes("");
      setParentId(STANDALONE_PARENT);
      setParentLinkChosen(false);
      setRecurringReminder(false);
      setReminderDuration("12");
    }
    setNameError(null);
    setAmountError(null);
    setIsParentLinkOpen(false);
  }, [open, investment]);

  const closeParentLink = useCallback(() => {
    setIsParentLinkOpen(false);
  }, []);

  useModalEscape(onClose, {
    open,
    disabled: isSaving,
    nestedOpen: isParentLinkOpen,
    onNestedClose: closeParentLink,
  });

  if (!open) {
    return null;
  }

  const parsedAmount = parseAmountInput(amount);
  const canSubmit =
    name.trim().length > 0 && Number.isFinite(parsedAmount) && parsedAmount > 0;

  const handleSubmit = async () => {
    let valid = true;
    if (!name.trim()) {
      setNameError("Investment name is required");
      valid = false;
    } else {
      setNameError(null);
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setAmountError("Amount must be a valid number");
      valid = false;
    } else {
      setAmountError(null);
    }
    if (!valid || isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        id: investment?.id ?? createInvestmentId(),
        name: name.trim(),
        type,
        transactionType,
        amount: parsedAmount,
        date,
        startedDate,
        notes: notes.trim() || undefined,
        parentId: parentId || null,
        recurringReminder,
        reminderDuration: recurringReminder ? reminderDuration : undefined,
        returns: investment?.returns ?? [],
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const titleId = isEdit ? "edit-investment-title" : "add-investment-title";

  return (
    <VaultModalOverlay ariaLabelledBy={titleId} onClose={onClose}>
      <div className={`${vaultModalPanelClass} !max-w-2xl`}>
        <VaultModalHeader
          titleId={titleId}
          title={isEdit ? "Edit Investment" : "Add Investment"}
          description={
            isEdit
              ? "Update your investment details below."
              : "Add a new investment to track your portfolio."
          }
          onClose={onClose}
        />

        <div className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <FormFieldLabel required htmlFor="investment-name">
              Investment Name
            </FormFieldLabel>
            <Input
              id="investment-name"
              autoFocus
              value={name}
              placeholder="e.g., Apple Stock, Bitcoin, Rental Property"
              className={nameError ? "border-rose-400 focus:border-rose-400" : ""}
              onChange={(event) => setName(event.target.value)}
            />
            {nameError ? (
              <p className="text-xs text-rose-500">{nameError}</p>
            ) : null}
          </div>

          {isEdit ? (
            <RecordCombobox
              label="Link to Parent Investment (optional)"
              placeholder="None (standalone investment)"
              emptyValue={STANDALONE_PARENT}
              hasUserSelection={parentLinkChosen}
              value={parentId}
              options={parentComboboxOptions}
              isOpen={isParentLinkOpen}
              onOpenChange={setIsParentLinkOpen}
              onChange={(value) => {
                setParentId(value);
                setParentLinkChosen(true);
              }}
              helperText={
                <p className="text-xs text-slate-500">
                  Link interest/dividend payments to their capital investment
                </p>
              }
            />
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <FormFieldLabel>Investment Type</FormFieldLabel>
              <FilterSelectMenu
                ariaLabel="Investment type"
                value={type}
                options={INVESTMENT_TYPE_SELECT_OPTIONS}
                minWidthClass="w-full"
                onChange={(value) =>
                  setType(value as VaultInvestment["type"])
                }
              />
            </div>
            <div className="space-y-1.5">
              <FormFieldLabel>Transaction Type</FormFieldLabel>
              <FilterSelectMenu
                ariaLabel="Transaction type"
                value={transactionType}
                options={INVESTMENT_TRANSACTION_SELECT_OPTIONS}
                minWidthClass="w-full"
                onChange={(value) =>
                  setTransactionType(
                    value as VaultInvestment["transactionType"],
                  )
                }
              />
            </div>
          </div>

          <CurrencyAmountField
            label={
              isEdit &&
              (transactionType === "dividend" || transactionType === "interest")
                ? "Amount Received"
                : "Amount"
            }
            required
            value={amount}
            onChange={setAmount}
            inputClassName="pl-9"
            error={amountError ?? undefined}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <FormFieldLabel required>Transaction Date</FormFieldLabel>
              <DatePicker
                value={date}
                aria-label="Transaction date"
                onChange={setDate}
              />
            </div>
            <div className="space-y-1.5">
              <FormFieldLabel>Date Started Investing</FormFieldLabel>
              <DatePicker
                value={startedDate}
                aria-label="Date started investing"
                onChange={setStartedDate}
              />
              <p className="text-xs text-slate-500">
                When the investment term begins
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <FormFieldLabel optional>Notes</FormFieldLabel>
            <Textarea
              rows={3}
              value={notes}
              placeholder="e.g., '12-month contract @ 30% monthly, total pay-out ₱180,000'"
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>

          <Checkbox
            checked={recurringReminder}
            onChange={(event) => setRecurringReminder(event.target.checked)}
            label={
              isEdit
                ? "Recurring payout reminder"
                : "Create recurring payout reminder"
            }
          />

          {recurringReminder ? (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <FormFieldLabel>Reminder Duration</FormFieldLabel>
                <FilterSelectMenu
                  ariaLabel="Reminder duration"
                  value={reminderDuration}
                  options={REMINDER_DURATION_OPTIONS}
                  minWidthClass="w-fit min-w-[13.5rem]"
                  onChange={setReminderDuration}
                />
              </div>
              <div className="vault-investment-reminder-callout flex gap-3 rounded-lg px-3.5 py-3">
                <Bell className="vault-investment-reminder-callout-icon mt-0.5 size-4 shrink-0" />
                <div>
                  <p className="vault-investment-reminder-callout-title text-sm font-semibold">
                    Reminder Settings
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">
                    A monthly recurring reminder will be created for{" "}
                    {getReminderDurationLabel(reminderDuration)}, starting from
                    your investment start date. You can manage it in the
                    Reminders section.
                  </p>
                </div>
              </div>
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
            label={isEdit ? "Update Investment" : "Add Investment"}
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
