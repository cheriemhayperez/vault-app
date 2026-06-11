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
  getReminderTypeIconClass,
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

const MUTED_ACTION_CLASS =
  "rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-500";

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
          className="rounded-lg p-2 text-violet-600 transition hover:bg-violet-50"
          aria-label="Mark as completed"
        >
          <Check className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => onEdit(reminder)}
          className={MUTED_ACTION_CLASS}
          aria-label={`Edit ${reminder.title}`}
        >
          <Pencil className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => onDismiss(reminder)}
          className={MUTED_ACTION_CLASS}
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
        className="rounded-lg p-2 text-violet-600 transition hover:bg-violet-50"
        aria-label={`Restore ${reminder.title}`}
      >
        <RotateCcw className="size-4" />
      </button>
    ) : null}
    <button
      type="button"
      onClick={() => onDelete(reminder)}
      className={MUTED_ACTION_CLASS}
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
  const iconTone = getReminderTypeIconClass(reminder.type);

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
        className={`relative overflow-hidden rounded-xl border ${
          isCompleted
            ? "border-slate-200 bg-slate-50/80"
            : "border-slate-100 bg-white"
        }`}
      >
        {showAccent ? (
          <span
            className={`absolute inset-y-0 left-0 w-1 ${accentClass}`}
            aria-hidden
          />
        ) : null}

        <div
          className={`py-4 pr-4 ${showAccent ? "pl-5" : "pl-4"} ${
            isCompleted ? "opacity-80" : ""
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                isCompleted ? "bg-slate-100" : iconTone.box
              }`}
            >
              <Bell
                className={`size-5 ${
                  isCompleted ? "text-slate-400" : iconTone.icon
                }`}
              />
            </div>
            <p
              className={`min-w-0 flex-1 truncate ${
                isCompleted
                  ? "font-medium text-slate-400 line-through decoration-slate-300"
                  : "font-semibold text-slate-900"
              }`}
            >
              {reminder.title}
            </p>
            <ReminderActionButtons {...actionProps} />
          </div>

          <div className="my-3 border-t border-slate-100" />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div
              className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-xs ${
                isCompleted
                  ? "text-slate-400"
                  : isDismissed
                    ? "text-violet-600"
                    : "text-slate-500"
              }`}
            >
              <span
                className={`inline-flex rounded-md px-2 py-0.5 font-medium ${
                  isCompleted ? "opacity-70" : ""
                } ${getReminderTypeBadgeClass(reminder.type)}`}
              >
                {getReminderTypeLabel(reminder.type)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="size-3.5 shrink-0" />
                {formatReminderDate(reminder.remindAt)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5 shrink-0" />
                {formatReminderTime(reminder.remindAt)}
              </span>
              {repeatSummary ? (
                <span className="inline-flex items-center gap-1">
                  <Repeat className="size-3.5 shrink-0" />
                  {repeatSummary}
                </span>
              ) : null}
            </div>
            {tab === "upcoming" ? (
              overdue ? (
                <span className="shrink-0 rounded-full bg-red-500 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                  Overdue
                </span>
              ) : (
                <span className="shrink-0 text-xs text-slate-500">
                  {formatReminderRelative(reminder.remindAt, now)}
                </span>
              )
            ) : null}
          </div>

          {reminder.description ? (
            <p
              className={`mt-3 text-sm ${
                isCompleted ? "text-slate-400" : "text-slate-500"
              }`}
            >
              {reminder.description}
            </p>
          ) : null}
        </div>
      </div>
    </li>
  );
};
