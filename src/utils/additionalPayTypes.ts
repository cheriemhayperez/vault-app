export const SALARY_CATEGORY_NAME = "Salary";

export const ADDITIONAL_PAY_TYPE_NAMES = [
  "Bonus/Incentives",
  "Holiday Pay",
  "Rest Day Premium",
  "Overtime",
  "13th Month Pay",
  "Adjustment",
] as const;

export const SUGGESTED_ADDITIONAL_PAY_EXAMPLES =
  "Bonus/Incentives, Holiday Pay, Rest Day Premium, Overtime, 13th Month Pay, or Adjustment";

export const isSalaryCategoryName = (name: string): boolean =>
  name.trim().toLowerCase() === SALARY_CATEGORY_NAME.toLowerCase();

export const isValidAdditionalPayCategory = (name: string): boolean =>
  !isSalaryCategoryName(name);

export const isAllowedAdditionalPayType = (name: string): boolean => {
  const normalized = name.trim().toLowerCase();
  return ADDITIONAL_PAY_TYPE_NAMES.some(
    (type) => type.toLowerCase() === normalized,
  );
};

export const formatAdditionalPayTypeList = (): string =>
  ADDITIONAL_PAY_TYPE_NAMES.join(", ");

export const formatSalaryAdditionalPayErrorMessage = (): string =>
  `Expected additional pay types: ${formatAdditionalPayTypeList()}.`;
