"use client";

import { useMemo, useState } from "react";

import { useDashboardPeriod } from "@/contexts/dashboard-period-context";
import { useVaultPreferences } from "@/contexts/vault-preferences-context";
import { useBudgetCategoriesForPeriod } from "@/features/budget/hooks/use-budget-categories-for-period";
import { deleteBudgetCategory } from "@/api/categories";
import { useConfirmVaultDelete } from "@/hooks/use-confirm-vault-delete";
import { useAppDispatch, useAppSelector } from "@/store";
import { removeBudgetCategory } from "@/store/slices/budgetCategoriesSlice";
import type { BudgetExpenseCategory } from "@/types/budgetCategories";
import type { BudgetCategory, Transaction } from "@/types/financial";
import { computePayMetrics } from "@/utils/dashboardMetrics";
import { isBudgetLedgerTransaction } from "@/utils/payRecords";
import { computeBudgetAllocationsFromSplit } from "@/utils/philippineDeductions";
import {
  filterTransactionsByPeriod,
  getPeriodDisplayLabel,
  isTransactionInPeriod,
  type DashboardPeriodFilter,
} from "@/utils/periodFilter";

const BUDGET_CATEGORIES: BudgetCategory[] = ["NEEDS", "WANTS", "SAVINGS"];

const getCategorySpend = (
  transactions: Transaction[],
  category: BudgetCategory,
  filter: DashboardPeriodFilter,
): number =>
  transactions.reduce((sum, transaction) => {
    if (
      !isBudgetLedgerTransaction(transaction) ||
      transaction.category !== category ||
      !isTransactionInPeriod(transaction, filter)
    ) {
      return sum;
    }
    return transaction.direction === "DEBIT"
      ? sum + transaction.amount
      : Math.max(0, sum - transaction.amount);
  }, 0);

export const useBudget = () => {
  const dispatch = useAppDispatch();
  const { filter } = useDashboardPeriod();
  const { formatMoneyFixed, formatMoneySigned } = useVaultPreferences();
  const { transactions, budgetSplitPercentages } = useAppSelector(
    (state) => state.financial,
  );
  const budgetCategories = useBudgetCategoriesForPeriod();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [collapsedBuckets, setCollapsedBuckets] = useState<
    Record<BudgetCategory, boolean>
  >({
    NEEDS: false,
    WANTS: false,
    SAVINGS: false,
  });
  const [addCategoryBucket, setAddCategoryBucket] =
    useState<BudgetCategory | null>(null);
  const [editingCategory, setEditingCategory] =
    useState<BudgetExpenseCategory | null>(null);
  const [activeMobileBucket, setActiveMobileBucket] =
    useState<BudgetCategory>("NEEDS");

  const {
    deletingItem: deletingCategory,
    setDeletingItem: setDeletingCategory,
    isDeleting: isDeletingCategory,
    confirmDelete: confirmDeleteCategory,
    toastMessage,
    toastVariant,
    setToastMessage,
  } = useConfirmVaultDelete<BudgetExpenseCategory>({
    deleteFn: (category, userId) => deleteBudgetCategory(userId, category.id),
    onDeleted: (category) =>
      dispatch(
        removeBudgetCategory({
          id: category.id,
          bucket: category.bucket,
        }),
      ),
    successMessage: "Budget category deleted successfully",
  });

  const spendByCategory = useMemo(
    () =>
      BUDGET_CATEGORIES.reduce<Record<BudgetCategory, number>>(
        (accumulator, category) => ({
          ...accumulator,
          [category]: getCategorySpend(transactions, category, filter),
        }),
        { NEEDS: 0, WANTS: 0, SAVINGS: 0 },
      ),
    [transactions, filter],
  );

  const periodBudget = useMemo(() => {
    const filteredTransactions = filterTransactionsByPeriod(
      transactions,
      filter,
    );
    const rawNetPay = computePayMetrics(filteredTransactions).netPay;

    return {
      rawNetPay,
      netPay: Math.max(0, rawNetPay),
      label: getPeriodDisplayLabel(filter),
      bucketAllocations: computeBudgetAllocationsFromSplit(
        Math.max(0, rawNetPay),
        budgetSplitPercentages,
      ),
    };
  }, [transactions, filter, budgetSplitPercentages]);

  const isNetPayNegative = periodBudget.rawNetPay < 0;

  const openAddCategory = (bucket: BudgetCategory) => {
    setEditingCategory(null);
    setAddCategoryBucket(bucket);
  };

  const openEditCategory = (category: BudgetExpenseCategory) => {
    setEditingCategory(category);
    setAddCategoryBucket(category.bucket);
  };

  const closeCategoryModal = () => {
    setAddCategoryBucket(null);
    setEditingCategory(null);
  };

  const toggleBucket = (bucket: BudgetCategory) => {
    setCollapsedBuckets((previous) => ({
      ...previous,
      [bucket]: !previous[bucket],
    }));
  };

  const focusMobileBucket = (bucket: BudgetCategory) => {
    setActiveMobileBucket(bucket);
  };

  return {
    filter,
    formatMoneyFixed,
    formatMoneySigned,
    budgetSplitPercentages,
    budgetCategories,
    isSettingsOpen,
    setIsSettingsOpen,
    deletingCategory,
    setDeletingCategory,
    isDeletingCategory,
    collapsedBuckets,
    addCategoryBucket,
    editingCategory,
    activeMobileBucket,
    setActiveMobileBucket,
    spendByCategory,
    periodBudget,
    isNetPayNegative,
    openAddCategory,
    openEditCategory,
    closeCategoryModal,
    toggleBucket,
    focusMobileBucket,
    confirmDeleteCategory,
    toastMessage,
    toastVariant,
    setToastMessage,
  };
};
