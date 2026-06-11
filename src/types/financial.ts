import type { BudgetAllocations, PhilippineDeductions } from "@/types/deductions";

export type BudgetCategory = "NEEDS" | "WANTS" | "SAVINGS";
export type TransactionDirection = "DEBIT" | "CREDIT";
export type TransactionStatus = "COMPLETED" | "PENDING" | "FAILED";

export interface Transaction {
  id: string;
  timestamp: string;
  merchantOrLabel: string;
  amount: number;
  category: BudgetCategory;
  direction: TransactionDirection;
  status: TransactionStatus;
  recordCategory?: string;
  linkedSalaryRecordId?: string;
  linkedInvestmentId?: string;
  investmentTypeLabel?: string;
  investmentName?: string;
  budgetCategoryId?: string;
  categoryId?: string;
}

export interface PortfolioSummary {
  trueNetTakeHomePay: number;
  totalGovernmentAndTaxDeductions: number;
  remainingMonthlyBudget: number;
  bucketAllocations: BudgetAllocations;
}

export interface VaultInitializationPayload {
  grossMonthlyIncome: number;
  targetSavingsRatePercent: number;
}

export interface FinancialVaultState {
  isVaultInitialized: boolean;
  grossMonthlyIncome: number;
  targetSavingsRatePercent: number;
  deductions: PhilippineDeductions;
  transactions: Transaction[];
  summary: PortfolioSummary;
}
