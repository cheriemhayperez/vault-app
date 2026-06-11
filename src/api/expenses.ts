import type { BudgetCategory, Transaction } from "@/types/financial";
import type {
  VaultLifestyleExpenseMetadata,
  VaultLifestyleExpenseRow,
} from "@/types/expenses";
import { throwTableError } from "@/lib/supabaseErrors";
import { isSupabaseUuid, requireSupabaseUuidForDelete } from "@/utils/supabaseIds";
import {
  buildCategoryLookup,
  resolveExpenseCategoryId,
  type VaultCategoryLookup,
} from "@/utils/vaultCategoryLookup";
import type { VaultCategoryRow } from "@/types/categories";
import { isPayRecordTransaction } from "@/api/records";
import { supabase } from "@/lib/supabaseClient";

export type {
  VaultLifestyleExpenseMetadata,
  VaultLifestyleExpenseRow,
} from "@/types/expenses";

const EXPENSES_TABLE = "expenses";

const parseMetadata = (value: unknown): VaultLifestyleExpenseMetadata => {
  if (!value || typeof value !== "object") {
    return {};
  }
  return value as VaultLifestyleExpenseMetadata;
};

const parseCategoryMetadata = (
  value: unknown,
): { bucket?: BudgetCategory } => {
  if (!value || typeof value !== "object") {
    return {};
  }
  return value as { bucket?: BudgetCategory };
};

export const expenseRowToTransaction = (
  row: VaultLifestyleExpenseRow,
  lookup: VaultCategoryLookup,
): Transaction => {
  const metadata = parseMetadata(row.metadata);
  const timestamp =
    metadata.timestamp ?? row.created_at ?? new Date().toISOString();
  const status = metadata.status ?? "COMPLETED";
  const categoryRow = row.category_id
    ? lookup.byId.get(row.category_id)
    : undefined;
  const categoryMeta = parseCategoryMetadata(categoryRow?.metadata);
  const bucket =
    metadata.bucket ?? categoryMeta.bucket ?? ("NEEDS" as BudgetCategory);

  return {
    id: row.id,
    timestamp,
    merchantOrLabel: row.title,
    amount: Number(row.amount),
    category: bucket,
    direction: "DEBIT",
    status,
    budgetCategoryId: row.category_id ?? undefined,
    categoryId: row.category_id ?? undefined,
  };
};

export const isLifestyleExpenseTransaction = (
  transaction: Transaction,
): boolean => !isPayRecordTransaction(transaction);

export const transactionToExpenseInsert = (
  transaction: Transaction,
  userId: string,
  lookup: VaultCategoryLookup,
): Omit<VaultLifestyleExpenseRow, "id" | "created_at" | "updated_at"> => ({
  user_id: userId,
  title: transaction.merchantOrLabel.trim() || "Expense",
  amount: transaction.amount,
  category_id: resolveExpenseCategoryId(transaction, lookup),
  metadata: {
    timestamp: transaction.timestamp,
    status: transaction.status,
    bucket: transaction.category,
  },
});

export const transactionToExpenseUpdate = (
  transaction: Transaction,
  userId: string,
  lookup: VaultCategoryLookup,
): Partial<VaultLifestyleExpenseRow> & { user_id: string } => {
  const insertShape = transactionToExpenseInsert(transaction, userId, lookup);
  return {
    ...insertShape,
    updated_at: new Date().toISOString(),
  };
};

export const fetchUserLifestyleExpenses = async (
  userId: string,
  categories: VaultCategoryRow[],
): Promise<Transaction[]> => {
  const lookup = buildCategoryLookup(categories);

  const { data, error } = await supabase
    .from(EXPENSES_TABLE)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throwTableError("expenses", error);
  }

  return ((data as VaultLifestyleExpenseRow[]) ?? []).map((row) =>
    expenseRowToTransaction(row, lookup),
  );
};

export const insertVaultExpense = async (
  transaction: Transaction,
  userId: string,
  categories: VaultCategoryRow[],
): Promise<Transaction> => {
  if (!isLifestyleExpenseTransaction(transaction)) {
    throw new Error("Lifestyle expenses must not use pay record categories.");
  }

  const lookup = buildCategoryLookup(categories);
  const payload = transactionToExpenseInsert(transaction, userId, lookup);
  const { data, error } = await supabase
    .from(EXPENSES_TABLE)
    .insert([payload])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return expenseRowToTransaction(data as VaultLifestyleExpenseRow, lookup);
};

export const updateVaultExpense = async (
  transaction: Transaction,
  userId: string,
  categories: VaultCategoryRow[],
): Promise<Transaction> => {
  if (!isSupabaseUuid(transaction.id)) {
    throw new Error("Cannot update an expense without a database id.");
  }
  if (!isLifestyleExpenseTransaction(transaction)) {
    throw new Error("Lifestyle expenses must not use pay record categories.");
  }

  const lookup = buildCategoryLookup(categories);
  const payload = transactionToExpenseUpdate(transaction, userId, lookup);
  const { data, error } = await supabase
    .from(EXPENSES_TABLE)
    .update(payload)
    .eq("id", transaction.id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return expenseRowToTransaction(data as VaultLifestyleExpenseRow, lookup);
};

export const deleteVaultExpense = async (
  expenseId: string,
  userId: string,
): Promise<void> => {
  requireSupabaseUuidForDelete(expenseId, "Expense");

  const { error } = await supabase
    .from(EXPENSES_TABLE)
    .delete()
    .eq("id", expenseId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
};
