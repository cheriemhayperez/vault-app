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

/** Light track backgrounds paired with chart segment colors. */
const CATEGORY_CHART_TRACK_HEX: Record<PayCategoryColorId, string> = {
  green: "#ecfdf5",
  blue: "#eff6ff",
  purple: "#f5f3ff",
  red: "#fef2f2",
  orange: "#fff7ed",
  yellow: "#fefce8",
  cyan: "#ecfeff",
  pink: "#fdf2f8",
  indigo: "#eef2ff",
  lime: "#f7fee7",
};

export const getCategoryChartColorHex = (
  colorId: PayCategoryColorId | undefined,
): string =>
  CATEGORY_CHART_HEX[colorId ?? DEFAULT_CATEGORY_COLOR] ??
  CATEGORY_CHART_HEX.green;

export const getCategoryChartTrackHex = (
  colorId: PayCategoryColorId | undefined,
): string =>
  CATEGORY_CHART_TRACK_HEX[colorId ?? DEFAULT_CATEGORY_COLOR] ??
  CATEGORY_CHART_TRACK_HEX.green;

const CATEGORY_BADGE_STYLES: Record<
  PayCategoryColorId,
  { badge: string; text: string }
> = {
  green: { badge: "bg-emerald-50", text: "text-emerald-700" },
  blue: { badge: "bg-blue-50", text: "text-blue-700" },
  purple: { badge: "bg-violet-50", text: "text-violet-700" },
  red: { badge: "bg-red-50", text: "text-red-600" },
  orange: { badge: "bg-orange-50", text: "text-orange-700" },
  yellow: { badge: "bg-yellow-50", text: "text-yellow-700" },
  cyan: { badge: "bg-cyan-50", text: "text-cyan-700" },
  pink: { badge: "bg-pink-50", text: "text-pink-700" },
  indigo: { badge: "bg-indigo-50", text: "text-indigo-700" },
  lime: { badge: "bg-lime-50", text: "text-lime-700" },
};

export const getCategoryBadgeClassName = (
  colorId: PayCategoryColorId | undefined,
): string => {
  const style =
    CATEGORY_BADGE_STYLES[colorId ?? DEFAULT_CATEGORY_COLOR] ??
    CATEGORY_BADGE_STYLES.green;
  return `inline-flex w-fit max-w-full truncate rounded-md px-2 py-0.5 text-xs font-medium ${style.badge} ${style.text}`;
};

const CATEGORY_QUICK_ACTION_STYLES: Record<
  PayCategoryColorId,
  { border: string; hoverBorder: string; hoverBg: string }
> = {
  green: {
    border: "border-emerald-100",
    hoverBorder: "hover:border-emerald-200",
    hoverBg: "hover:bg-emerald-50/40",
  },
  blue: {
    border: "border-blue-100",
    hoverBorder: "hover:border-blue-200",
    hoverBg: "hover:bg-blue-50/40",
  },
  purple: {
    border: "border-violet-100",
    hoverBorder: "hover:border-violet-200",
    hoverBg: "hover:bg-violet-50/40",
  },
  red: {
    border: "border-red-100",
    hoverBorder: "hover:border-red-200",
    hoverBg: "hover:bg-red-50/40",
  },
  orange: {
    border: "border-orange-100",
    hoverBorder: "hover:border-orange-200",
    hoverBg: "hover:bg-orange-50/40",
  },
  yellow: {
    border: "border-yellow-100",
    hoverBorder: "hover:border-yellow-200",
    hoverBg: "hover:bg-yellow-50/40",
  },
  cyan: {
    border: "border-cyan-100",
    hoverBorder: "hover:border-cyan-200",
    hoverBg: "hover:bg-cyan-50/40",
  },
  pink: {
    border: "border-pink-100",
    hoverBorder: "hover:border-pink-200",
    hoverBg: "hover:bg-pink-50/40",
  },
  indigo: {
    border: "border-indigo-100",
    hoverBorder: "hover:border-indigo-200",
    hoverBg: "hover:bg-indigo-50/40",
  },
  lime: {
    border: "border-lime-100",
    hoverBorder: "hover:border-lime-200",
    hoverBg: "hover:bg-lime-50/40",
  },
};

export const getCategoryQuickActionClassName = (
  colorId: PayCategoryColorId | undefined,
): string => {
  const style =
    CATEGORY_QUICK_ACTION_STYLES[colorId ?? DEFAULT_CATEGORY_COLOR] ??
    CATEGORY_QUICK_ACTION_STYLES.green;
  return `inline-flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm font-semibold text-slate-900 transition ${style.border} ${style.hoverBorder} ${style.hoverBg}`;
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
