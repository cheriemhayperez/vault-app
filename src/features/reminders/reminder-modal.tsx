"use client";

import { useCallback, useEffect, useState } from "react";

import { FormErrorBanner } from "@/components/shared/form-error-banner";
import { FormFieldLabel } from "@/components/shared/form-field-label";
import { RecordCombobox } from "@/components/shared/record-combobox";
import { VaultModalFooter } from "@/components/shared/vault-modal-footer";
import { VaultModalHeader } from "@/components/shared/vault-modal-header";
import { VaultSubmitButton } from "@/components/shared/vault-submit-button";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Input, VAULT_FIELD_INPUT_CLASS } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  VaultModalOverlay,
} from "@/components/ui/vault-modal-overlay";
import {
  insertVaultReminder,
  updateVaultReminder,
} from "@/api/reminders";
import { getCurrentVaultUser } from "@/api/user";
import { useModalEscape } from "@/hooks/use-modal-escape";
import { useAppDispatch } from "@/store";
import { addReminder, replaceReminder } from "@/store/slices/remindersSlice";
import {
  REMINDER_REPEAT_OPTIONS,
  REMINDER_TYPE_OPTIONS,
  type ReminderRepeatPattern,
  type ReminderType,
  type VaultReminder,
} from "@/types/reminders";
import {
  fromDateInputValue,
  fromDatetimeLocalValue,
  getDefaultReminderDatetimeLocal,
  toDateInputValue,
  toDatetimeLocalValue,
} from "@/utils/reminderFormat";

interface ReminderModalProps {
  open: boolean;
  editingReminder: VaultReminder | null;
  onClose: () => void;
  onSuccess?: (message: string) => void;
}

