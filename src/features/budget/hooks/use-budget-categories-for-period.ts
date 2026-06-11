"use client";

import { useEffect, useRef } from "react";

import { useDashboardPeriod } from "@/contexts/dashboard-period-context";
import { fetchUserBudgetCategoriesForFilter } from "@/api/categories";
import { getCurrentVaultUser } from "@/api/user";
import { useAppDispatch, useAppSelector } from "@/store";
import { setBudgetCategories } from "@/store/slices/budgetCategoriesSlice";
import type { BudgetCategoriesByBucket } from "@/types/budgetCategories";

export const useBudgetCategoriesForPeriod = (): BudgetCategoriesByBucket => {
  const dispatch = useAppDispatch();
  const { filter } = useDashboardPeriod();
  const budgetCategories = useAppSelector((state) => state.budgetCategories);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const requestId = ++requestIdRef.current;

    const loadCategories = async () => {
      const user = await getCurrentVaultUser();
      if (!user || requestId !== requestIdRef.current) {
        return;
      }

      try {
        const categories = await fetchUserBudgetCategoriesForFilter(
          user.id,
          filter,
        );
        if (requestId !== requestIdRef.current) {
          return;
        }
        dispatch(setBudgetCategories(categories));
      } catch (error) {
        console.error("Failed to load budget categories for period:", error);
        // Keep existing budget categories in Redux on load failure.
      }
    };

    void loadCategories();
  }, [dispatch, filter]);

  return budgetCategories;
};
