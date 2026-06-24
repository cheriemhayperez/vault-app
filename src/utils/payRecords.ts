import type { Transaction } from "@/types/financial";
import {
  findPayCategoryByName,
  getCategoryChartColorHex,
  CHART_PROGRESS_TRACK,
  type PayCategory,
} from "@/types/categories";
import { formatPhpFixed } from "@/utils/format/formatters";
import { isSalaryCategoryName } from "@/utils/additionalPayTypes";

export const UNCATEGORIZED_CATEGORY = "Uncategorized";

export const UNCATEGORIZED_BADGE_CLASS =
  "inline-flex w-fit max-w-full truncate rounded-md px-2 py-0.5 text-xs font-medium vault-category-badge vault-category-badge--slate";

const AUTO_DESCRIPTION_LABELS = new Set(["Income", "Deduction"]);

export const isUncategorizedRecordCategory = (
  name: string | undefined,
): boolean => {
  const category = name?.trim();
  return !category || category === UNCATEGORIZED_CATEGORY;
};

export const isPayRecord = (transaction: Transaction): boolean =>
  Boolean(transaction.recordCategory);

/** Lifestyle spending (Needs/Wants/Savings) — never payroll deductions. */
export const isBudgetLedgerTransaction = (transaction: Transaction): boolean =>
  !transaction.recordCategory;

export const isPayRecordIncome = (transaction: Transaction): boolean =>
  isPayRecord(transaction) &&
  transaction.direction === "CREDIT" &&
  transaction.status === "COMPLETED";

export const isPayRecordDeduction = (transaction: Transaction): boolean =>
  isPayRecord(transaction) &&
  transaction.direction === "DEBIT" &&
  transaction.status === "COMPLETED";

export const sumPayRecordIncome = (transactions: Transaction[]): number =>
  transactions
    .filter(isPayRecordIncome)
    .reduce((sum, transaction) => sum + transaction.amount, 0);

export const sumPayRecordDeductions = (transactions: Transaction[]): number =>
  transactions
    .filter(isPayRecordDeduction)
    .reduce((sum, transaction) => sum + transaction.amount, 0);

export const computePayrollNetPay = (transactions: Transaction[]): number =>
  Math.max(0, sumPayRecordIncome(transactions) - sumPayRecordDeductions(transactions));

/** Net take-home for the current calendar month (budget & allocations). */
export const computeMonthlyNetTakeHome = (transactions: Transaction[]): number => {
  const now = new Date();
  const income = sumPayRecordIncomeForMonth(
    transactions,
    now.getFullYear(),
    now.getMonth(),
  );
  const deductions = sumPayRecordDeductionsForMonth(
    transactions,
    now.getFullYear(),
    now.getMonth(),
  );
  return income - deductions;
};

export const sumPayRecordIncomeForMonth = (
  transactions: Transaction[],
  year: number,
  month: number,
): number =>
  transactions
    .filter(
      (transaction) =>
        isPayRecord(transaction) &&
        transaction.direction === "CREDIT" &&
        transaction.status === "COMPLETED",
    )
    .filter((transaction) => {
      const date = new Date(transaction.timestamp);
      return date.getFullYear() === year && date.getMonth() === month;
    })
    .reduce((sum, transaction) => sum + transaction.amount, 0);

export const sumPayRecordDeductionsForMonth = (
  transactions: Transaction[],
  year: number,
  month: number,
): number =>
  transactions
    .filter(
      (transaction) =>
        isPayRecord(transaction) &&
        transaction.direction === "DEBIT" &&
        transaction.status === "COMPLETED",
    )
    .filter((transaction) => {
      const date = new Date(transaction.timestamp);
      return date.getFullYear() === year && date.getMonth() === month;
    })
    .reduce((sum, transaction) => sum + transaction.amount, 0);

/** Gross monthly income from pay-record income entries in the current calendar month. */
export const deriveGrossMonthlyIncome = (transactions: Transaction[]): number => {
  const now = new Date();
  return sumPayRecordIncomeForMonth(
    transactions,
    now.getFullYear(),
    now.getMonth(),
  );
};

