import type { Transaction } from "@/types/financial";
import type {
  VaultPayRecordMetadata,
  VaultPayRecordRow,
  VaultPayRecordType,
} from "@/types/records";
import { throwTableError } from "@/lib/supabaseErrors";
import { UNCATEGORIZED_CATEGORY } from "@/utils/payRecords";
import { isSupabaseUuid, requireSupabaseUuidForDelete } from "@/utils/supabaseIds";
import {
  buildCategoryLookup,
  resolvePayCategoryId,
  type VaultCategoryLookup,
} from "@/utils/vaultCategoryLookup";
import type { VaultCategoryRow } from "@/types/categories";
import { supabase } from "@/lib/supabaseClient";

export type {
  VaultPayRecordMetadata,
  VaultPayRecordRow,
  VaultPayRecordType,
} from "@/types/records";

const RECORDS_TABLE = "records";

const parseMetadata = (value: unknown): VaultPayRecordMetadata => {
  if (!value || typeof value !== "object") {
    return {};
  }
  return value as VaultPayRecordMetadata;
};

export const payRowToTransaction = (
  row: VaultPayRecordRow,
  lookup: VaultCategoryLookup,
): Transaction => {
  const metadata = parseMetadata(row.metadata);
  const timestamp =
    metadata.timestamp ?? row.created_at ?? new Date().toISOString();
  const status = metadata.status ?? "COMPLETED";
  const categoryRow = row.category_id
    ? lookup.byId.get(row.category_id)
    : undefined;

  const direction = row.type === "deduction" ? "DEBIT" : ("CREDIT" as const);

  const categoryName = categoryRow?.name?.trim();
  const titleLabel = row.title?.trim() ?? "";
  // category_id is cleared when a pay category is deleted (ON DELETE SET NULL).
  // title keeps the old category name for history — display "Uncategorized" instead.
  const recordCategoryLabel = categoryName ?? UNCATEGORIZED_CATEGORY;
  const storedDescription = metadata.description?.trim();
  const userDescription =
    storedDescription ??
    (categoryName &&
    titleLabel.toLowerCase() === categoryName.toLowerCase()
      ? ""
      : categoryRow
        ? titleLabel
        : "");

  const transaction: Transaction = {
    id: row.id,
    timestamp,
    merchantOrLabel: userDescription,
    amount: Number(row.amount),
    category: direction === "CREDIT" ? "SAVINGS" : "NEEDS",
    direction,
    status,
    recordCategory: recordCategoryLabel,
    categoryId: row.category_id ?? undefined,
  };

  if (metadata.linkedSalaryRecordId) {
    transaction.linkedSalaryRecordId = metadata.linkedSalaryRecordId;
  }

  const linkedInvestmentId =
    row.investment_id ?? metadata.linkedInvestmentId ?? undefined;
  if (linkedInvestmentId) {
    transaction.linkedInvestmentId = linkedInvestmentId;
  }
  if (metadata.investmentTypeLabel?.trim()) {
    transaction.investmentTypeLabel = metadata.investmentTypeLabel.trim();
  }
  if (metadata.investmentName?.trim()) {
    transaction.investmentName = metadata.investmentName.trim();
  }

  return transaction;
};

export const isPayRecordTransaction = (
  transaction: Transaction,
): boolean => Boolean(transaction.recordCategory);

const resolvePayRecordType = (
  transaction: Transaction,
): VaultPayRecordType =>
  transaction.direction === "DEBIT" ? "deduction" : "income";

export const transactionToPayRecordInsert = (
  transaction: Transaction,
  userId: string,
  lookup: VaultCategoryLookup,
): Omit<VaultPayRecordRow, "id" | "created_at" | "updated_at"> => {
  const metadata: VaultPayRecordMetadata = {
    timestamp: transaction.timestamp,
    status: transaction.status,
  };

  if (transaction.linkedSalaryRecordId) {
    metadata.linkedSalaryRecordId = transaction.linkedSalaryRecordId;
  }

  if (transaction.linkedInvestmentId) {
    metadata.linkedInvestmentId = transaction.linkedInvestmentId;
  }
  if (transaction.investmentTypeLabel?.trim()) {
    metadata.investmentTypeLabel = transaction.investmentTypeLabel.trim();
  }
  if (transaction.investmentName?.trim()) {
    metadata.investmentName = transaction.investmentName.trim();
  }

  const userDescription = transaction.merchantOrLabel.trim();
  if (userDescription) {
    metadata.description = userDescription;
  }

  return {
    user_id: userId,
    title: transaction.recordCategory?.trim() || "Record",
    amount: transaction.amount,
    type: resolvePayRecordType(transaction),
    category_id: resolvePayCategoryId(transaction, lookup),
    metadata,
  };
};

export const transactionToPayRecordUpdate = (
  transaction: Transaction,
  userId: string,
  lookup: VaultCategoryLookup,
): Partial<VaultPayRecordRow> & { user_id: string } => {
  const insertShape = transactionToPayRecordInsert(transaction, userId, lookup);
  return {
    ...insertShape,
    updated_at: new Date().toISOString(),
  };
};

export const fetchUserPayRecords = async (
  userId: string,
  categories: VaultCategoryRow[],
): Promise<Transaction[]> => {
  const lookup = buildCategoryLookup(categories);

  const { data, error } = await supabase
    .from(RECORDS_TABLE)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throwTableError("records", error);
  }

  return ((data as VaultPayRecordRow[]) ?? []).map((row) =>
    payRowToTransaction(row, lookup),
  );
};

export const insertVaultRecord = async (
  transaction: Transaction,
  userId: string,
  categories: VaultCategoryRow[],
): Promise<Transaction> => {
  if (!isPayRecordTransaction(transaction)) {
    throw new Error("Pay records must include a category (recordCategory).");
  }

  const lookup = buildCategoryLookup(categories);
  const payload = transactionToPayRecordInsert(transaction, userId, lookup);
  const { data, error } = await supabase
    .from(RECORDS_TABLE)
    .insert([payload])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return payRowToTransaction(data as VaultPayRecordRow, lookup);
};

export const updateVaultRecord = async (
  transaction: Transaction,
  userId: string,
  categories: VaultCategoryRow[],
): Promise<Transaction> => {
  if (!isSupabaseUuid(transaction.id)) {
    throw new Error("Cannot update a pay record without a database id.");
  }
  if (!isPayRecordTransaction(transaction)) {
    throw new Error("Pay records must include a category (recordCategory).");
  }

  const lookup = buildCategoryLookup(categories);
  const payload = transactionToPayRecordUpdate(transaction, userId, lookup);
  const { data, error } = await supabase
    .from(RECORDS_TABLE)
    .update(payload)
    .eq("id", transaction.id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return payRowToTransaction(data as VaultPayRecordRow, lookup);
};

export const deleteVaultRecord = async (
  recordId: string,
  userId: string,
): Promise<void> => {
  requireSupabaseUuidForDelete(recordId, "Pay record");

  const { error } = await supabase
    .from(RECORDS_TABLE)
    .delete()
    .eq("id", recordId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
};
