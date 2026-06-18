"use client";

import { useLiveNow } from "@/features/system/use-live-now";
import {
  Bell,
  Calendar,
  Check,
  Clock,
  Pencil,
  Repeat,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";

import {
  getReminderTypeBadgeClass,
  getReminderTypeLabel,
  type ReminderStatus,
  type VaultReminder,
} from "@/types/reminders";
import {
  formatReminderDate,
  formatReminderRelative,
  formatReminderTime,
  formatRepeatSummary,
  isReminderOverdue,
} from "@/utils/reminderFormat";

interface ReminderListItemProps {
  reminder: VaultReminder;
  tab: ReminderStatus;
  onComplete: (reminder: VaultReminder) => void;
  onEdit: (reminder: VaultReminder) => void;
  onDismiss: (reminder: VaultReminder) => void;
  onRestore: (reminder: VaultReminder) => void;
  onDelete: (reminder: VaultReminder) => void;
}

const ReminderActionButtons = ({
  reminder,
  tab,
  onComplete,
  onEdit,
  onDismiss,
  onRestore,
  onDelete,
}: ReminderListItemProps) => (
  <div className="flex shrink-0 items-center gap-0.5">
    {tab === "upcoming" ? (
      <>
        <button
          type="button"
          onClick={() => onComplete(reminder)}
          className="rounded-lg p-2 text-violet-600 transition hover:bg-violet-50 dark:hover:bg-violet-500/15 dark:hover:text-violet-400"
          aria-label="Mark as completed"
        >
          <Check className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => onEdit(reminder)}
          className="vault-reminder-action-edit"
          aria-label={`Edit ${reminder.title}`}
        >
          <Pencil className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => onDismiss(reminder)}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-yellow-500/15 hover:text-yellow-500 dark:hover:bg-yellow-500/15 dark:hover:text-yellow-400"
          aria-label={`Dismiss ${reminder.title}`}
        >
          <X className="size-4" />
        </button>
      </>
    ) : null}
    {tab === "completed" || tab === "dismissed" ? (
      <button
        type="button"
        onClick={() => onRestore(reminder)}
        className="vault-reminder-action-restore"
        aria-label={`Restore ${reminder.title}`}
      >
        <RotateCcw className="size-4" />
      </button>
    ) : null}
    <button
      type="button"
      onClick={() => onDelete(reminder)}
      className="vault-reminder-action-delete"
      aria-label={`Delete ${reminder.title}`}
    >
      <Trash2 className="size-4" />
    </button>
  </div>
);

export const ReminderListItem = ({
  reminder,
  tab,
  onComplete,
  onEdit,
  onDismiss,
  onRestore,
  onDelete,
}: ReminderListItemProps) => {
  const now = useLiveNow(30_000);
  const repeatSummary = formatRepeatSummary(reminder);
  const isCompleted = tab === "completed";
  const isDismissed = tab === "dismissed";
  const showAccent = tab === "upcoming" || tab === "dismissed";
  const overdue = tab === "upcoming" && isReminderOverdue(reminder, now);
  const accentClass = isDismissed
    ? "bg-violet-500"
    : overdue
      ? "bg-red-500"
      : "bg-emerald-500";

  const actionProps = {
    reminder,
    tab,
    onComplete,
    onEdit,
    onDismiss,
    onRestore,
    onDelete,
  };

  return (
    <li className="px-4 py-2 first:pt-4 last:pb-4">
      <div
        className={`relative overflow-hidden rounded-xl border vault-reminder-card ${
          isCompleted ? "vault-reminder-card--completed" : ""
        }`}
      >
        {showAccent ? (
          <span
            className={`absolute inset-y-0 left-0 w-1 ${accentClass}`}
            aria-hidden
          />
        ) : null}

        <div className={`py-4 pr-4 ${showAccent ? "pl-5" : "pl-4"}`}>
          <div
            className={`flex items-start gap-3 ${isCompleted ? "opacity-80" : ""}`}
          >
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                isCompleted ? "dark:bg-white/15" : ""
              }`}
            >
              <Bell
                className={`size-5 ${
                  isCompleted
                    ? "text-slate-400 dark:text-white"
                    : "text-slate-900"
                }`}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={`truncate ${
                  isCompleted
                    ? "font-medium text-slate-400 line-through decoration-slate-300"
                    : "font-semibold text-slate-900"
                }`}
              >
                {reminder.title}
              </p>
              {reminder.description ? (
                <p
                  className={`mt-1 text-sm ${
                    isCompleted ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {reminder.description}
                </p>
              ) : null}
            </div>
            <ReminderActionButtons {...actionProps} />
          </div>

          <div
            className={`vault-reminder-card-divider my-3 border-t border-slate-100 ${
              showAccent ? "vault-reminder-card-divider--accent" : ""
            }`}
          />

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
              <span
                className={`inline-flex font-medium ${getReminderTypeBadgeClass(reminder.type)}`}
              >
                {getReminderTypeLabel(reminder.type)}
              </span>
              <span className="vault-reminder-meta-datetime inline-flex items-center gap-1">
                <Calendar className="size-3.5 shrink-0" />
                {formatReminderDate(reminder.remindAt)}
              </span>
              <span className="vault-reminder-meta-datetime inline-flex items-center gap-1">
                <Clock className="size-3.5 shrink-0" />
                {formatReminderTime(reminder.remindAt)}
              </span>
              {tab === "upcoming" && overdue ? (
                <span className="shrink-0 rounded-full bg-red-500 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                  Overdue
                </span>
              ) : null}
              {tab === "upcoming" && !overdue ? (
                <span className="vault-reminder-meta-datetime shrink-0">
                  {formatReminderRelative(reminder.remindAt, now)}
                </span>
              ) : null}
              {repeatSummary ? (
                <span className="vault-reminder-meta-datetime inline-flex items-center gap-1">
                  <Repeat className="size-3.5 shrink-0" />
                  {repeatSummary}
                </span>
              ) : null}
          </div>
        </div>
      </div>
    </li>
  );
};