export interface PayRecordMonthGroup {
  key: string;
  label: string;
  year: number;
  month: number;
  records: Transaction[];
  totalIncome: number;
  totalDeductions: number;
  netTotal: number;
}

export const groupPayRecordsByMonth = (
  records: Transaction[],
): PayRecordMonthGroup[] => {
  const map = new Map<string, PayRecordMonthGroup>();

  for (const record of records) {
    const date = new Date(record.timestamp);
    const year = date.getFullYear();
    const month = date.getMonth();
    const key = `${year}-${month}`;
    const label = date.toLocaleDateString("en-PH", {
      month: "long",
      year: "numeric",
    });

    const existing = map.get(key);
    const group: PayRecordMonthGroup = existing ?? {
      key,
      label,
      year,
      month,
      records: [],
      totalIncome: 0,
      totalDeductions: 0,
      netTotal: 0,
    };

    group.records.push(record);
    if (record.direction === "CREDIT") {
      group.totalIncome += record.amount;
    } else {
      group.totalDeductions += record.amount;
    }
    group.netTotal = group.totalIncome - group.totalDeductions;
    map.set(key, group);
  }

  return [...map.values()].sort((a, b) => {
    if (a.year !== b.year) {
      return b.year - a.year;
    }
    return b.month - a.month;
  });
};

export const getRecordTypeLabel = (record: Transaction): string =>
  record.direction === "CREDIT" ? "Income" : "Deduction";

/** Shown in Description when the user left the field blank. */
export const EMPTY_RECORD_DESCRIPTION = "—";

/** Table/dashboard display: em dash when no user description. */
export const getRecordDescriptionDisplay = (record: Transaction): string =>
  getRecordRowDescription(record);

export const isEmptyRecordRowDescription = (record: Transaction): boolean =>
  getRecordRowDescription(record) === EMPTY_RECORD_DESCRIPTION;

/** Primary label beside the direction icon (Description column). */
export const getRecordRowDescription = (record: Transaction): string => {
  const label = record.merchantOrLabel?.trim();
  if (!label || AUTO_DESCRIPTION_LABELS.has(label)) {
    return EMPTY_RECORD_DESCRIPTION;
  }

  const category = record.recordCategory?.trim();
  if (
    category &&
    category !== UNCATEGORIZED_CATEGORY &&
    label.toLowerCase() === category.toLowerCase()
  ) {
    return EMPTY_RECORD_DESCRIPTION;
  }

  return label;
};

/** Table/dashboard display label for the Category column. */
export const getRecordCategoryDisplay = (record: Transaction): string => {
  if (isUncategorizedRecordCategory(record.recordCategory)) {
    return UNCATEGORIZED_CATEGORY;
  }
  return record.recordCategory!.trim();
};

export const timestampToInputDate = (iso: string): string => {
  const date = new Date(iso);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export interface CategoryDistributionSlice {
  name: string;
  amount: number;
  percent: number;
  color: string;
  trackColor?: string;
}

export interface PayRecordDistributionOptions {
  year?: number;
  month?: number;
  endMonth?: number;
  incomeCategories?: PayCategory[];
  deductionCategories?: PayCategory[];
}

const UNCATEGORIZED_CHART_COLOR = "#94a3b8";
const UNCATEGORIZED_TRACK_COLOR = CHART_PROGRESS_TRACK;

export const aggregatePayRecordDistribution = (
  transactions: Transaction[],
  direction: Transaction["direction"],
  options?: PayRecordDistributionOptions,
): CategoryDistributionSlice[] => {
  const totals = new Map<string, number>();

  for (const transaction of transactions) {
    if (!isPayRecord(transaction) || transaction.direction !== direction) {
      continue;
    }

    if (options?.year !== undefined) {
      const date = new Date(transaction.timestamp);
      if (date.getFullYear() !== options.year) {
        continue;
      }

      if (options.month !== undefined) {
        const transactionMonth = date.getMonth();

        if (options.endMonth !== undefined) {
          const start = Math.min(options.month, options.endMonth);
          const end = Math.max(options.month, options.endMonth);
          if (transactionMonth < start || transactionMonth > end) {
            continue;
          }
        } else if (transactionMonth !== options.month) {
          continue;
        }
      }
    }

    const label = transaction.recordCategory?.trim() || UNCATEGORIZED_CATEGORY;
    totals.set(label, (totals.get(label) ?? 0) + transaction.amount);
  }

  const grandTotal = [...totals.values()].reduce((sum, value) => sum + value, 0);
  if (grandTotal <= 0) {
    return [];
  }

  const incomeCategories = options?.incomeCategories ?? [];
  const deductionCategories = options?.deductionCategories ?? [];

  const resolveSliceColors = (name: string) => {
    if (name === UNCATEGORIZED_CATEGORY) {
      return {
        color: UNCATEGORIZED_CHART_COLOR,
        trackColor: UNCATEGORIZED_TRACK_COLOR,
      };
    }

    const matched = findPayCategoryByName(
      name,
      incomeCategories,
      deductionCategories,
    );
    const colorId = matched?.color;

    return {
      color: getCategoryChartColorHex(colorId),
      trackColor: CHART_PROGRESS_TRACK,
    };
  };

  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, amount]) => {
      const { color, trackColor } = resolveSliceColors(name);
      return {
        name,
        amount,
        percent: (amount / grandTotal) * 100,
        color,
        trackColor,
      };
    });
};

