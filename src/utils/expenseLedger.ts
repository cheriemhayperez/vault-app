import {
  getBudgetCategoryBadgeClassName,
  getBudgetCategoryColorSwatchClass,
  type BudgetCategoriesByBucket,
  type BudgetCategoryColorId,
  type BudgetExpenseCategory,
} from "@/types/budgetCategories";
import type { BudgetCategory, Transaction } from "@/types/financial";
import type { CategoryDistributionSlice } from "@/utils/payRecords";
import { isBudgetLedgerTransaction, UNCATEGORIZED_CATEGORY } from "@/utils/payRecords";
import {
  filterToDistributionOptions,
  isTransactionInPeriod,
  type DashboardPeriodFilter,
} from "@/utils/periodFilter";

const BUCKET_BADGE_CLASS: Record<BudgetCategory, string> = {
  NEEDS: getBudgetCategoryBadgeClassName("green"),
  WANTS: getBudgetCategoryBadgeClassName("purple"),
  SAVINGS: getBudgetCategoryBadgeClassName("green"),
};

export const findBudgetExpenseCategory = (
  budgetCategoryId: string | undefined,
  budgetCategories: BudgetCategoriesByBucket,
): BudgetExpenseCategory | undefined => {
  if (!budgetCategoryId) {
    return undefined;
  }

  for (const bucket of ["NEEDS", "WANTS", "SAVINGS"] as BudgetCategory[]) {
    const match = budgetCategories[bucket].find(
      (item) => item.id === budgetCategoryId,
    );
    if (match) {
      return match;
    }
  }

  return undefined;
};

const BUCKET_COLOR: Record<BudgetCategory, BudgetCategoryColorId> = {
  NEEDS: "green",
  WANTS: "purple",
  SAVINGS: "green",
};

export const getExpenseCategoryColorSwatchClass = (
  expense: Transaction,
  budgetCategories: BudgetCategoriesByBucket,
  bucket: BudgetCategory,
): string => {
  const matched = findBudgetExpenseCategory(
    expense.budgetCategoryId,
    budgetCategories,
  );
  return getBudgetCategoryColorSwatchClass(
    matched?.color ?? BUCKET_COLOR[bucket],
  );
};

/** Pill badge classes matching budget sub-category colors (like pay record badges). */
export const getExpenseCategoryBadgeClassName = (
  expense: Transaction,
  budgetCategories: BudgetCategoriesByBucket,
  bucket: BudgetCategory,
): string => {
  const matched = findBudgetExpenseCategory(
    expense.budgetCategoryId,
    budgetCategories,
  );
  if (matched) {
    return getBudgetCategoryBadgeClassName(matched.color);
  }
  return BUCKET_BADGE_CLASS[bucket];
};

export interface ExpenseMonthPeriod {
  year: number;
  month: number;
}

export const getActiveExpenseMonth = (): ExpenseMonthPeriod => {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
};

export const isTransactionInMonth = (
  transaction: Transaction,
  period: ExpenseMonthPeriod,
): boolean => {
  const date = new Date(transaction.timestamp);
  return (
    date.getFullYear() === period.year && date.getMonth() === period.month
  );
};

export const getLifestyleExpenses = (
  transactions: Transaction[],
  period?: ExpenseMonthPeriod,
): Transaction[] =>
  transactions.filter((transaction) => {
    if (!isBudgetLedgerTransaction(transaction)) {
      return false;
    }
    if (transaction.direction !== "DEBIT") {
      return false;
    }
    if (period && !isTransactionInMonth(transaction, period)) {
      return false;
    }
    return true;
  });

export const sumLifestyleSpend = (
  transactions: Transaction[],
  period?: ExpenseMonthPeriod,
): number =>
  getLifestyleExpenses(transactions, period).reduce(
    (sum, transaction) => sum + transaction.amount,
    0,
  );

export const sumLifestyleSpendByBucket = (
  transactions: Transaction[],
  bucket: BudgetCategory,
  period?: ExpenseMonthPeriod,
): number =>
  getLifestyleExpenses(transactions, period)
    .filter((transaction) => transaction.category === bucket)
    .reduce((sum, transaction) => sum + transaction.amount, 0);

export const sumLifestyleSpendForBudgetCategory = (
  transactions: Transaction[],
  budgetCategoryId: string,
  period?: ExpenseMonthPeriod,
): number =>
  getLifestyleExpenses(transactions, period)
    .filter((transaction) => transaction.budgetCategoryId === budgetCategoryId)
    .reduce((sum, transaction) => sum + transaction.amount, 0);

