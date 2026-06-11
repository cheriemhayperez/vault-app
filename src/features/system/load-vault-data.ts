import {
  fetchAllUserCategories,
  fetchUserBudgetCategoriesForFilter,
} from "@/api/categories";
import { fetchAllVaultTransactions } from "@/api/ledger";
import { fetchUserReminders } from "@/api/reminders";
import { getCurrentVaultUser } from "@/api/user";
import {
  formatSupabaseError,
  getVaultSetupMessage,
  isTableMissingError,
} from "@/lib/supabaseErrors";
import { splitPayCategories } from "@/mappers/categories.mapper";
import type { AppDispatch } from "@/store";
import { setBudgetCategories } from "@/store/slices/budgetCategoriesSlice";
import { setCategories } from "@/store/slices/categoriesSlice";
import { setTransactions } from "@/store/slices/financialSlice";
import { setReminders } from "@/store/slices/remindersSlice";
import {
  buildPeriodFilter,
  getDefaultPeriodState,
} from "@/utils/periodFilter";

const LOAD_TIMEOUT_MS = 12_000;

const withTimeout = async <T,>(promise: Promise<T>, label: string): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${label} timed out after ${LOAD_TIMEOUT_MS}ms`));
    }, LOAD_TIMEOUT_MS);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
};

export type LoadVaultDataResult =
  | { ok: true }
  | { ok: false; message: string; isSetupError: boolean };

export const loadVaultData = async (
  dispatch: AppDispatch,
): Promise<LoadVaultDataResult> => {
  try {
    const user = await withTimeout(getCurrentVaultUser(), "Auth session");
    if (!user) {
      return { ok: false, message: "You must be signed in to sync records.", isSetupError: false };
    }

    const allCategories = await withTimeout(
      fetchAllUserCategories(user.id),
      "Categories",
    );
    const payCategories = splitPayCategories(allCategories);

    const defaultFilter = buildPeriodFilter(getDefaultPeriodState());

    const [transactions, budgetCategories, remindersResult] = await withTimeout(
      Promise.all([
        fetchAllVaultTransactions(user.id, allCategories),
        fetchUserBudgetCategoriesForFilter(user.id, defaultFilter),
        fetchUserReminders(user.id).catch((error) => {
          if (isTableMissingError(error)) {
            return [];
          }
          throw error;
        }),
      ]),
      "Vault records",
    );

    dispatch(setTransactions(transactions));
    dispatch(setCategories(payCategories));
    dispatch(setBudgetCategories(budgetCategories));
    dispatch(setReminders(remindersResult));

    return { ok: true };
  } catch (error) {
    const message = formatSupabaseError(error);
    console.error("Failed to load Vault data:", message);

    if (isTableMissingError(error)) {
      const setupMessage = getVaultSetupMessage();
      dispatch(setTransactions([]));
      dispatch(setCategories({ income: [], deduction: [] }));
      dispatch(setBudgetCategories({ NEEDS: [], WANTS: [], SAVINGS: [] }));
      dispatch(setReminders([]));
      return { ok: false, message: setupMessage, isSetupError: true };
    }

    // Keep the last synced Redux state on transient errors (network, timeout, etc.)
    return { ok: false, message, isSetupError: false };
  }
};
