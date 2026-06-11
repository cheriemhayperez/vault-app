"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { ReminderActionVariant } from "../reminder-action-dialog";
import {
  completeVaultReminder,
  deleteVaultReminder,
  fetchUserReminders,
  setVaultReminderStatus,
} from "@/api/reminders";
import { getCurrentVaultUser } from "@/api/user";
import { formatSupabaseError } from "@/lib/supabaseErrors";
import { useVaultToast } from "@/hooks/use-vault-toast";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  addReminder,
  removeReminder,
  replaceReminder,
  setReminders,
} from "@/store/slices/remindersSlice";
import type { ReminderStatus, VaultReminder } from "@/types/reminders";
import {
  getPageSlice,
  getShowingRange,
  getTotalPages,
} from "@/utils/pagination";

type ActiveTab = ReminderStatus;

const REMINDERS_TAB_STORAGE_KEY = "vault-reminders-active-tab";
const REMINDERS_PAGE_SIZE_STORAGE_KEY = "vault-reminders-page-size";

const REMINDER_PAGE_SIZE_VALUES = ["5", "10", "30", "60"] as const;

const isActiveTab = (value: string | null): value is ActiveTab =>
  value === "upcoming" || value === "completed" || value === "dismissed";

const readStoredActiveTab = (): ActiveTab => {
  if (typeof window === "undefined") {
    return "upcoming";
  }
  const stored = sessionStorage.getItem(REMINDERS_TAB_STORAGE_KEY);
  return isActiveTab(stored) ? stored : "upcoming";
};

const readStoredPageSize = (): string => {
  if (typeof window === "undefined") {
    return "10";
  }
  const stored = sessionStorage.getItem(REMINDERS_PAGE_SIZE_STORAGE_KEY);
  return REMINDER_PAGE_SIZE_VALUES.includes(
    stored as (typeof REMINDER_PAGE_SIZE_VALUES)[number],
  )
    ? (stored as string)
    : "10";
};

const ACTION_PROCESSING_HOLD_MS = 700;
const ACTION_MODAL_CLOSE_MS = 280;

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

