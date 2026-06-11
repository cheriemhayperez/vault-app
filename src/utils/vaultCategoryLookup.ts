import type { Transaction } from "@/types/financial";
import type { VaultCategoryRow } from "@/types/categories";

export interface VaultCategoryLookup {
  byId: Map<string, VaultCategoryRow>;
  byName: Map<string, VaultCategoryRow>;
}

export const buildCategoryLookup = (
  categories: VaultCategoryRow[],
): VaultCategoryLookup => {
  const byId = new Map<string, VaultCategoryRow>();
  const byName = new Map<string, VaultCategoryRow>();

  for (const category of categories) {
    byId.set(category.id, category);
    byName.set(category.name.trim().toLowerCase(), category);
  }

  return { byId, byName };
};

export const resolvePayCategoryId = (
  transaction: Transaction,
  lookup: VaultCategoryLookup,
): string | null => {
  if (transaction.categoryId && lookup.byId.has(transaction.categoryId)) {
    return transaction.categoryId;
  }

  if (transaction.recordCategory?.trim()) {
    const match = lookup.byName.get(
      transaction.recordCategory.trim().toLowerCase(),
    );
    if (match) {
      return match.id;
    }
  }

  return null;
};

export const resolveExpenseCategoryId = (
  transaction: Transaction,
  lookup: VaultCategoryLookup,
): string | null => {
  if (transaction.categoryId && lookup.byId.has(transaction.categoryId)) {
    return transaction.categoryId;
  }

  if (transaction.budgetCategoryId && lookup.byId.has(transaction.budgetCategoryId)) {
    return transaction.budgetCategoryId;
  }

  return null;
};