export const ReminderModal = ({
  open,
  editingReminder,
  onClose,
  onSuccess,
}: ReminderModalProps) => {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ReminderType>("custom");
  const [remindAtLocal, setRemindAtLocal] = useState(
    getDefaultReminderDatetimeLocal(),
  );
  const [isRepeating, setIsRepeating] = useState(false);
  const [repeatPattern, setRepeatPattern] =
    useState<ReminderRepeatPattern>("monthly");
  const [repeatUntil, setRepeatUntil] = useState("");
  const [openCombobox, setOpenCombobox] = useState<"type" | "pattern" | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const isEdit = Boolean(editingReminder);

  useEffect(() => {
    if (!open) {
      return;
    }
    if (editingReminder) {
      setTitle(editingReminder.title);
      setDescription(editingReminder.description ?? "");
      setType(editingReminder.type);
      setRemindAtLocal(toDatetimeLocalValue(editingReminder.remindAt));
      setIsRepeating(editingReminder.isRepeating);
      setRepeatPattern(editingReminder.repeatPattern ?? "monthly");
      setRepeatUntil(toDateInputValue(editingReminder.repeatUntil));
    } else {
      setTitle("");
      setDescription("");
      setType("custom");
      setRemindAtLocal(getDefaultReminderDatetimeLocal());
      setIsRepeating(false);
      setRepeatPattern("monthly");
      setRepeatUntil("");
    }
    setOpenCombobox(null);
    setSaveError(null);
  }, [open, editingReminder]);

  const closeCombobox = useCallback(() => {
    setOpenCombobox(null);
  }, []);

  useModalEscape(onClose, {
    open,
    nestedOpen: Boolean(openCombobox),
    onNestedClose: closeCombobox,
  });

  if (!open) {
    return null;
  }

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle || !remindAtLocal || isSaving) {
      return;
    }
    if (isRepeating && !repeatPattern) {
      return;
    }

    const payload = {
      title: trimmedTitle,
      description: description.trim() || undefined,
      type,
      remindAt: fromDatetimeLocalValue(remindAtLocal),
      isRepeating,
      repeatPattern: isRepeating ? repeatPattern : undefined,
      repeatUntil: isRepeating ? fromDateInputValue(repeatUntil) : undefined,
      status: editingReminder?.status ?? ("upcoming" as const),
    };

    setIsSaving(true);
    setSaveError(null);

    try {
      const user = await getCurrentVaultUser();
      if (!user) {
        return;
      }

      if (isEdit && editingReminder) {
        const updated = await updateVaultReminder(
          user.id,
          editingReminder.id,
          payload,
        );
        dispatch(replaceReminder(updated));
        onSuccess?.("Reminder updated successfully");
      } else {
        const created = await insertVaultReminder(user.id, payload);
        dispatch(addReminder(created));
        onSuccess?.("Reminder created successfully");
      }
      onClose();
    } catch (error) {
      console.error("Failed to save reminder:", error);
      setSaveError(
        error instanceof Error ? error.message : "Could not save reminder.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <VaultModalOverlay ariaLabelledBy="reminder-modal-title" onClose={onClose}>
      <div className="relative z-10 flex max-h-[min(90dvh,680px)] w-full min-h-[min(520px,65vh)] max-w-[480px] flex-col overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl">
        <div className="shrink-0 border-b border-slate-100 px-6 pb-4 pt-6">
          <VaultModalHeader
            titleId="reminder-modal-title"
            title={isEdit ? "Edit Reminder" : "Create New Reminder"}
            description={
              isEdit
                ? "Update your reminder details"
                : "Set up a new reminder for important dates"
            }
            onClose={onClose}
          />
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {saveError ? <FormErrorBanner message={saveError} /> : null}

          <div className="space-y-1.5">
            <FormFieldLabel required htmlFor="reminder-title">
              Title
            </FormFieldLabel>
            <Input
              id="reminder-title"
              autoFocus
              value={title}
              placeholder="e.g., Pay SSS contribution"
              className={VAULT_FIELD_INPUT_CLASS}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <FormFieldLabel optional htmlFor="reminder-description">
              Description
            </FormFieldLabel>
            <Textarea
              id="reminder-description"
              value={description}
              placeholder="Add any additional details..."
              rows={4}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <RecordCombobox
            label="Type"
            required
            placeholder="Select type"
            value={type}
            options={REMINDER_TYPE_OPTIONS}
            isOpen={openCombobox === "type"}
            onOpenChange={(isOpen) => setOpenCombobox(isOpen ? "type" : null)}
            onChange={(value) => setType(value as ReminderType)}
          />

          <div className="space-y-1.5">
            <FormFieldLabel required htmlFor="reminder-datetime">
              Date &amp; Time
            </FormFieldLabel>
            <DateTimePicker
              id="reminder-datetime"
              value={remindAtLocal}
              className={VAULT_FIELD_INPUT_CLASS}
              aria-label="Reminder date and time"
              onChange={setRemindAtLocal}
            />
          </div>

          <Checkbox
            id="reminder-repeat"
            checked={isRepeating}
            label="Repeat this reminder"
            onChange={(event) => setIsRepeating(event.target.checked)}
          />

          {isRepeating ? (
            <>
              <RecordCombobox
                label="Repeat Pattern"
                required
                placeholder="Select pattern"
                value={repeatPattern}
                options={REMINDER_REPEAT_OPTIONS}
                isOpen={openCombobox === "pattern"}
                onOpenChange={(isOpen) =>
                  setOpenCombobox(isOpen ? "pattern" : null)
                }
                onChange={(value) =>
                  setRepeatPattern(value as ReminderRepeatPattern)
                }
              />

              <div className="space-y-1.5">
                <label
                  htmlFor="reminder-repeat-until"
                  className="text-sm font-medium text-slate-700"
                >
                  Repeat Until (Optional)
                </label>
                <DatePicker
                  id="reminder-repeat-until"
                  value={repeatUntil}
                  className={VAULT_FIELD_INPUT_CLASS}
                  aria-label="Repeat until date"
                  onChange={setRepeatUntil}
                />
                <p className="text-[11px] text-slate-500">
                  Leave empty to repeat indefinitely
                </p>
              </div>
            </>
          ) : null}
        </div>

        <VaultModalFooter
          onCancel={onClose}
          cancelDisabled={isSaving}
          cancelClassName="transition disabled:opacity-50"
          className="flex shrink-0 justify-end gap-2 border-t border-slate-100 px-6 py-4"
        >
          <VaultSubmitButton
            type="button"
            label={isEdit ? "Update Reminder" : "Create Reminder"}
            mode={isEdit ? "update" : "save"}
            isProcessing={isSaving}
            disabled={!title.trim() || !remindAtLocal}
            onClick={() => void handleSubmit()}
          />
        </VaultModalFooter>
      </div>
    </VaultModalOverlay>
  );
};
