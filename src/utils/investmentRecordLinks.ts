import type { Transaction } from "@/types/financial";

export const ASSET_RETURNS_FALLBACK_LABEL = "Asset Returns";

export const hasInvestmentRecordLink = (record: Transaction): boolean =>
  Boolean(
    record.linkedInvestmentId?.trim() ||
      record.investmentTypeLabel?.trim() ||
      record.investmentName?.trim(),
  );
