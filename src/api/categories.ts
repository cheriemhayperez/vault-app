import {
  DEFAULT_BUDGET_PERIOD,
  type VaultBudgetRow,
  type VaultCategoryRow,
} from "@/types/categories";
import { throwTableError } from "@/lib/supabaseErrors";
import { supabase } from "@/lib/supabaseClient";
import {
  buildPayCategoryMetadata,
  clampSharePercent,
  joinBudgetCategories,
  mapBudgetRowToExpenseCategory,
  mapRowToPayCategory,
  payKindToVaultType,
  splitPayCategories,
  type BudgetCategoryInput,
  type PayCategoriesState,
  type PayCategoryInput,
} from "@/mappers/categories.mapper";
import type {
  BudgetCategoriesByBucket,
  BudgetExpenseCategory,
} from "@/types/budgetCategories";
import type { PayCategory } from "@/types/categories";
import type { DashboardPeriodFilter } from "@/utils/periodFilter";
import { getBudgetMonthlyPeriodKeys } from "@/utils/periodFilter";

export type {
  VaultBudgetRow,
  VaultCategoryMetadata,
  VaultCategoryRow,
  VaultCategoryType,
} from "@/types/categories";
export { DEFAULT_BUDGET_PERIOD } from "@/types/categories";
export {
  findCategoryNameById,
  joinBudgetCategories,
  resolveBudgetMonthlyPeriod,
  splitPayCategories,
  type BudgetCategoryInput,
  type PayCategoriesState,
  type PayCategoryInput,
} from "@/mappers/categories.mapper";

export const fetchAllUserCategories = async (
  userId: string,
): Promise<VaultCategoryRow[]> => {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    throwTableError("categories", error);
  }

  return (data as VaultCategoryRow[]) ?? [];
};

export const fetchUserPayCategories = async (
  userId: string,
): Promise<PayCategoriesState> => {
  const rows = await fetchAllUserCategories(userId);
  return splitPayCategories(rows);
};

export const fetchUserBudgetCategoryRows = async (
  userId: string,
  monthlyPeriods: string[],
): Promise<{
  categories: VaultCategoryRow[];
  budgets: VaultBudgetRow[];
}> => {
  const periods =
    monthlyPeriods.length > 0 ? monthlyPeriods : [DEFAULT_BUDGET_PERIOD];

  const [categoriesResult, budgetsResult] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .eq("user_id", userId)
      .eq("type", "expense")
      .order("created_at", { ascending: true }),
    supabase
      .from("budgets")
      .select("*")
      .eq("user_id", userId)
      .in("monthly_period", periods)
      .order("created_at", { ascending: true }),
  ]);

  if (categoriesResult.error) {
    throwTableError("categories", categoriesResult.error);
  }
  if (budgetsResult.error) {
    throwTableError("budgets", budgetsResult.error);
  }

  return {
    categories: (categoriesResult.data as VaultCategoryRow[]) ?? [],
    budgets: (budgetsResult.data as VaultBudgetRow[]) ?? [],
  };
};

export const fetchUserBudgetCategories = async (
  userId: string,
  monthlyPeriod: string,
): Promise<BudgetCategoriesByBucket> => {
  const { categories, budgets } = await fetchUserBudgetCategoryRows(userId, [
    monthlyPeriod,
  ]);
  return joinBudgetCategories(categories, budgets);
};

export const fetchUserBudgetCategoriesForFilter = async (
  userId: string,
  filter: DashboardPeriodFilter,
): Promise<BudgetCategoriesByBucket> => {
  const periods = getBudgetMonthlyPeriodKeys(filter);
  const { categories, budgets } = await fetchUserBudgetCategoryRows(
    userId,
    periods,
  );
  return joinBudgetCategories(categories, budgets);
};

