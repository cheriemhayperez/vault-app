import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type {
  PortfolioSummary,
  Transaction,
  VaultInitializationPayload,
} from "@/types/financial";
import {
  computeMonthlyNetTakeHome,
  deriveGrossMonthlyIncome,
  isBudgetLedgerTransaction,
  sumPayRecordDeductionsForMonth,
  UNCATEGORIZED_CATEGORY,
} from "@/utils/payRecords";
import type { BudgetSplitPercentages, PhilippineDeductions } from "@/types/deductions";
import {
  computeBudgetAllocationsFromSplit,
  computePhilippineDeductions,
  DEFAULT_BUDGET_SPLIT,
} from "@/utils/philippineDeductions";

interface FinancialState {
  isVaultInitialized: boolean;
  grossMonthlyIncome: number;
  targetSavingsRatePercent: number;
  budgetSplitPercentages: BudgetSplitPercentages;
  deductions: PhilippineDeductions;
  /** Pay records and lifestyle expenses share this list (see api/ledger.ts). */
  transactions: Transaction[];
  summary: PortfolioSummary;
}

const emptyDeductions: PhilippineDeductions = {
  birTax: 0,
  sss: 0,
  philHealth: 0,
  pagIbig: 0,
  governmentEmployeeShare: 0,
  total: 0,
};

const emptyAllocations = { NEEDS: 0, WANTS: 0, SAVINGS: 0 };

const initialState: FinancialState = {
  isVaultInitialized: true,
  grossMonthlyIncome: 0,
  targetSavingsRatePercent: 20,
  budgetSplitPercentages: DEFAULT_BUDGET_SPLIT,
  deductions: emptyDeductions,
  transactions: [],
  summary: {
    trueNetTakeHomePay: 0,
    totalGovernmentAndTaxDeductions: 0,
    remainingMonthlyBudget: 0,
    bucketAllocations: emptyAllocations,
  },
};

const syncFinancialTotals = (state: FinancialState): void => {
  state.grossMonthlyIncome = deriveGrossMonthlyIncome(state.transactions);
  state.deductions = computePhilippineDeductions(state.grossMonthlyIncome);
  state.summary = recalculateSummary(
    state.grossMonthlyIncome,
    state.transactions,
    state.budgetSplitPercentages,
  );
};

const recalculateSummary = (
  grossMonthlyIncome: number,
  transactions: Transaction[],
  budgetSplitPercentages: BudgetSplitPercentages,
): PortfolioSummary => {
  const now = new Date();
  const manualDeductionsTotal = sumPayRecordDeductionsForMonth(
    transactions,
    now.getFullYear(),
    now.getMonth(),
  );
  const trueNetTakeHomePay = computeMonthlyNetTakeHome(transactions);

  const lifestyleDebits = transactions
    .filter(
      (transaction) =>
        isBudgetLedgerTransaction(transaction) &&
        transaction.direction === "DEBIT",
    )
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const lifestyleCredits = transactions
    .filter(
      (transaction) =>
        isBudgetLedgerTransaction(transaction) &&
        transaction.direction === "CREDIT",
    )
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const rawRemainingBudget = trueNetTakeHomePay - lifestyleDebits + lifestyleCredits;
  const remainingMonthlyBudget = Math.max(0, rawRemainingBudget);

  return {
    trueNetTakeHomePay,
    totalGovernmentAndTaxDeductions: manualDeductionsTotal,
    remainingMonthlyBudget,
    bucketAllocations: computeBudgetAllocationsFromSplit(
      trueNetTakeHomePay,
      budgetSplitPercentages,
    ),
  };
};

const financialSlice = createSlice({
  name: "financial",
  initialState,
  reducers: {
    initializeVault(state, action: PayloadAction<VaultInitializationPayload>) {
      const { grossMonthlyIncome, targetSavingsRatePercent } = action.payload;

      state.isVaultInitialized = true;
      state.grossMonthlyIncome = grossMonthlyIncome;
      state.targetSavingsRatePercent = targetSavingsRatePercent;
      state.deductions = computePhilippineDeductions(grossMonthlyIncome);
      state.summary = recalculateSummary(
        grossMonthlyIncome,
        state.transactions,
        state.budgetSplitPercentages,
      );
    },
    setBudgetSplitPercentages(
      state,
      action: PayloadAction<BudgetSplitPercentages>,
    ) {
      const needs = Math.max(0, action.payload.needs);
      const wants = Math.max(0, action.payload.wants);
      const savings = Math.max(0, action.payload.savings);

      state.budgetSplitPercentages = { needs, wants, savings };
      state.targetSavingsRatePercent = savings;
      const trueNet = state.summary.trueNetTakeHomePay;
      state.summary.bucketAllocations = computeBudgetAllocationsFromSplit(
        trueNet,
        state.budgetSplitPercentages,
      );
    },
    setGrossMonthlyIncome(state, action: PayloadAction<number>) {
      if (!Number.isFinite(action.payload) || action.payload < 0) {
        return;
      }

      state.grossMonthlyIncome = action.payload;
      state.deductions = computePhilippineDeductions(action.payload);
      state.summary = recalculateSummary(
        action.payload,
        state.transactions,
        state.budgetSplitPercentages,
      );
    },
    executeTransaction(state, action: PayloadAction<Transaction>) {
      state.transactions.unshift(action.payload);
      syncFinancialTotals(state);
    },
    updatePayRecord(state, action: PayloadAction<Transaction>) {
      const index = state.transactions.findIndex(
        (transaction) => transaction.id === action.payload.id,
      );
      if (index === -1) {
        return;
      }
      state.transactions[index] = action.payload;
      syncFinancialTotals(state);
    },
    removePayRecord(state, action: PayloadAction<string>) {
      state.transactions = state.transactions.filter(
        (transaction) => transaction.id !== action.payload,
      );
      syncFinancialTotals(state);
    },
    setTransactions(state, action: PayloadAction<Transaction[]>) {
      state.transactions = action.payload;
      syncFinancialTotals(state);
    },
    detachPayRecordsFromCategory(state, action: PayloadAction<string>) {
      const categoryId = action.payload;

      for (const transaction of state.transactions) {
        if (transaction.categoryId !== categoryId) {
          continue;
        }

        transaction.categoryId = undefined;
        transaction.recordCategory = UNCATEGORIZED_CATEGORY;
      }

      syncFinancialTotals(state);
    },
  },
});

export const {
  detachPayRecordsFromCategory,
  executeTransaction,
  initializeVault,
  removePayRecord,
  setBudgetSplitPercentages,
  setGrossMonthlyIncome,
  setTransactions,
  updatePayRecord,
} = financialSlice.actions;
export const financialReducer = financialSlice.reducer;
