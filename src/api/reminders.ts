import { supabase } from "@/lib/supabaseClient";
import { formatSupabaseError, isTableMissingError } from "@/lib/supabaseErrors";
import { advanceReminderDate } from "@/utils/reminderFormat";
import type {
  ReminderUpsertPayload,
  ReminderStatus,
  VaultReminder,
  VaultReminderRow,
} from "@/types/reminders";

export type { ReminderUpsertPayload, VaultReminderRow } from "@/types/reminders";

const REMINDERS_TABLE = "reminders";

const rowToReminder = (row: VaultReminderRow): VaultReminder => ({
  id: row.id,
  title: row.title,
  description: row.description ?? undefined,
  type: row.type,
  remindAt: row.remind_at,
  isRepeating: row.is_repeating,
  repeatPattern: row.repeat_pattern ?? undefined,
  repeatUntil: row.repeat_until ?? undefined,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const payloadToRow = (
  userId: string,
  payload: ReminderUpsertPayload,
): Omit<VaultReminderRow, "id" | "created_at" | "updated_at"> => ({
  user_id: userId,
  title: payload.title.trim(),
  description: payload.description?.trim() || null,
  type: payload.type,
  remind_at: payload.remindAt,
  is_repeating: payload.isRepeating,
  repeat_pattern: payload.isRepeating ? (payload.repeatPattern ?? null) : null,
  repeat_until: payload.repeatUntil ?? null,
  status: payload.status ?? "upcoming",
});

export const fetchUserReminders = async (
  userId: string,
): Promise<VaultReminder[]> => {
  const { data, error } = await supabase
    .from(REMINDERS_TABLE)
    .select("*")
    .eq("user_id", userId)
    .order("remind_at", { ascending: true });

  if (error) {
    const message = formatSupabaseError(error);
    if (isTableMissingError(error)) {
      throw new Error(
        `Could not find the public.reminders table. Run supabase/reminders.sql — ${message}`,
      );
    }
    throw new Error(message);
  }

  return ((data as VaultReminderRow[]) ?? []).map(rowToReminder);
};

export const insertVaultReminder = async (
  userId: string,
  payload: ReminderUpsertPayload,
): Promise<VaultReminder> => {
  const { data, error } = await supabase
    .from(REMINDERS_TABLE)
    .insert([payloadToRow(userId, payload)])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return rowToReminder(data as VaultReminderRow);
};

export const updateVaultReminder = async (
  userId: string,
  reminderId: string,
  payload: ReminderUpsertPayload,
): Promise<VaultReminder> => {
  const { data, error } = await supabase
    .from(REMINDERS_TABLE)
    .update({
      ...payloadToRow(userId, payload),
      updated_at: new Date().toISOString(),
    })
    .eq("id", reminderId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return rowToReminder(data as VaultReminderRow);
};

export const deleteVaultReminder = async (
  userId: string,
  reminderId: string,
): Promise<void> => {
  const { error } = await supabase
    .from(REMINDERS_TABLE)
    .delete()
    .eq("id", reminderId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
};

export const setVaultReminderStatus = async (
  userId: string,
  reminderId: string,
  status: ReminderStatus,
): Promise<VaultReminder> => {
  const { data, error } = await supabase
    .from(REMINDERS_TABLE)
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", reminderId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return rowToReminder(data as VaultReminderRow);
};

export const completeVaultReminder = async (
  userId: string,
  reminder: VaultReminder,
): Promise<{ completed: VaultReminder; next?: VaultReminder }> => {
  const completed = await setVaultReminderStatus(
    userId,
    reminder.id,
    "completed",
  );

  if (
    !reminder.isRepeating ||
    !reminder.repeatPattern
  ) {
    return { completed };
  }

  let nextAt = advanceReminderDate(reminder.remindAt, reminder.repeatPattern);
  const untilMs = reminder.repeatUntil
    ? new Date(reminder.repeatUntil).getTime()
    : undefined;

  if (untilMs !== undefined && new Date(nextAt).getTime() > untilMs) {
    return { completed };
  }

  const next = await insertVaultReminder(userId, {
    title: reminder.title,
    description: reminder.description,
    type: reminder.type,
    remindAt: nextAt,
    isRepeating: reminder.isRepeating,
    repeatPattern: reminder.repeatPattern,
    repeatUntil: reminder.repeatUntil,
    status: "upcoming",
  });

  return { completed, next };
};
