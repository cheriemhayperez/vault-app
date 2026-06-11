import { Landmark, PiggyBank, Wallet } from "lucide-react";

import type { BudgetCategory } from "@/types/financial";

export const BUCKET_COLUMNS = [
  {
    category: "NEEDS" as const,
    badgeClass: "bg-emerald-50 text-emerald-700",
    buttonClass: "bg-emerald-600 hover:bg-emerald-700",
    addLabel: "Add Expense",
    icon: Landmark,
  },
  {
    category: "WANTS" as const,
    badgeClass: "bg-violet-50 text-violet-700",
    buttonClass: "bg-violet-600 hover:bg-violet-700",
    addLabel: "Add Wants",
    icon: Wallet,
  },
  {
    category: "SAVINGS" as const,
    badgeClass: "bg-emerald-50 text-emerald-700",
    buttonClass: "bg-emerald-600 hover:bg-emerald-700",
    addLabel: "Add Savings",
    icon: PiggyBank,
  },
] as const;

export const EXPENSE_SUMMARY_COLUMNS = [
  {
    label: "Needs",
    category: "NEEDS" as const,
    valueClass: "text-emerald-600",
  },
  {
    label: "Wants",
    category: "WANTS" as const,
    valueClass: "text-violet-600",
  },
  {
    label: "Savings",
    category: "SAVINGS" as const,
    valueClass: "text-emerald-600",
  },
] as const;

export const LEDGER_COLUMNS = [
  "Description",
  "Category",
  "Budget Bucket",
  "Date",
  "Amount",
] as const;

export const EXPENSES_LEDGER_GRID_CLASS =
  "grid min-w-[42rem] grid-cols-[minmax(8rem,1.25fr)_minmax(7rem,1fr)_minmax(5rem,0.85fr)_minmax(5.5rem,1fr)_minmax(6.5rem,1fr)_2.5rem] items-center gap-3 lg:min-w-0 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,0.75fr)_minmax(0,1fr)_minmax(0,1fr)_2.5rem]";

export const MOBILE_BUCKET_TABS: { category: BudgetCategory; label: string }[] =
  [
    { category: "NEEDS", label: "Needs" },
    { category: "WANTS", label: "Wants" },
    { category: "SAVINGS", label: "Savings" },
  ];
