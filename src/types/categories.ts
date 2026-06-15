import type { BudgetCategory } from "@/types/financial";

export type PayCategoryKind = "income" | "deduction";

export type PayCategoryColorId =
  | "green"
  | "blue"
  | "purple"
  | "red"
  | "orange"
  | "yellow"
  | "cyan"
  | "pink"
  | "indigo"
  | "lime";

export interface PayCategoryColorOption {
  id: PayCategoryColorId;
  swatchClass: string;
  ringClass: string;
}

export const CATEGORY_COLOR_OPTIONS: PayCategoryColorOption[] = [
  { id: "green", swatchClass: "bg-emerald-500", ringClass: "ring-emerald-500" },
  { id: "blue", swatchClass: "bg-blue-500", ringClass: "ring-blue-500" },
  { id: "purple", swatchClass: "bg-violet-500", ringClass: "ring-violet-500" },
  { id: "red", swatchClass: "bg-red-500", ringClass: "ring-red-500" },
  { id: "orange", swatchClass: "bg-orange-500", ringClass: "ring-orange-500" },
  { id: "yellow", swatchClass: "bg-yellow-400", ringClass: "ring-yellow-400" },
  { id: "cyan", swatchClass: "bg-cyan-500", ringClass: "ring-cyan-500" },
  { id: "pink", swatchClass: "bg-pink-500", ringClass: "ring-pink-500" },
  { id: "indigo", swatchClass: "bg-indigo-500", ringClass: "ring-indigo-500" },
  { id: "lime", swatchClass: "bg-lime-500", ringClass: "ring-lime-500" },
];

export const DEFAULT_CATEGORY_COLOR: PayCategoryColorId = "green";

export const getCategoryColorSwatchClass = (
  colorId: PayCategoryColorId | undefined,
): string => {
  const option = CATEGORY_COLOR_OPTIONS.find((color) => color.id === colorId);
  return option?.swatchClass ?? CATEGORY_COLOR_OPTIONS[0].swatchClass;
};

/** Hex colors for donut segments, legend dots, and progress bar fills. */
const CATEGORY_CHART_HEX: Record<PayCategoryColorId, string> = {
  green: "#10b981",
  blue: "#3b82f6",
  purple: "#8b5cf6",
  red: "#ef4444",
  orange: "#f97316",
  yellow: "#eab308",
  cyan: "#06b6d4",
  pink: "#ec4899",
  indigo: "#6366f1",
  lime: "#84cc16",
};

/** Shared progress-bar track: white opacity in dark mode, subtle neutral in light. */
export const CHART_PROGRESS_TRACK = "var(--vault-progress-track)";

export const getCategoryChartColorHex = (
  colorId: PayCategoryColorId | undefined,
): string =>
  CATEGORY_CHART_HEX[colorId ?? DEFAULT_CATEGORY_COLOR] ??
  CATEGORY_CHART_HEX.green;

export const getCategoryChartTrackHex = (): string => CHART_PROGRESS_TRACK;

export const getCategoryBadgeClassName = (
  colorId: PayCategoryColorId | undefined,
): string => {
  const id = colorId ?? DEFAULT_CATEGORY_COLOR;
  return `inline-flex w-fit max-w-full truncate rounded-md px-2 py-0.5 text-xs font-medium vault-category-badge vault-category-badge--${id}`;
};

export const getCategoryQuickActionClassName = (
  colorId: PayCategoryColorId | undefined,
): string => {
  const id = colorId ?? DEFAULT_CATEGORY_COLOR;
  return `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition vault-category-quick-action vault-category-quick-action--${id}`;
};

export const findPayCategoryByName = (
  name: string | undefined,
  income: PayCategory[],
  deduction: PayCategory[],
): PayCategory | undefined => {
  const trimmed = name?.trim();
  if (!trimmed) {
    return undefined;
  }
  const normalized = trimmed.toLowerCase();
  return [...income, ...deduction].find(
    (category) => category.name.trim().toLowerCase() === normalized,
  );
};

export interface PayCategory {
  id: string;
  name: string;
  kind: PayCategoryKind;
  color: PayCategoryColorId;
  defaultAmount?: number;
}

/** Combobox row for pay category pickers (Records modals, additional pay, etc.). */
export const toCategoryComboboxOption = (category: PayCategory) => ({
  value: category.id,
  label: category.name,
  colorSwatchClass: getCategoryColorSwatchClass(category.color),
});

/** Supabase `categories` table row shape. */
export type VaultCategoryType = "income" | "expense" | "deduction";

export interface VaultCategoryMetadata {
  defaultAmount?: number;
  bucket?: BudgetCategory;
}

export interface VaultCategoryRow {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string | null;
  type: VaultCategoryType;
  metadata?: VaultCategoryMetadata | null;
  created_at?: string;
  updated_at?: string;
}

/** Supabase `budgets` table row shape. */
export interface VaultBudgetRow {
  id: string;
  user_id: string;
  category_id: string;
  allocated_amount: number;
  monthly_period: string;
  created_at?: string;
  updated_at?: string;
}

export const DEFAULT_BUDGET_PERIOD = "default";
