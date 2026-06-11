"use client";

import { useReminderSync } from "@/features/system/use-reminder-sync";

export const ReminderNotificationSync = () => {
  useReminderSync();
  return null;
};
