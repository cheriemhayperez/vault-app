import type { ReminderRepeatPattern, VaultReminder } from "@/types/reminders";

const pad = (value: number): string => String(value).padStart(2, "0");

export const toDatetimeLocalValue = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const fromDatetimeLocalValue = (value: string): string =>
  new Date(value).toISOString();

export const toDateInputValue = (iso: string | undefined): string => {
  if (!iso) {
    return "";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const fromDateInputValue = (value: string): string | undefined => {
  if (!value.trim()) {
    return undefined;
  }
  return new Date(`${value}T23:59:59`).toISOString();
};

export const formatReminderDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export const formatReminderTime = (iso: string): string =>
  new Date(iso).toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
  });

export const formatReminderRelative = (
  iso: string,
  reference = new Date(),
): string => {
  const target = new Date(iso).getTime();
  const now = reference.getTime();
  const diffSeconds = Math.round((target - now) / 1000);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  const abs = Math.abs(diffSeconds);
  if (abs < 60) {
    return formatter.format(diffSeconds, "second");
  }
  if (abs < 3600) {
    return formatter.format(Math.round(diffSeconds / 60), "minute");
  }
  if (abs < 86400) {
    return formatter.format(Math.round(diffSeconds / 3600), "hour");
  }
  return formatter.format(Math.round(diffSeconds / 86400), "day");
};

export const formatRepeatSummary = (reminder: VaultReminder): string | null => {
  if (!reminder.isRepeating || !reminder.repeatPattern) {
    return null;
  }

  const pattern =
    reminder.repeatPattern === "weekly"
      ? "weekly"
      : reminder.repeatPattern === "monthly"
        ? "monthly"
        : "yearly";

  if (reminder.repeatUntil) {
    return `Repeats ${pattern} until ${formatReminderDate(reminder.repeatUntil)}`;
  }
  return `Repeats ${pattern}`;
};

export const advanceReminderDate = (
  iso: string,
  pattern: ReminderRepeatPattern,
): string => {
  const date = new Date(iso);
  if (pattern === "weekly") {
    date.setDate(date.getDate() + 7);
  } else if (pattern === "monthly") {
    date.setMonth(date.getMonth() + 1);
  } else {
    date.setFullYear(date.getFullYear() + 1);
  }
  return date.toISOString();
};

export const getDefaultReminderDatetimeLocal = (): string =>
  toDatetimeLocalValue(new Date().toISOString());

/** Upcoming reminders that are overdue or scheduled for today. */
export const isReminderDue = (
  reminder: VaultReminder,
  reference = new Date(),
): boolean => {
  if (reminder.status !== "upcoming") {
    return false;
  }

  const remind = new Date(reminder.remindAt);
  if (Number.isNaN(remind.getTime())) {
    return false;
  }

  if (remind.getTime() <= reference.getTime()) {
    return true;
  }

  return (
    remind.getFullYear() === reference.getFullYear() &&
    remind.getMonth() === reference.getMonth() &&
    remind.getDate() === reference.getDate()
  );
};

export const isReminderOverdue = (
  reminder: VaultReminder,
  reference = new Date(),
): boolean => {
  if (reminder.status !== "upcoming") {
    return false;
  }

  const remind = new Date(reminder.remindAt);
  if (Number.isNaN(remind.getTime())) {
    return false;
  }

  return remind.getTime() < reference.getTime();
};

export const countDueReminders = (
  reminders: VaultReminder[],
  reference = new Date(),
): number =>
  reminders.filter((reminder) => isReminderDue(reminder, reference)).length;

/** Navbar badge: upcoming reminders that are due now or scheduled for today. */
export const countNotificationBadgeReminders = (
  reminders: VaultReminder[],
  reference = new Date(),
): number => countDueReminders(reminders, reference);

/** Upcoming reminders due within the next N hours (for soon badge). */
export const countUpcomingReminders = (reminders: VaultReminder[]): number =>
  reminders.filter((reminder) => reminder.status === "upcoming").length;

export const getNotificationBadgeCount = (
  reminders: VaultReminder[],
  reference = new Date(),
): number => {
  const due = countDueReminders(reminders, reference);
  if (due > 0) {
    return due;
  }
  return countUpcomingReminders(reminders);
};