export const getSalaryIncomeRecords = (
  transactions: Transaction[],
): Transaction[] =>
  transactions.filter(
    (transaction) =>
      isPayRecord(transaction) &&
      transaction.direction === "CREDIT" &&
      isSalaryCategoryName(transaction.recordCategory ?? ""),
  );

/** Salary and additional-pay income records (for linking deductions). */
export const getLinkableIncomeRecords = (
  transactions: Transaction[],
): Transaction[] =>
  transactions.filter(
    (transaction) =>
      isPayRecord(transaction) && transaction.direction === "CREDIT",
  );

export const formatIncomeLinkOptionLabel = (record: Transaction): string => {
  const categoryLabel = record.recordCategory?.trim() || "Salary";
  const dateLabel = timestampToInputDate(record.timestamp);
  return `${categoryLabel} - ${formatPhpFixed(record.amount)} (${dateLabel})`;
};

export const formatSalaryLinkOptionLabel = formatIncomeLinkOptionLabel;

export interface PayRecordLedgerRow {
  record: Transaction;
  linkedDeductions: Transaction[];
}

export const getLinkedDeductionsForRecord = (
  records: Transaction[],
  parentRecordId: string,
): Transaction[] =>
  records.filter(
    (record) =>
      record.direction === "DEBIT" &&
      record.linkedSalaryRecordId === parentRecordId,
  );

export const buildPayRecordLedgerRows = (
  records: Transaction[],
): PayRecordLedgerRow[] => {
  const linkedChildIds = new Set<string>();
  const deductionsByParent = new Map<string, Transaction[]>();

  for (const record of records) {
    if (record.direction !== "DEBIT" || !record.linkedSalaryRecordId) {
      continue;
    }

    linkedChildIds.add(record.id);
    const existing = deductionsByParent.get(record.linkedSalaryRecordId) ?? [];
    existing.push(record);
    deductionsByParent.set(record.linkedSalaryRecordId, existing);
  }

  const rows: PayRecordLedgerRow[] = [];

  for (const record of records) {
    if (linkedChildIds.has(record.id)) {
      continue;
    }

    rows.push({
      record,
      linkedDeductions:
        record.direction === "CREDIT"
          ? (deductionsByParent.get(record.id) ?? [])
          : [],
    });
  }

  return rows;
};

export const sumLinkedDeductionAmount = (deductions: Transaction[]): number =>
  deductions.reduce((total, deduction) => total + deduction.amount, 0);

export const formatLinkedDeductionCountLabel = (count: number): string =>
  count === 1 ? "1 deduction" : `${count} deductions`;

export const countDistinctPayRecordMonths = (records: Transaction[]): number => {
  const keys = new Set<string>();
  for (const record of records) {
    const date = new Date(record.timestamp);
    keys.add(`${date.getFullYear()}-${date.getMonth()}`);
  }
  return keys.size;
};