export const useReminders = () => {
  const dispatch = useAppDispatch();
  const reminders = useAppSelector((state) => state.reminders);
  const [isLoading, setIsLoading] = useState(
    () => reminders.length === 0,
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTabState] = useState<ActiveTab>(readStoredActiveTab);
  const activeTabRef = useRef<ActiveTab>(activeTab);
  const setActiveTab = useCallback((tab: ActiveTab) => {
    activeTabRef.current = tab;
    setActiveTabState(tab);
    sessionStorage.setItem(REMINDERS_TAB_STORAGE_KEY, tab);
  }, []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<VaultReminder | null>(
    null,
  );
  const [actionTarget, setActionTarget] = useState<VaultReminder | null>(null);
  const [actionVariant, setActionVariant] =
    useState<ReminderActionVariant | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isActionClosing, setIsActionClosing] = useState(false);
  const { toastMessage, toastVariant, setToastMessage, showToastError } =
    useVaultToast();
  const [pageSize, setPageSizeState] = useState(readStoredPageSize);
  const [currentPage, setCurrentPage] = useState(1);

  const handlePageSizeChange = useCallback((value: string) => {
    setPageSizeState(value);
    setCurrentPage(1);
    sessionStorage.setItem(REMINDERS_PAGE_SIZE_STORAGE_KEY, value);
  }, []);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  const loadReminders = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setIsLoading(true);
    }
    setLoadError(null);
    try {
      const user = await getCurrentVaultUser();
      if (!user) {
        return;
      }
      const rows = await fetchUserReminders(user.id);
      dispatch(setReminders(rows));
    } catch (error) {
      console.error("Failed to load reminders:", error);
      setLoadError(
        error instanceof Error ? error.message : "Could not load reminders.",
      );
      dispatch(setReminders([]));
    } finally {
      if (!options?.silent) {
        setIsLoading(false);
      }
    }
  }, [dispatch]);

  useEffect(() => {
    void loadReminders({ silent: reminders.length > 0 });
  }, [loadReminders]);

  const counts = useMemo(
    () => ({
      upcoming: reminders.filter((item) => item.status === "upcoming").length,
      completed: reminders.filter((item) => item.status === "completed")
        .length,
      dismissed: reminders.filter((item) => item.status === "dismissed")
        .length,
    }),
    [reminders],
  );

  const tabReminders = useMemo(
    () => reminders.filter((item) => item.status === activeTab),
    [reminders, activeTab],
  );

  const parsedPageSize = Number(pageSize) || 10;
  const totalTabPages = getTotalPages(tabReminders.length, parsedPageSize);

  const paginatedTabReminders = useMemo(
    () => getPageSlice(tabReminders, currentPage, parsedPageSize),
    [tabReminders, currentPage, parsedPageSize],
  );

  const showingRange = useMemo(
    () => getShowingRange(currentPage, parsedPageSize, tabReminders.length),
    [currentPage, parsedPageSize, tabReminders.length],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  useEffect(() => {
    if (currentPage > totalTabPages) {
      setCurrentPage(totalTabPages);
    }
  }, [currentPage, totalTabPages]);

  const hasAnyReminders = reminders.length > 0;

  const openCreate = () => {
    setEditingReminder(null);
    setIsModalOpen(true);
  };

  const openEdit = (reminder: VaultReminder) => {
    setEditingReminder(reminder);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingReminder(null);
  };

  const openAction = (
    reminder: VaultReminder,
    variant: ReminderActionVariant,
  ) => {
    setActionTarget(reminder);
    setActionVariant(variant);
  };

  const closeAction = () => {
    setActionTarget(null);
    setActionVariant(null);
  };

  const confirmAction = async () => {
    if (
      !actionTarget ||
      !actionVariant ||
      isActionLoading ||
      isActionClosing
    ) {
      return;
    }

    setIsActionLoading(true);
    let successMessage: string | null = null;
    const tabBeforeAction = activeTabRef.current;

    try {
      const user = await getCurrentVaultUser();
      if (!user) {
        return;
      }

      if (actionVariant === "delete") {
        await deleteVaultReminder(user.id, actionTarget.id);
        dispatch(removeReminder(actionTarget.id));
        successMessage = "Reminder deleted successfully";
      } else if (actionVariant === "dismiss") {
        const updated = await setVaultReminderStatus(
          user.id,
          actionTarget.id,
          "dismissed",
        );
        dispatch(replaceReminder(updated));
        successMessage = "Reminder dismissed successfully";
      } else if (actionVariant === "complete") {
        const { completed, next } = await completeVaultReminder(
          user.id,
          actionTarget,
        );
        dispatch(replaceReminder(completed));
        if (next) {
          dispatch(addReminder(next));
        }
        successMessage = next
          ? "Reminder completed — next occurrence scheduled"
          : "Reminder marked as completed";
      } else if (actionVariant === "restore") {
        const updated = await setVaultReminderStatus(
          user.id,
          actionTarget.id,
          "upcoming",
        );
        dispatch(replaceReminder(updated));
        successMessage = "Reminder restored successfully";
      }

      if (!successMessage) {
        return;
      }

      await wait(ACTION_PROCESSING_HOLD_MS);

      setIsActionClosing(true);
      await wait(ACTION_MODAL_CLOSE_MS);

      closeAction();
      setToastMessage(successMessage);
      setActiveTab(tabBeforeAction);
    } catch (error) {
      console.error("Reminder action failed:", error);
      showToastError(formatSupabaseError(error));
    } finally {
      setIsActionLoading(false);
      setIsActionClosing(false);
    }
  };

  return {
    isLoading,
    loadError,
    activeTab,
    setActiveTab,
    isModalOpen,
    editingReminder,
    actionTarget,
    actionVariant,
    isActionLoading,
    isActionClosing,
    toastMessage,
    toastVariant,
    setToastMessage,
    pageSize,
    currentPage,
    setCurrentPage,
    handlePageSizeChange,
    counts,
    tabReminders,
    totalTabPages,
    paginatedTabReminders,
    showingRange,
    hasAnyReminders,
    openCreate,
    openEdit,
    closeModal,
    openAction,
    closeAction,
    confirmAction,
  };
};
