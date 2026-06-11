import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, useStore } from "react-redux";

import { budgetCategoriesReducer } from "@/store/slices/budgetCategoriesSlice";
import { categoriesReducer } from "@/store/slices/categoriesSlice";
import { financialReducer } from "@/store/slices/financialSlice";
import { remindersReducer } from "@/store/slices/remindersSlice";

export const store = configureStore({
  reducer: {
    financial: financialReducer,
    categories: categoriesReducer,
    budgetCategories: budgetCategoriesReducer,
    reminders: remindersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();
