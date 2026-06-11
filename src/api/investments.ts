import { supabase } from "@/lib/supabaseClient";
import { formatSupabaseError, isTableMissingError } from "@/lib/supabaseErrors";
import type { Transaction } from "@/types/financial";
import type {
  RecordInvestmentIncomeInput,
  RecordInvestmentPayoutInput,
  VaultInvestmentRow,
} from "@/types/investments";
import { isValidInvestmentIncomeCategory } from "@/utils/investmentIncomeCategories";
import { insertVaultRecord } from "@/api/ledger";
import type {
  InvestmentReturn,
  InvestmentReturnType,
  VaultInvestment,
} from "@/types/investments";
import {
  getInvestmentTypeLabel,
} from "@/types/investments";
import { createReturnId } from "@/utils/vaultInvestments";

export type {
  RecordInvestmentIncomeInput,
  RecordInvestmentPayoutInput,
  VaultInvestmentRow,
} from "@/types/investments";

const INVESTMENTS_TABLE = "investments";

const parseReturns = (value: unknown): InvestmentReturn[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value as InvestmentReturn[];
};

const resolveInitialAmount = (row: VaultInvestmentRow): number => {
  const stored = Number(row.initial_amount ?? 0);
  if (stored > 0) {
    return stored;
  }

  const returns = parseReturns(row.returns);
  const sellProceeds = returns
    .filter((item) => item.type === "sell")
    .reduce((sum, item) => sum + item.amount, 0);

  return Number(row.amount) + sellProceeds;
};

const rowToInvestment = (row: VaultInvestmentRow): VaultInvestment => ({
  id: row.id,
  name: row.name,
  type: row.type,
  transactionType: row.transaction_type,
  amount: Number(row.amount),
  date: row.transaction_date,
  startedDate: row.started_date ?? undefined,
  notes: row.notes ?? undefined,
  parentId: row.parent_id,
  recurringReminder: row.recurring_reminder,
  reminderDuration: row.reminder_duration ?? undefined,
  returns: parseReturns(row.returns),
  initialAmount: resolveInitialAmount(row),
  totalPayouts: Number(row.total_payouts ?? 0),
});

const investmentToRow = (
  userId: string,
  investment: VaultInvestment,
): Omit<VaultInvestmentRow, "created_at" | "updated_at"> => ({
  id: investment.id,
  user_id: userId,
  name: investment.name.trim(),
  type: investment.type,
  transaction_type: investment.transactionType,
  amount: investment.amount,
  transaction_date: investment.date,
  started_date: investment.startedDate ?? null,
  notes: investment.notes?.trim() || null,
  parent_id: investment.parentId ?? null,
  recurring_reminder: Boolean(investment.recurringReminder),
  reminder_duration: investment.reminderDuration ?? null,
  returns: investment.returns,
  initial_amount: investment.initialAmount ?? investment.amount,
  total_payouts: investment.totalPayouts ?? 0,
});

export const fetchUserInvestments = async (
  userId: string,
): Promise<VaultInvestment[]> => {
  const { data, error } = await supabase
    .from(INVESTMENTS_TABLE)
    .select("*")
    .eq("user_id", userId)
    .order("transaction_date", { ascending: false });

  if (error) {
    const message = formatSupabaseError(error);
    if (isTableMissingError(error)) {
      throw new Error(
        `Could not find the public.investments table. Run supabase/investments.sql — ${message}`,
      );
    }
    throw new Error(message);
  }

  return ((data as VaultInvestmentRow[]) ?? []).map(rowToInvestment);
};

export const insertVaultInvestment = async (
  userId: string,
  investment: VaultInvestment,
): Promise<VaultInvestment> => {
  const row = investmentToRow(userId, investment);
  const { id: _ignored, ...insertRow } = row;

  const { data, error } = await supabase
    .from(INVESTMENTS_TABLE)
    .insert([insertRow])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return rowToInvestment(data as VaultInvestmentRow);
};

