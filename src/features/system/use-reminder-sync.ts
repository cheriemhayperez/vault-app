"use client";

import { useCallback, useEffect } from "react";

import { isTableMissingError } from "@/lib/supabaseErrors";
import { fetchUserReminders } from "@/api/reminders";
import { getCurrentVaultUser } from "@/api/user";
import { useAppDispatch } from "@/store";
import { setReminders } from "@/store/slices/remindersSlice";

const POLL_MS = 60_000;

export const useReminderSync = () => {
  const dispatch = useAppDispatch();

  const syncReminders = useCallback(async () => {
    try {
      const user = await getCurrentVaultUser();
      if (!user) {
        return;
      }
      const rows = await fetchUserReminders(user.id);
      dispatch(setReminders(rows));
    } catch (error) {
      if (!isTableMissingError(error)) {
        console.error("Failed to sync reminders:", error);
      }
    }
  }, [dispatch]);

  useEffect(() => {
    void syncReminders();

    const intervalId = setInterval(() => {
      void syncReminders();
    }, POLL_MS);

    const onFocus = () => {
      void syncReminders();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        void syncReminders();
      }
    });

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
    };
  }, [syncReminders]);
};
