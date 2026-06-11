export type InvestmentType =
  | "stocks"
  | "cryptocurrency"
  | "real-estate"
  | "bonds"
  | "mutual-funds"
  | "business"
  | "profit-share"
  | "other";

export type InvestmentTransactionType =
  | "buy"
  | "sell"
  | "dividend"
  | "interest";

export type InvestmentReturnType = "dividend" | "interest" | "sell";

export interface InvestmentReturn {
  id: string;
  type: InvestmentReturnType;
  amount: number;
  date: string;
  notes?: string;
}

export interface VaultInvestment {
  id: string;
  name: string;
  type: InvestmentType;
  transactionType: InvestmentTransactionType;
  amount: number;
  date: string;
  startedDate?: string;
  notes?: string;
  parentId?: string | null;
  recurringReminder?: boolean;
  reminderDuration?: string;
  returns: InvestmentReturn[];
  /** Original buy principal — never reduced by sell/liquidation events. */
  initialAmount?: number;
  /** Cumulative cash received from return/payout events (persisted). */
  totalPayouts?: number;
}

export const INVESTMENT_TYPE_OPTIONS: {
  value: InvestmentType;
  label: string;
}[] = [
  { value: "stocks", label: "Stocks" },
  { value: "cryptocurrency", label: "Cryptocurrency" },
  { value: "real-estate", label: "Real Estate" },
  { value: "bonds", label: "Bonds" },
  { value: "mutual-funds", label: "Mutual Funds" },
  { value: "business", label: "Business" },
  { value: "profit-share", label: "Profit-Share Contract" },
  { value: "other", label: "Other" },
];

export const INVESTMENT_TRANSACTION_OPTIONS: {
  value: InvestmentTransactionType;
  label: string;
}[] = [
  { value: "buy", label: "Buy/Purchase" },
  { value: "sell", label: "Sell" },
  { value: "dividend", label: "Dividend" },
  { value: "interest", label: "Interest" },
];

export const INVESTMENT_RETURN_TYPE_OPTIONS: {
  value: InvestmentReturnType;
  label: string;
}[] = [
  { value: "dividend", label: "Dividend" },
  { value: "interest", label: "Interest" },
  { value: "sell", label: "Sell/Liquidation" },
];

export const getInvestmentReturnTypeLabel = (
  type: InvestmentReturnType,
): string =>
  INVESTMENT_RETURN_TYPE_OPTIONS.find((option) => option.value === type)
    ?.label ?? type;

export const getInvestmentTypeLabel = (type: InvestmentType): string =>
  INVESTMENT_TYPE_OPTIONS.find((option) => option.value === type)?.label ??
  type;

export const getInvestmentTransactionLabel = (
  type: InvestmentTransactionType,
): string =>
  INVESTMENT_TRANSACTION_OPTIONS.find((option) => option.value === type)
    ?.label ?? type;

/** Supabase `investments` table row shape. */
export interface VaultInvestmentRow {
  id: string;
  user_id: string;
  name: string;
  type: VaultInvestment["type"];
  transaction_type: VaultInvestment["transactionType"];
  amount: number;
  transaction_date: string;
  started_date: string | null;
  notes: string | null;
  parent_id: string | null;
  recurring_reminder: boolean;
  reminder_duration: string | null;
  returns: InvestmentReturn[] | null;
  initial_amount?: number | null;
  total_payouts?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface RecordInvestmentIncomeInput {
  amount: number;
  date: string;
  description: string;
  categoryId: string;
  categoryName: string;
}

export interface RecordInvestmentPayoutInput {
  type: InvestmentReturnType;
  amount: number;
  date: string;
  notes?: string;
}
