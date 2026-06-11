import type {
  BudgetCategoriesByBucket,
  BudgetCategoryColorId,
  BudgetExpenseCategory,
} from "@/types/budgetCategories";
import {
  DEFAULT_CATEGORY_COLOR,
  type PayCategory,
  type PayCategoryColorId,
  type PayCategoryKind,
} from "@/types/categories";
import type { BudgetCategory } from "@/types/financial";
import type { DashboardPeriodFilter } from "@/utils/periodFilter";
import { formatBudgetMonthlyPeriod } from "@/utils/periodFilter";

import type {
  VaultBudgetRow,
  VaultCategoryMetadata,
  VaultCategoryRow,
  VaultCategoryType,
} from "@/types/categories";

export interface PayCategoriesState {
  income: PayCategory[];
  deduction: PayCategory[];
}

export interface PayCategoryInput {
  name: string;
  kind: PayCategoryKind;
  color: PayCategoryColorId;
  defaultAmount?: number;
}

export interface BudgetCategoryInput {
  name: string;
  bucket: BudgetCategory;
  color: BudgetCategoryColorId;
  sharePercent: number;
  monthlyPeriod: string;
}

const PAY_KIND_TO_TYPE: Record<PayCategoryKind, VaultCategoryType> = {
  income: "income",
  deduction: "deduction",
};

const TYPE_TO_PAY_KIND = (type: VaultCategoryType): PayCategoryKind | null => {
  if (type === "income" || type === "deduction") {
    return type;
  }
  return null;
};

export const parseCategoryMetadata = (value: unknown): VaultCategoryMetadata => {
  if (!value || typeof value !== "object") {
    return {};
  }
  return value as VaultCategoryMetadata;
};

export const mapRowToPayCategory = (row: VaultCategoryRow): PayCategory | null => {
  const kind = TYPE_TO_PAY_KIND(row.type);
  if (!kind) {
    return null;
  }

  const metadata = parseCategoryMetadata(row.metadata);
  return {
    id: row.id,
    name: row.name,
    kind,
    color: (row.color as PayCategoryColorId) || DEFAULT_CATEGORY_COLOR,
    ...(metadata.defaultAmount !== undefined && metadata.defaultAmount > 0
      ? { defaultAmount: Number(metadata.defaultAmount) }
      : {}),
  };
};

export const mapBudgetRowToExpenseCategory = (
  category: VaultCategoryRow,
  budget: VaultBudgetRow,
): BudgetExpenseCategory | null => {
  const metadata = parseCategoryMetadata(category.metadata);
  const bucket = metadata.bucket;
  if (!bucket) {
    return null;
  }

  return {
    id: category.id,
    name: category.name,
    bucket,
    color: (category.color as BudgetCategoryColorId) || "blue",
    sharePercent: Math.min(100, Math.max(0, Number(budget.allocated_amount))),
    monthlyPeriod: budget.monthly_period,
  };
};

export const splitPayCategories = (
  rows: VaultCategoryRow[],
): PayCategoriesState => {
  const income: PayCategory[] = [];
  const deduction: PayCategory[] = [];

  for (const row of rows) {
    const category = mapRowToPayCategory(row);
    if (!category) {
      continue;
    }
    if (category.kind === "income") {
      income.push(category);
    } else {
      deduction.push(category);
    }
  }

  return { income, deduction };
};

export const joinBudgetCategories = (
  categories: VaultCategoryRow[],
  budgets: VaultBudgetRow[],
): BudgetCategoriesByBucket => {
  const buckets: BudgetCategoriesByBucket = {
    NEEDS: [],
    WANTS: [],
    SAVINGS: [],
  };

  const budgetByCategoryId = new Map(
    budgets.map((budget) => [budget.category_id, budget]),
  );

  for (const category of categories) {
    if (category.type !== "expense") {
      continue;
    }
    const budget = budgetByCategoryId.get(category.id);
    if (!budget) {
      continue;
    }
    const expenseCategory = mapBudgetRowToExpenseCategory(category, budget);
    if (!expenseCategory) {
      continue;
    }
    buckets[expenseCategory.bucket].push(expenseCategory);
  }

  return buckets;
};

export const buildPayCategoryMetadata = (
  input: PayCategoryInput,
): VaultCategoryMetadata => {
  const metadata: VaultCategoryMetadata = {};
  if (input.defaultAmount !== undefined && input.defaultAmount > 0) {
    metadata.defaultAmount = input.defaultAmount;
  }
  return metadata;
};

export const payKindToVaultType = (
  kind: PayCategoryKind,
): VaultCategoryType => PAY_KIND_TO_TYPE[kind];

export const clampSharePercent = (sharePercent: number): number =>
  Math.min(100, Math.max(0, sharePercent));

export const resolveBudgetMonthlyPeriod = (
  filter: DashboardPeriodFilter,
): string => formatBudgetMonthlyPeriod(filter.year, filter.month);

export const findCategoryNameById = (
  categoryId: string | undefined,
  payCategories: PayCategoriesState,
  budgetCategories: BudgetCategoriesByBucket,
): string | undefined => {
  if (!categoryId?.trim()) {
    return undefined;
  }

  const payMatch = [...payCategories.income, ...payCategories.deduction].find(
    (category) => category.id === categoryId,
  );
  if (payMatch) {
    return payMatch.name;
  }

  for (const bucket of ["NEEDS", "WANTS", "SAVINGS"] as const) {
    const budgetMatch = budgetCategories[bucket].find(
      (category) => category.id === categoryId,
    );
    if (budgetMatch) {
      return budgetMatch.name;
    }
  }

  return undefined;
};