export const updateVaultInvestment = async (
  userId: string,
  investment: VaultInvestment,
): Promise<VaultInvestment> => {
  const row = investmentToRow(userId, investment);
  const { id: _id, user_id: _userId, ...updateRow } = row;

  const { data, error } = await supabase
    .from(INVESTMENTS_TABLE)
    .update({
      ...updateRow,
      updated_at: new Date().toISOString(),
    })
    .eq("id", investment.id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return rowToInvestment(data as VaultInvestmentRow);
};

const fetchInvestmentById = async (
  userId: string,
  investmentId: string,
): Promise<VaultInvestment> => {
  const { data, error } = await supabase
    .from(INVESTMENTS_TABLE)
    .select("*")
    .eq("id", investmentId)
    .eq("user_id", userId)
    .single();

  if (error) {
    throw error;
  }

  return rowToInvestment(data as VaultInvestmentRow);
};

export const isSellLiquidationReturnType = (
  type: InvestmentReturnType,
): boolean => type === "sell";

interface InvestmentPayoutPatch {
  amount: number;
  totalPayouts: number;
  initialAmount: number;
  returns: InvestmentReturn[];
}

/**
 * Applies payout math against the current DB balance — never overwrites amount
 * with the payout input unless the type is Sell/Liquidation.
 */
const buildInvestmentPayoutPatch = (
  current: VaultInvestment,
  input: RecordInvestmentPayoutInput,
  newReturn: InvestmentReturn,
): InvestmentPayoutPatch => {
  const isSell = isSellLiquidationReturnType(input.type);
  const currentAmount = current.amount;
  const currentTotalPayouts = current.totalPayouts ?? 0;
  const storedInitial = current.initialAmount ?? 0;
  const preservedInitial = storedInitial > 0 ? storedInitial : currentAmount;

  if (isSell && input.amount > currentAmount) {
    throw new Error("Sell/Liquidation amount cannot exceed active principal.");
  }

  const nextAmount = isSell ? currentAmount - input.amount : currentAmount;

  return {
    amount: nextAmount,
    totalPayouts: currentTotalPayouts + input.amount,
    initialAmount: preservedInitial,
    returns: [...current.returns, newReturn],
  };
};

const patchInvestmentAfterPayout = async (
  userId: string,
  investmentId: string,
  patch: InvestmentPayoutPatch,
): Promise<VaultInvestment> => {
  const { data, error } = await supabase
    .from(INVESTMENTS_TABLE)
    .update({
      amount: patch.amount,
      total_payouts: patch.totalPayouts,
      initial_amount: patch.initialAmount,
      returns: patch.returns,
      updated_at: new Date().toISOString(),
    })
    .eq("id", investmentId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return rowToInvestment(data as VaultInvestmentRow);
};

export const deleteVaultInvestment = async (
  userId: string,
  investmentId: string,
): Promise<void> => {
  const { error } = await supabase
    .from(INVESTMENTS_TABLE)
    .delete()
    .eq("id", investmentId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
};

export const migrateLocalInvestmentsToSupabase = async (
  userId: string,
  localInvestments: VaultInvestment[],
): Promise<VaultInvestment[]> => {
  if (localInvestments.length === 0) {
    return [];
  }

  const insertedIds: string[] = [];
  const idMap = new Map<string, string>();
  const ordered = [
    ...localInvestments.filter((investment) => !investment.parentId),
    ...localInvestments.filter((investment) => investment.parentId),
  ];
  const migrated: VaultInvestment[] = [];

  try {
    for (const investment of ordered) {
      const parentId = investment.parentId
        ? (idMap.get(investment.parentId) ?? null)
        : null;
      const saved = await insertVaultInvestment(userId, {
        ...investment,
        parentId,
      });
      insertedIds.push(saved.id);
      idMap.set(investment.id, saved.id);
      migrated.push(saved);
    }

    return migrated;
  } catch (error) {
    await Promise.all(
      insertedIds.map((id) =>
        deleteVaultInvestment(userId, id).catch(() => undefined),
      ),
    );
    throw error;
  }
};

const buildIncomePayRecord = (
  input: RecordInvestmentIncomeInput,
  investment: VaultInvestment,
): Transaction => {
  const [year, month, day] = input.date.split("-").map(Number);
  const recordTimestamp = new Date(
    year,
    month - 1,
    day,
    12,
    0,
    0,
  ).toISOString();

  const description =
    input.description.trim() || `Income from ${investment.name}`;

  return {
    id: crypto.randomUUID(),
    timestamp: recordTimestamp,
    merchantOrLabel: description,
    amount: input.amount,
    category: "SAVINGS",
    direction: "CREDIT",
    status: "COMPLETED",
    recordCategory: input.categoryName,
    categoryId: input.categoryId,
    linkedInvestmentId: investment.id,
    investmentTypeLabel: getInvestmentTypeLabel(investment.type),
    investmentName: investment.name,
  };
};

/** Inserts an income pay record only — does not modify the investment principal. */
export const recordInvestmentIncome = async (
  userId: string,
  investment: VaultInvestment,
  input: RecordInvestmentIncomeInput,
): Promise<Transaction> => {
  if (!input.categoryId.trim() || !input.categoryName.trim()) {
    throw new Error("Income category is required.");
  }
  if (!isValidInvestmentIncomeCategory(input.categoryName)) {
    throw new Error(
      "Salary and payroll categories cannot be used for investment income.",
    );
  }

  const payRecord = buildIncomePayRecord(input, investment);
  return insertVaultRecord(payRecord, userId);
};

/**
 * Records a return/payout with type-specific investment mutations:
 * - Dividend/Interest: principal unchanged, total_payouts incremented
 * - Sell/Liquidation: principal reduced, total_payouts incremented
 */
const reverseReturnEffects = (
  current: VaultInvestment,
  existingReturn: InvestmentReturn,
): { amount: number; totalPayouts: number } => {
  let amount = current.amount;
  let totalPayouts = current.totalPayouts ?? 0;

  if (existingReturn.type === "sell") {
    amount += existingReturn.amount;
  }
  totalPayouts -= existingReturn.amount;

  return { amount, totalPayouts };
};

const applyReturnEffects = (
  amount: number,
  totalPayouts: number,
  input: RecordInvestmentPayoutInput,
): { amount: number; totalPayouts: number } => {
  if (input.type === "sell" && input.amount > amount) {
    throw new Error("Sell/Liquidation amount cannot exceed active principal.");
  }

  return {
    amount: input.type === "sell" ? amount - input.amount : amount,
    totalPayouts: totalPayouts + input.amount,
  };
};

export const updateInvestmentReturn = async (
  userId: string,
  investment: VaultInvestment,
  returnId: string,
  input: RecordInvestmentPayoutInput,
): Promise<VaultInvestment> => {
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error("Payout amount must be greater than zero.");
  }

  const current = await fetchInvestmentById(userId, investment.id);
  const existingReturn = current.returns.find((item) => item.id === returnId);
  if (!existingReturn) {
    throw new Error("Return not found.");
  }

  const reversed = reverseReturnEffects(current, existingReturn);
  const next = applyReturnEffects(
    reversed.amount,
    reversed.totalPayouts,
    input,
  );
  const preservedInitial =
    (current.initialAmount ?? 0) > 0
      ? (current.initialAmount as number)
      : current.amount;

  const updatedReturn: InvestmentReturn = {
    id: returnId,
    type: input.type,
    amount: input.amount,
    date: input.date,
    notes: input.notes,
  };

  return patchInvestmentAfterPayout(userId, investment.id, {
    amount: next.amount,
    totalPayouts: next.totalPayouts,
    initialAmount: preservedInitial,
    returns: current.returns.map((item) =>
      item.id === returnId ? updatedReturn : item,
    ),
  });
};

export const recordInvestmentPayout = async (
  userId: string,
  investment: VaultInvestment,
  input: RecordInvestmentPayoutInput,
): Promise<VaultInvestment> => {
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error("Payout amount must be greater than zero.");
  }

  const newReturn: InvestmentReturn = {
    id: createReturnId(),
    type: input.type,
    amount: input.amount,
    date: input.date,
    notes: input.notes,
  };

  const current = await fetchInvestmentById(userId, investment.id);
  const patch = buildInvestmentPayoutPatch(current, input, newReturn);
  return patchInvestmentAfterPayout(userId, investment.id, patch);
};
