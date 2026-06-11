export const getBudgetLeftAmount = (target: number, spent: number): number =>
  target - spent;

export const getBudgetUsagePercent = (target: number, spent: number): number => {
  if (target <= 0) {
    return 0;
  }
  return Math.min(100, (spent / target) * 100);
};

/** True when allocation is negative or spend exceeds a positive target. */
export const isBudgetOverTarget = (target: number, spent: number): boolean =>
  target <= 0 || spent > target;

export const formatBudgetUsageLabel = (
  target: number,
  spent: number,
): string => {
  if (isBudgetOverTarget(target, spent)) {
    const percent =
      target > 0 ? Math.round((spent / target) * 100) : 0;
    return `${percent}% (Over budget!)`;
  }
  return `${Math.round(getBudgetUsagePercent(target, spent))}%`;
};
