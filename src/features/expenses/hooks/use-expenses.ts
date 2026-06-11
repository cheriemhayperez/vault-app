"use client";

import { useMemo, useState } from "react";

import { useDashboardPeriod } from "@/contexts/dashboard-period-context";
import { useVaultPreferences } from "@/contexts/vault-preferences-context";
import { useBudgetCategoriesForPeriod } from "@/features/budget/hooks/use-budget-categories-for-period";
import { deleteVaultExpense } from "@/api/ledger";
import { useConfirmVaultDelete } from "@/hooks/use-confirm-vault-delete";
import { useAppDispatch, useAppSelector } from "@/store";
import { removePayRecord } from "@/store/slices/financialSlice";
import type { BudgetCategory, Transaction } from "@/types/financial";
import { computePayMetrics } from "@/utils/dashboardMetrics";
import {
  getLifestyleExpensesForPeriod,
  sumLifestyleSpendByBucketForPeriod,
  sumLifestyleSpendForPeriod,
} from "@/utils/expenseLedger";
import {
  filterTransactionsByPeriod,
  getPeriodDisplayLabel,
} from "@/utils/periodFilter";

const BUCKET_CATEGORIES = ["NEEDS", "WANTS", "SAVINGS"] as const;

export const useExpenses = () => {
  const { formatMoneyFixed, formatDate } = useVaultPreferences();
  const dispatch = useAppDispatch();
  const { filter } = useDashboardPeriod();
  const { transactions } = useAppSelector((state) => state.financial);
  const budgetCategories = useBudgetCategoriesForPeriod();
  const [addBucket, setAddBucket] = useState<BudgetCategory | null>(null);
  const [editingExpense, setEditingExpense] = useState<Transaction | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [activeMobileBucket, setActiveMobileBucket] =
    useState<BudgetCategory>("NEEDS");

  const {
    deletingItem: deletingExpense,
    setDeletingItem: setDeletingExpense,
    isDeleting: isDeletingExpense,
    confirmDelete: confirmDeleteExpense,
    toastMessage,
    toastVariant,
    setToastMessage,
  } = useConfirmVaultDelete<Transaction>({
    deleteFn: (expense, userId) => deleteVaultExpense(expense.id, userId),
    onDeleted: (expense) => dispatch(removePayRecord(expense.id)),
    successMessage: "Expense deleted successfully",
  });

  const periodLabel = useMemo(() => getPeriodDisplayLabel(filter), [filter]);

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const bucket of BUCKET_CATEGORIES) {
      for (const category of budgetCategories[bucket]) {
        map.set(category.id, category.name);
      }
    }
    return map;
  }, [budgetCategories]);

  const expensesByBucket = useMemo(
    () =>
      BUCKET_CATEGORIES.reduce<Record<BudgetCategory, Transaction[]>>(
        (accumulator, category) => ({
          ...accumulator,
          [category]: getLifestyleExpensesForPeriod(transactions, filter)
            .filter((transaction) => transaction.category === category)
            .sort(
              (a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime(),
            ),
        }),
        { NEEDS: [], WANTS: [], SAVINGS: [] },
      ),
    [transactions, filter],
  );

  const monthExpenses = useMemo(
    () =>
      [...getLifestyleExpensesForPeriod(transactions, filter)].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      ),
    [transactions, filter],
  );

  const totalSpentMonth = useMemo(
    () => sumLifestyleSpendForPeriod(transactions, filter),
    [transactions, filter],
  );

  const netPayMonth = useMemo(
    () =>
      computePayMetrics(filterTransactionsByPeriod(transactions, filter)).netPay,
    [transactions, filter],
  );

  const remainingCash = useMemo(
    () => Math.max(0, netPayMonth - totalSpentMonth),
    [netPayMonth, totalSpentMonth],
  );

  const spendByBucket = useMemo(
    () =>
      BUCKET_CATEGORIES.reduce<Record<BudgetCategory, number>>(
        (accumulator, category) => ({
          ...accumulator,
          [category]: sumLifestyleSpendByBucketForPeriod(
            transactions,
            category,
            filter,
          ),
        }),
        { NEEDS: 0, WANTS: 0, SAVINGS: 0 },
      ),
    [transactions, filter],
  );

  const closeModal = () => {
    setAddBucket(null);
    setEditingExpense(null);
  };

  const openAdd = (bucket: BudgetCategory) => {
    setEditingExpense(null);
    setAddBucket(bucket);
  };

  const openEdit = (expense: Transaction) => {
    setEditingExpense(expense);
    setAddBucket(expense.category);
  };

  const openDeleteExpense = (expense: Transaction) => {
    setOpenMenuId(null);
    setDeletingExpense(expense);
  };

  return {
    formatMoneyFixed,
    formatDate,
    budgetCategories,
    addBucket,
    editingExpense,
    openMenuId,
    setOpenMenuId,
    activeMobileBucket,
    setActiveMobileBucket,
    periodLabel,
    categoryNameById,
    expensesByBucket,
    monthExpenses,
    totalSpentMonth,
    remainingCash,
    spendByBucket,
    closeModal,
    openAdd,
    openEdit,
    deletingExpense,
    setDeletingExpense,
    isDeletingExpense,
    openDeleteExpense,
    confirmDeleteExpense,
    toastMessage,
    toastVariant,
    setToastMessage,
  };
};
