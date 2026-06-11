import type { BudgetCategory } from "@/types/financial";

export type BudgetCategoryColorId =
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "cyan"
  | "blue"
  | "indigo"
  | "purple"
  | "pink"
  | "slate";

export interface BudgetCategoryColorOption {
  id: BudgetCategoryColorId;
  swatchClass: string;
  ringClass: string;
}

export const BUDGET_CATEGORY_COLOR_OPTIONS: BudgetCategoryColorOption[] = [
  { id: "red", swatchClass: "bg-red-500", ringClass: "ring-red-500" },
  { id: "orange", swatchClass: "bg-orange-500", ringClass: "ring-orange-500" },
  { id: "yellow", swatchClass: "bg-yellow-400", ringClass: "ring-yellow-400" },
  { id: "green", swatchClass: "bg-emerald-500", ringClass: "ring-emerald-500" },
  { id: "cyan", swatchClass: "bg-cyan-500", ringClass: "ring-cyan-500" },
  { id: "blue", swatchClass: "bg-blue-500", ringClass: "ring-blue-500" },
  { id: "indigo", swatchClass: "bg-indigo-500", ringClass: "ring-indigo-500" },
  { id: "purple", swatchClass: "bg-violet-500", ringClass: "ring-violet-500" },
  { id: "pink", swatchClass: "bg-pink-500", ringClass: "ring-pink-500" },
  { id: "slate", swatchClass: "bg-slate-400", ringClass: "ring-slate-400" },
];

export const DEFAULT_BUDGET_CATEGORY_COLOR: BudgetCategoryColorId = "blue";

export const getBudgetCategoryColorSwatchClass = (
  colorId: BudgetCategoryColorId | undefined,
): string => {
  const option = BUDGET_CATEGORY_COLOR_OPTIONS.find(
    (color) => color.id === colorId,
  );
  return option?.swatchClass ?? BUDGET_CATEGORY_COLOR_OPTIONS[5].swatchClass;
};

const BUDGET_CATEGORY_BADGE_STYLES: Record<
  BudgetCategoryColorId,
  { badge: string; text: string }
> = {
  red: { badge: "bg-red-50", text: "text-red-600" },
  orange: { badge: "bg-orange-50", text: "text-orange-700" },
  yellow: { badge: "bg-yellow-50", text: "text-yellow-700" },
  green: { badge: "bg-emerald-50", text: "text-emerald-700" },
  cyan: { badge: "bg-cyan-50", text: "text-cyan-700" },
  blue: { badge: "bg-blue-50", text: "text-blue-700" },
  indigo: { badge: "bg-indigo-50", text: "text-indigo-700" },
  purple: { badge: "bg-violet-50", text: "text-violet-700" },
  pink: { badge: "bg-pink-50", text: "text-pink-700" },
  slate: { badge: "bg-slate-100", text: "text-slate-600" },
};

export const getBudgetCategoryBadgeClassName = (
  colorId: BudgetCategoryColorId | undefined,
): string => {
  const style =
    BUDGET_CATEGORY_BADGE_STYLES[colorId ?? DEFAULT_BUDGET_CATEGORY_COLOR] ??
    BUDGET_CATEGORY_BADGE_STYLES.blue;
  return `inline-flex w-fit max-w-full truncate rounded-md px-2 py-0.5 text-xs font-medium ${style.badge} ${style.text}`;
};

export interface BudgetExpenseCategory {
  id: string;
  name: string;
  bucket: BudgetCategory;
  color: BudgetCategoryColorId;
  sharePercent: number;
  monthlyPeriod: string;
}

export const getBucketPercentLabel = (bucket: BudgetCategory): string => {
  switch (bucket) {
    case "NEEDS":
      return "Percentage of Needs";
    case "WANTS":
      return "Percentage of Wants";
    case "SAVINGS":
      return "Percentage of Savings";
    default:
      return "Percentage";
  }
};

export const getBucketCategoryNamePlaceholder = (
  bucket: BudgetCategory,
): string => {
  switch (bucket) {
    case "NEEDS":
      return "e.g., Rent, Food, Medication";
    case "WANTS":
      return "e.g., Dining Out, Entertainment, Shopping";
    case "SAVINGS":
      return "e.g., Emergency Fund, Vacation, Investments";
    default:
      return "e.g., Category name";
  }
};

export type BudgetCategoriesByBucket = Record<
  BudgetCategory,
  BudgetExpenseCategory[]
>;
