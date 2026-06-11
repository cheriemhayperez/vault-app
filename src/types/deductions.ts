export interface PhilippineDeductions {
  birTax: number;
  sss: number;
  philHealth: number;
  pagIbig: number;
  governmentEmployeeShare: number;
  total: number;
}

export interface BudgetAllocations {
  NEEDS: number;
  WANTS: number;
  SAVINGS: number;
}

export interface BudgetSplitPercentages {
  needs: number;
  wants: number;
  savings: number;
}
