export const CATEGORY_ACTIONS_TRIGGER_CLASS =
  "flex size-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600";

export const INCOME_PANEL = {
  kind: "income" as const,
  title: "Income Categories",
  titleClass: "text-violet-600",
  description: "Categories for tracking income sources",
  emptyLabel: "No income categories yet",
};

export const DEDUCTION_PANEL = {
  kind: "deduction" as const,
  title: "Deduction Categories",
  titleClass: "text-rose-600",
  description: "Categories for tracking deductions",
  emptyLabel: "No deduction categories yet",
};
