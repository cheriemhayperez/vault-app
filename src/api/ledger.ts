import type { Transaction } from "@/types/financial";
import type { VaultCategoryRow } from "@/types/categories";
import { fetchAllUserCategories } from "@/api/categories";
import {
  deleteVaultExpense as deleteLifestyleExpense,
  fetchUserLifestyleExpenses,
  insertVaultExpense as insertLifestyleExpense,
  updateVaultExpense as updateLifestyleExpense,
} from "@/api/expenses";
import {
  deleteVaultRecord as deletePayRecord,
  fetchUserPayRecords,
  insertVaultRecord as insertPayRecord,
  updateVaultRecord as updatePayRecord,
} from "@/api/records";

/**
 * pay records (`records` table) + lifestyle expenses (`expenses` table).
 * Both are exposed as `Transaction` objects for Redux. Prefer importing from here in features.
 */

const sortByTimestampDesc = (a: Transaction, b: Transaction): number =>
  new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
export const fetchAllVaultTransactions = async (
  userId: string,
  categories: VaultCategoryRow[],
): Promise<Transaction[]> => {
  const [payRecords, lifestyleExpenses] = await Promise.all([
    fetchUserPayRecords(userId, categories),
    fetchUserLifestyleExpenses(userId, categories),
  ]);

  return [...payRecords, ...lifestyleExpenses].sort(sortByTimestampDesc);
};

export const insertVaultRecord = async (
  transaction: Transaction,
  userId: string,
): Promise<Transaction> => {
  const categories = await fetchAllUserCategories(userId);
  return insertPayRecord(transaction, userId, categories);
};

export const updateVaultRecord = async (
  transaction: Transaction,
  userId: string,
): Promise<Transaction> => {
  const categories = await fetchAllUserCategories(userId);
  return updatePayRecord(transaction, userId, categories);
};

export const deleteVaultRecord = async (
  recordId: string,
  userId: string,
): Promise<void> => deletePayRecord(recordId, userId);

export const insertVaultExpense = async (
  transaction: Transaction,
  userId: string,
): Promise<Transaction> => {
  const categories = await fetchAllUserCategories(userId);
  return insertLifestyleExpense(transaction, userId, categories);
};

export const updateVaultExpense = async (
  transaction: Transaction,
  userId: string,
): Promise<Transaction> => {
  const categories = await fetchAllUserCategories(userId);
  return updateLifestyleExpense(transaction, userId, categories);
};

export const deleteVaultExpense = async (
  expenseId: string,
  userId: string,
): Promise<void> => deleteLifestyleExpense(expenseId, userId);

/** @deprecated Use fetchAllVaultTransactions */
export const fetchUserRecords = fetchAllVaultTransactions;
