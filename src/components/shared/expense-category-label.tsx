"use client";

import type { BudgetCategoriesByBucket } from "@/types/budgetCategories";
import type { BudgetCategory, Transaction } from "@/types/financial";
import {
  getExpenseCategoryColorSwatchClass,
  getExpenseCategoryLabel,
} from "@/utils/expenseLedger";

interface ExpenseCategoryLabelProps {
  expense: Transaction;
  budgetCategories: BudgetCategoriesByBucket;
  bucket: BudgetCategory;
  categoryNameById: Map<string, string>;
  className?: string;
}

export const ExpenseCategoryLabel = ({
  expense,
  budgetCategories,
  bucket,
  categoryNameById,
  className = "",
}: ExpenseCategoryLabelProps) => {
  const swatchClass = getExpenseCategoryColorSwatchClass(
    expense,
    budgetCategories,
    bucket,
  );
  const label = getExpenseCategoryLabel(expense, categoryNameById);

  return (
    <div className={`flex min-w-0 items-center gap-2 ${className}`}>
      <span
        className={`size-2 shrink-0 rounded-full ${swatchClass}`}
        aria-hidden
      />
      <span className="truncate text-sm font-semibold text-slate-900">
        {label}
      </span>
    </div>
  );
};