export const getExpenseCategoryLabel = (
  transaction: Transaction,
  categoryNameById: Map<string, string>,
): string => {
  if (transaction.budgetCategoryId) {
    const name = categoryNameById.get(transaction.budgetCategoryId);
    if (name) {
      return name;
    }
  }
  return transaction.merchantOrLabel?.trim() || "—";
};

export const BUCKET_DISPLAY_LABELS: Record<BudgetCategory, string> = {
  NEEDS: "Needs",
  WANTS: "Wants",
  SAVINGS: "Savings",
};

export const BUCKET_FRAMEWORK_LABELS: Record<BudgetCategory, string> = {
  NEEDS: "Essential Needs (Essential Living)",
  WANTS: "Discretionary Wants (Personal Spending)",
  SAVINGS: "Savings & Investments",
};

const EXPENSE_DISTRIBUTION_COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#3b82f6",
  "#8b5cf6",
  "#06b6d4",
  "#f43f5e",
  "#14b8a6",
];

export const buildExpenseCategoryNameMap = (
  budgetCategories: Record<BudgetCategory, { id: string; name: string }[]>,
): Map<string, string> => {
  const map = new Map<string, string>();
  for (const bucket of ["NEEDS", "WANTS", "SAVINGS"] as BudgetCategory[]) {
    for (const category of budgetCategories[bucket]) {
      map.set(category.id, category.name);
    }
  }
  return map;
};

export const aggregateExpenseDistribution = (
  transactions: Transaction[],
  categoryNameById: Map<string, string>,
  period?: ExpenseMonthPeriod,
): CategoryDistributionSlice[] => {
  const totals = new Map<string, number>();

  for (const transaction of getLifestyleExpenses(transactions, period)) {
    const label = getExpenseCategoryLabel(transaction, categoryNameById);
    const key = label === "—" ? UNCATEGORIZED_CATEGORY : label;
    totals.set(key, (totals.get(key) ?? 0) + transaction.amount);
  }

  const grandTotal = [...totals.values()].reduce((sum, value) => sum + value, 0);
  if (grandTotal <= 0) {
    return [];
  }

  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, amount], index) => ({
      name,
      amount,
      percent: (amount / grandTotal) * 100,
      color:
        name === UNCATEGORIZED_CATEGORY
          ? "#94a3b8"
          : EXPENSE_DISTRIBUTION_COLORS[index % EXPENSE_DISTRIBUTION_COLORS.length],
    }));
};

export const getLifestyleExpensesForPeriod = (
  transactions: Transaction[],
  filter: DashboardPeriodFilter,
): Transaction[] =>
  getLifestyleExpenses(transactions).filter((transaction) =>
    isTransactionInPeriod(transaction, filter),
  );

export const sumLifestyleSpendForPeriod = (
  transactions: Transaction[],
  filter: DashboardPeriodFilter,
): number =>
  getLifestyleExpensesForPeriod(transactions, filter).reduce(
    (sum, transaction) => sum + transaction.amount,
    0,
  );

export const sumLifestyleSpendByBucketForPeriod = (
  transactions: Transaction[],
  bucket: BudgetCategory,
  filter: DashboardPeriodFilter,
): number =>
  getLifestyleExpensesForPeriod(transactions, filter)
    .filter((transaction) => transaction.category === bucket)
    .reduce((sum, transaction) => sum + transaction.amount, 0);

export const aggregateExpenseDistributionForPeriod = (
  transactions: Transaction[],
  categoryNameById: Map<string, string>,
  filter: DashboardPeriodFilter,
): CategoryDistributionSlice[] => {
  const periodOptions = filterToDistributionOptions(filter);
  const period =
    periodOptions.year !== undefined && periodOptions.month !== undefined
      ? { year: periodOptions.year, month: periodOptions.month }
      : undefined;

  if (filter.periodType === "month" && period) {
    return aggregateExpenseDistribution(transactions, categoryNameById, period);
  }

  const totals = new Map<string, number>();

  for (const transaction of getLifestyleExpensesForPeriod(
    transactions,
    filter,
  )) {
    const label = getExpenseCategoryLabel(transaction, categoryNameById);
    const key = label === "—" ? UNCATEGORIZED_CATEGORY : label;
    totals.set(key, (totals.get(key) ?? 0) + transaction.amount);
  }

  const grandTotal = [...totals.values()].reduce((sum, value) => sum + value, 0);
  if (grandTotal <= 0) {
    return [];
  }

  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, amount], index) => ({
      name,
      amount,
      percent: (amount / grandTotal) * 100,
      color:
        name === UNCATEGORIZED_CATEGORY
          ? "#94a3b8"
          : EXPENSE_DISTRIBUTION_COLORS[index % EXPENSE_DISTRIBUTION_COLORS.length],
    }));
};
