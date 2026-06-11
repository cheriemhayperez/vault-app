export const QUICK_DEDUCTION_TYPE_NAMES = [
  "SSS",
  "PhilHealth",
  "Pag-IBIG",
  "Adjustment",
] as const;

export const SUGGESTED_QUICK_DEDUCTION_EXAMPLES =
  "SSS, PhilHealth, Pag-IBIG, or Adjustment";

export const isAllowedQuickDeductionType = (name: string): boolean => {
  const normalized = name.trim().toLowerCase();
  return QUICK_DEDUCTION_TYPE_NAMES.some(
    (type) => type.toLowerCase() === normalized,
  );
};

export const formatQuickDeductionTypeList = (): string =>
  QUICK_DEDUCTION_TYPE_NAMES.join(", ");

export const formatQuickDeductionErrorMessage = (): string =>
  `Expected deduction types: ${formatQuickDeductionTypeList()}.`;
