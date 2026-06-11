import { Landmark, PiggyBank, Wallet } from "lucide-react";

import type { BudgetCategory } from "@/types/financial";

export const BUCKET_CONFIG = [
  {
    category: "NEEDS" as const,
    splitKey: "needs" as const,
    accent: "border-l-emerald-500",
    badgeClass: "bg-emerald-50 text-emerald-700",
    headerClass: "text-emerald-600",
    bar: "bg-emerald-500",
    icon: Landmark,
    spentLabel: "Spent",
    leftLabel: "Left",
    expensesHref: "/expenses",
  },
  {
    category: "WANTS" as const,
    splitKey: "wants" as const,
    accent: "border-l-violet-500",
    badgeClass: "bg-violet-50 text-violet-700",
    headerClass: "text-violet-600",
    bar: "bg-violet-500",
    icon: Wallet,
    spentLabel: "Spent",
    leftLabel: "Left",
    expensesHref: "/expenses",
  },
  {
    category: "SAVINGS" as const,
    splitKey: "savings" as const,
    accent: "border-l-emerald-600",
    badgeClass: "bg-emerald-50 text-emerald-800",
    headerClass: "text-emerald-700",
    bar: "bg-emerald-600",
    icon: PiggyBank,
    spentLabel: "Saved",
    leftLabel: "Until goal",
    expensesHref: "/expenses",
  },
] as const;

export const MOBILE_BUCKET_TABS: { category: BudgetCategory; label: string }[] =
  [
    { category: "NEEDS", label: "Needs" },
    { category: "WANTS", label: "Wants" },
    { category: "SAVINGS", label: "Savings" },
  ];

export const MOBILE_BUCKET_TINT: Record<BudgetCategory, string> = {
  NEEDS: "bg-emerald-50/50 md:bg-white",
  WANTS: "bg-violet-50/50 md:bg-white",
  SAVINGS: "bg-emerald-50/40 md:bg-white",
};

export const NET_PAY_SPLIT_COLUMNS = [
  { category: "NEEDS" as const, label: "Needs", splitKey: "needs" as const },
  { category: "WANTS" as const, label: "Wants", splitKey: "wants" as const },
  {
    category: "SAVINGS" as const,
    label: "Savings",
    splitKey: "savings" as const,
  },
] as const;
