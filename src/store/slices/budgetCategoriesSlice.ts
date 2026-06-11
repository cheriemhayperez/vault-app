import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type {
  BudgetCategoriesByBucket,
  BudgetExpenseCategory,
} from "@/types/budgetCategories";
import type { BudgetCategory } from "@/types/financial";

const initialState: BudgetCategoriesByBucket = {
  NEEDS: [],
  WANTS: [],
  SAVINGS: [],
};

const budgetCategoriesSlice = createSlice({
  name: "budgetCategories",
  initialState,
  reducers: {
    setBudgetCategories(
      _state,
      action: PayloadAction<BudgetCategoriesByBucket>,
    ) {
      return action.payload;
    },
    addBudgetCategory(state, action: PayloadAction<BudgetExpenseCategory>) {
      const category = action.payload;
      const list = state[category.bucket];
      if (
        list.some(
          (existing) =>
            existing.id === category.id ||
            existing.name.toLowerCase() === category.name.toLowerCase(),
        )
      ) {
        return;
      }
      list.push(category);
    },
    replaceBudgetCategory(
      state,
      action: PayloadAction<BudgetExpenseCategory>,
    ) {
      const category = action.payload;
      (["NEEDS", "WANTS", "SAVINGS"] as const).forEach((bucket) => {
        state[bucket] = state[bucket].filter((item) => item.id !== category.id);
      });
      const list = state[category.bucket];
      if (
        list.some(
          (existing) =>
            existing.id !== category.id &&
            existing.name.toLowerCase() === category.name.toLowerCase(),
        )
      ) {
        return;
      }
      list.push(category);
    },
    removeBudgetCategory(
      state,
      action: PayloadAction<{ id: string; bucket: BudgetCategory }>,
    ) {
      state[action.payload.bucket] = state[action.payload.bucket].filter(
        (category) => category.id !== action.payload.id,
      );
    },
  },
});

export const {
  setBudgetCategories,
  addBudgetCategory,
  replaceBudgetCategory,
  removeBudgetCategory,
} = budgetCategoriesSlice.actions;
export const budgetCategoriesReducer = budgetCategoriesSlice.reducer;
