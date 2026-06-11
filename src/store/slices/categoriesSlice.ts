import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { PayCategory, PayCategoryKind } from "@/types/categories";

interface CategoriesState {
  income: PayCategory[];
  deduction: PayCategory[];
}

const initialState: CategoriesState = {
  income: [],
  deduction: [],
};

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    setCategories(_state, action: PayloadAction<CategoriesState>) {
      return action.payload;
    },
    addCategory(state, action: PayloadAction<PayCategory>) {
      const category = action.payload;
      const list = state[category.kind];
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
    removeCategory(
      state,
      action: PayloadAction<{ id: string; kind: PayCategoryKind }>,
    ) {
      state[action.payload.kind] = state[action.payload.kind].filter(
        (category) => category.id !== action.payload.id,
      );
    },
    replaceCategory(state, action: PayloadAction<PayCategory>) {
      const category = action.payload;
      state.income = state.income.filter((item) => item.id !== category.id);
      state.deduction = state.deduction.filter(
        (item) => item.id !== category.id,
      );
      const list = state[category.kind];
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
  },
});

export const { setCategories, addCategory, removeCategory, replaceCategory } =
  categoriesSlice.actions;
export const categoriesReducer = categoriesSlice.reducer;
