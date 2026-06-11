import {
  ADDITIONAL_PAY_TYPE_NAMES,
  isSalaryCategoryName,
} from "@/utils/additionalPayTypes";

export const SUGGESTED_INVESTMENT_INCOME_EXAMPLES =
  "Dividends, Investment Return, Interest Income, or Capital Gains";

export const DEFAULT_INVESTMENT_INCOME_CATEGORY_NAMES = [
  "Dividends",
  "Investment Return",
] as const;

export const isAdditionalPayCategoryName = (name: string): boolean => {
  const normalized = name.trim().toLowerCase();
  return ADDITIONAL_PAY_TYPE_NAMES.some(
    (type) => type.toLowerCase() === normalized,
  );
};

/** Investment returns must not use payroll or additional-pay income categories. */
export const isValidInvestmentIncomeCategory = (name: string): boolean =>
  !isSalaryCategoryName(name) && !isAdditionalPayCategoryName(name);

export const resolveDefaultInvestmentIncomeCategoryId = (
  categories: { id: string; name: string }[],
): string => {
  const valid = categories.filter((category) =>
    isValidInvestmentIncomeCategory(category.name),
  );

  for (const preferredName of DEFAULT_INVESTMENT_INCOME_CATEGORY_NAMES) {
    const match = valid.find(
      (category) =>
        category.name.trim().toLowerCase() === preferredName.toLowerCase(),
    );
    if (match) {
      return match.id;
    }
  }

  return valid[0]?.id ?? "";
};

export const formatInvestmentIncomeCategoryExamples = (): string =>
  SUGGESTED_INVESTMENT_INCOME_EXAMPLES;