export const insertPayCategory = async (
  userId: string,
  input: PayCategoryInput,
): Promise<PayCategory> => {
  const { data, error } = await supabase
    .from("categories")
    .insert([
      {
        user_id: userId,
        name: input.name.trim(),
        color: input.color,
        type: payKindToVaultType(input.kind),
        metadata: buildPayCategoryMetadata(input),
      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  const category = mapRowToPayCategory(data as VaultCategoryRow);
  if (!category) {
    throw new Error("Failed to map inserted pay category.");
  }
  return category;
};

export const updatePayCategory = async (
  userId: string,
  id: string,
  input: PayCategoryInput,
): Promise<PayCategory> => {
  const { data, error } = await supabase
    .from("categories")
    .update({
      name: input.name.trim(),
      color: input.color,
      type: payKindToVaultType(input.kind),
      metadata: buildPayCategoryMetadata(input),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  const category = mapRowToPayCategory(data as VaultCategoryRow);
  if (!category) {
    throw new Error("Failed to map updated pay category.");
  }
  return category;
};

export const deletePayCategory = async (
  userId: string,
  categoryId: string,
): Promise<void> => {
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
};

export const insertBudgetCategory = async (
  userId: string,
  input: BudgetCategoryInput,
): Promise<BudgetExpenseCategory> => {
  const sharePercent = clampSharePercent(input.sharePercent);

  const { data: categoryRow, error: categoryError } = await supabase
    .from("categories")
    .insert([
      {
        user_id: userId,
        name: input.name.trim(),
        color: input.color,
        type: "expense",
        metadata: { bucket: input.bucket },
      },
    ])
    .select()
    .single();

  if (categoryError) {
    throw categoryError;
  }

  const { data: budgetRow, error: budgetError } = await supabase
    .from("budgets")
    .insert([
      {
        user_id: userId,
        category_id: (categoryRow as VaultCategoryRow).id,
        allocated_amount: sharePercent,
        monthly_period: input.monthlyPeriod,
      },
    ])
    .select()
    .single();

  if (budgetError) {
    await supabase
      .from("categories")
      .delete()
      .eq("id", (categoryRow as VaultCategoryRow).id);
    throw budgetError;
  }

  const mapped = mapBudgetRowToExpenseCategory(
    categoryRow as VaultCategoryRow,
    budgetRow as VaultBudgetRow,
  );
  if (!mapped) {
    throw new Error("Failed to map inserted budget category.");
  }
  return mapped;
};

export const updateBudgetCategory = async (
  userId: string,
  categoryId: string,
  input: BudgetCategoryInput,
): Promise<BudgetExpenseCategory> => {
  const sharePercent = clampSharePercent(input.sharePercent);

  const { data: categoryRow, error: categoryError } = await supabase
    .from("categories")
    .update({
      name: input.name.trim(),
      color: input.color,
      metadata: { bucket: input.bucket },
      updated_at: new Date().toISOString(),
    })
    .eq("id", categoryId)
    .eq("user_id", userId)
    .select()
    .single();

  if (categoryError) {
    throw categoryError;
  }

  const { data: budgetRow, error: budgetError } = await supabase
    .from("budgets")
    .update({
      allocated_amount: sharePercent,
      updated_at: new Date().toISOString(),
    })
    .eq("category_id", categoryId)
    .eq("user_id", userId)
    .eq("monthly_period", input.monthlyPeriod)
    .select()
    .single();

  if (budgetError) {
    throw budgetError;
  }

  const mapped = mapBudgetRowToExpenseCategory(
    categoryRow as VaultCategoryRow,
    budgetRow as VaultBudgetRow,
  );
  if (!mapped) {
    throw new Error("Failed to map updated budget category.");
  }
  return mapped;
};

export const deleteBudgetCategory = async (
  userId: string,
  categoryId: string,
): Promise<void> => {
  // Removes the category and all of its budget rows across every monthly_period.
  const { error: budgetError } = await supabase
    .from("budgets")
    .delete()
    .eq("category_id", categoryId)
    .eq("user_id", userId);

  if (budgetError) {
    throw budgetError;
  }

  const { error: categoryError } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId)
    .eq("user_id", userId);

  if (categoryError) {
    throw categoryError;
  }
};
