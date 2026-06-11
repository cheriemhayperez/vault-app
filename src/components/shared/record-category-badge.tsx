"use client";

import {
  findPayCategoryByName,
  getCategoryBadgeClassName,
  type PayCategory,
} from "@/types/categories";
import type { Transaction } from "@/types/financial";
import {
  getRecordCategoryDisplay,
  UNCATEGORIZED_BADGE_CLASS,
  UNCATEGORIZED_CATEGORY,
} from "@/utils/payRecords";
import {
  ASSET_RETURNS_FALLBACK_LABEL,
  hasInvestmentRecordLink,
} from "@/utils/investmentRecordLinks";

interface RecordCategoryBadgeProps {
  record: Transaction;
  incomeCategories: PayCategory[];
  deductionCategories: PayCategory[];
}

export const RecordCategoryBadge = ({
  record,
  incomeCategories,
  deductionCategories,
}: RecordCategoryBadgeProps) => {
  const rawLabel = getRecordCategoryDisplay(record);
  const label =
    rawLabel === UNCATEGORIZED_CATEGORY && hasInvestmentRecordLink(record)
      ? ASSET_RETURNS_FALLBACK_LABEL
      : rawLabel;

  if (label === UNCATEGORIZED_CATEGORY) {
    return <span className={UNCATEGORIZED_BADGE_CLASS}>{label}</span>;
  }

  const matched = findPayCategoryByName(
    record.recordCategory,
    incomeCategories,
    deductionCategories,
  );

  const fallbackColor =
    record.direction === "CREDIT" ? ("green" as const) : ("red" as const);

  return (
    <span
      className={getCategoryBadgeClassName(matched?.color ?? fallbackColor)}
    >
      {label}
    </span>
  );
};
