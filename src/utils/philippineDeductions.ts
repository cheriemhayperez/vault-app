import type {
  BudgetAllocations,
  BudgetSplitPercentages,
  PhilippineDeductions,
} from "@/types/deductions";

export type {
  BudgetAllocations,
  BudgetSplitPercentages,
  PhilippineDeductions,
} from "@/types/deductions";

/** Year label for mandatory government contribution schedules shown in the UI. */
export const GOVERNMENT_CONTRIBUTION_RATES_YEAR = 2026;

/** Monthly portion of ₱250,000 annual BIR exemption for self-employed filers. */
export const MONTHLY_BIR_EXEMPTION_PORTION = 250_000 / 12;

/** 2026 SSS (Circular 2024-006): employee share is 5% of MSC (₱5,000–₱35,000). */
const SSS_MIN_MSC = 5_000;
const SSS_MAX_MSC = 35_000;
const SSS_EMPLOYEE_RATE = 0.05;

/** 2026 PhilHealth (UHC Act): employee share is 2.5% of salary (₱10,000–₱100,000). */
const PHILHEALTH_SALARY_FLOOR = 10_000;
const PHILHEALTH_SALARY_CEILING = 100_000;
const PHILHEALTH_EMPLOYEE_RATE = 0.025;

/** 2026 Pag-IBIG (HDMF Circular 460): 2% of fund salary, ₱10,000 cap (max ₱200 EE). */
const PAGIBIG_MAX_FUND_SALARY = 10_000;
const PAGIBIG_LOW_SALARY_THRESHOLD = 1_500;
const PAGIBIG_MAX_EMPLOYEE_SHARE = 200;

/** Maps monthly compensation to MSC per the 2026 SSS contribution table. */
export const getSssMonthlySalaryCredit = (monthlyCompensation: number): number => {
  if (monthlyCompensation <= 0) {
    return 0;
  }

  if (monthlyCompensation < 5_250) {
    return SSS_MIN_MSC;
  }

  if (monthlyCompensation >= 34_750) {
    return SSS_MAX_MSC;
  }

  return (
    SSS_MIN_MSC +
    Math.ceil((monthlyCompensation - 5_249.99) / 500) * 500
  );
};

export const computeBirFlatTax = (grossMonthlyIncome: number): number => {
  if (grossMonthlyIncome <= MONTHLY_BIR_EXEMPTION_PORTION) {
    return 0;
  }
  return (grossMonthlyIncome - MONTHLY_BIR_EXEMPTION_PORTION) * 0.08;
};

/** SSS employee share. */
export const computeSssEmployeeShare = (grossMonthlyIncome: number): number => {
  if (grossMonthlyIncome <= 0) {
    return 0;
  }
  const msc = getSssMonthlySalaryCredit(grossMonthlyIncome);
  return msc * SSS_EMPLOYEE_RATE;
};

/** PhilHealth employee share. */
export const computePhilHealthEmployeeShare = (
  grossMonthlyIncome: number,
): number => {
  if (grossMonthlyIncome <= 0) {
    return 0;
  }
  const salaryBase = Math.min(
    Math.max(grossMonthlyIncome, PHILHEALTH_SALARY_FLOOR),
    PHILHEALTH_SALARY_CEILING,
  );
  return salaryBase * PHILHEALTH_EMPLOYEE_RATE;
};

/** Pag-IBIG employee share. */
export const computePagIbigEmployeeShare = (
  grossMonthlyIncome: number,
): number => {
  if (grossMonthlyIncome <= 0) {
    return 0;
  }
  const rate =
    grossMonthlyIncome <= PAGIBIG_LOW_SALARY_THRESHOLD ? 0.01 : 0.02;
  const fundSalary = Math.min(grossMonthlyIncome, PAGIBIG_MAX_FUND_SALARY);
  return Math.min(fundSalary * rate, PAGIBIG_MAX_EMPLOYEE_SHARE);
};

/** Government contributions only (excludes BIR). */
export const computeGovernmentEmployeeShare = (
  grossMonthlyIncome: number,
): number =>
  computeSssEmployeeShare(grossMonthlyIncome) +
  computePhilHealthEmployeeShare(grossMonthlyIncome) +
  computePagIbigEmployeeShare(grossMonthlyIncome);

export const computePhilippineDeductions = (
  grossMonthlyIncome: number,
): PhilippineDeductions => {
  if (grossMonthlyIncome <= 0) {
    return {
      birTax: 0,
      sss: 0,
      philHealth: 0,
      pagIbig: 0,
      governmentEmployeeShare: 0,
      total: 0,
    };
  }

  const birTax = computeBirFlatTax(grossMonthlyIncome);
  const sss = computeSssEmployeeShare(grossMonthlyIncome);
  const philHealth = computePhilHealthEmployeeShare(grossMonthlyIncome);
  const pagIbig = computePagIbigEmployeeShare(grossMonthlyIncome);
  const governmentEmployeeShare = sss + philHealth + pagIbig;

  return {
    birTax,
    sss,
    philHealth,
    pagIbig,
    governmentEmployeeShare,
    total: birTax,
  };
};

export const DEFAULT_BUDGET_SPLIT: BudgetSplitPercentages = {
  needs: 50,
  wants: 30,
  savings: 20,
};

export const computeBudgetAllocationsFromSplit = (
  trueNetTakeHomePay: number,
  split: BudgetSplitPercentages,
): BudgetAllocations => ({
  NEEDS: trueNetTakeHomePay * (split.needs / 100),
  WANTS: trueNetTakeHomePay * (split.wants / 100),
  SAVINGS: trueNetTakeHomePay * (split.savings / 100),
});

/** 50/30/20 capacity slices from true net take-home pay. */
export const computeBudgetAllocations = (
  trueNetTakeHomePay: number,
  split: BudgetSplitPercentages = DEFAULT_BUDGET_SPLIT,
): BudgetAllocations => computeBudgetAllocationsFromSplit(trueNetTakeHomePay, split);
