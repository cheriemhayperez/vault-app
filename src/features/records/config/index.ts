import type { FilterSelectOption } from "@/components/shared/filter-select-menu";
import type { Transaction } from "@/types/financial";
import { getActiveCurrencyFormatters } from "@/utils/format/currencyFormat";

export const RECORDS_LEDGER_GRID_CLASS =
  "grid min-w-[38rem] grid-cols-[4.25rem_8rem_6.5rem_7.25rem_6.5rem_2.5rem] items-center gap-3 md:min-w-0 md:grid-cols-[4.25rem_minmax(0,1.25fr)_minmax(0,1fr)_minmax(0,0.95fr)_minmax(0,1fr)_2.5rem]";

export const LEDGER_COLUMNS = [
  { label: "Type", headerClass: "text-center" },
  { label: "Description", headerClass: "" },
  { label: "Category", headerClass: "" },
  { label: "Date", headerClass: "" },
  { label: "Amount", headerClass: "text-right" },
] as const;

export const RECORDS_FILTER_CONTROL_CLASS =
  "h-9 rounded-lg border border-slate-200 py-0 text-sm text-slate-700 outline-none transition-colors focus:ring-0";

export const TIME_FILTER_OPTIONS: FilterSelectOption[] = [
  { value: "all", label: "All Time" },
  { value: "month", label: "This Month" },
  { value: "last3", label: "Last 3 Months" },
  { value: "last6", label: "Last 6 Months" },
  { value: "year", label: "This Year" },
];

export const formatSignedAmount = (transaction: Transaction): string => {
  const formatted = getActiveCurrencyFormatters().formatMoneyFixed(
    transaction.amount,
  );
  return transaction.direction === "CREDIT" ? `+${formatted}` : `-${formatted}`;
};
