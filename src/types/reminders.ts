export type ReminderType =
  | "salary"
  | "tax"
  | "contribution"
  | "bill"
  | "investment"
  | "custom";

export type ReminderStatus = "upcoming" | "completed" | "dismissed";

export type ReminderRepeatPattern = "weekly" | "monthly" | "yearly";

export interface VaultReminder {
  id: string;
  title: string;
  description?: string;
  type: ReminderType;
  remindAt: string;
  isRepeating: boolean;
  repeatPattern?: ReminderRepeatPattern;
  repeatUntil?: string;
  status: ReminderStatus;
  createdAt?: string;
  updatedAt?: string;
}

export const REMINDER_TYPE_OPTIONS: { value: ReminderType; label: string }[] = [
  { value: "salary", label: "Salary" },
  { value: "tax", label: "Tax" },
  { value: "contribution", label: "Contribution" },
  { value: "bill", label: "Bill" },
  { value: "investment", label: "Investment" },
  { value: "custom", label: "Custom" },
];

export const REMINDER_REPEAT_OPTIONS: {
  value: ReminderRepeatPattern;
  label: string;
}[] = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

const REMINDER_TYPE_BADGE: Record<ReminderType, string> = {
  salary: "bg-violet-50 text-violet-700",
  tax: "bg-rose-50 text-rose-700",
  contribution: "bg-teal-50 text-teal-700",
  bill: "bg-amber-50 text-amber-800",
  investment: "bg-indigo-50 text-indigo-700",
  custom: "text-black dark:text-white vault-reminder-type-label--custom",
};

export const getReminderTypeLabel = (type: ReminderType): string =>
  REMINDER_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type;

export const getReminderTypeBadgeClass = (type: ReminderType): string =>
  REMINDER_TYPE_BADGE[type] ?? REMINDER_TYPE_BADGE.custom;

const REMINDER_TYPE_ICON: Record<ReminderType, { box: string; icon: string }> = {
  salary: { box: "bg-violet-50", icon: "text-violet-600" },
  tax: { box: "bg-rose-50", icon: "text-rose-600" },
  contribution: { box: "bg-teal-50", icon: "text-teal-600" },
  bill: { box: "bg-rose-50", icon: "text-rose-600" },
  investment: { box: "bg-indigo-50", icon: "text-indigo-600" },
  custom: { box: "bg-sky-50", icon: "text-sky-600" },
};

export const getReminderTypeIconClass = (
  type: ReminderType,
): { box: string; icon: string } =>
  REMINDER_TYPE_ICON[type] ?? REMINDER_TYPE_ICON.custom;

/** Supabase `reminders` table row shape. */
export interface VaultReminderRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  type: ReminderType;
  remind_at: string;
  is_repeating: boolean;
  repeat_pattern: ReminderRepeatPattern | null;
  repeat_until: string | null;
  status: ReminderStatus;
  created_at?: string;
  updated_at?: string;
}

export interface ReminderUpsertPayload {
  title: string;
  description?: string;
  type: ReminderType;
  remindAt: string;
  isRepeating: boolean;
  repeatPattern?: ReminderRepeatPattern;
  repeatUntil?: string;
  status?: ReminderStatus;
}
