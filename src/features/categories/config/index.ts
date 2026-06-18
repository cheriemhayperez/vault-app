export const CATEGORY_ACTIONS_TRIGGER_CLASS = "vault-category-actions-trigger";

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
