"use client";

import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  Pencil,
  Plus,
  Settings,
  Trash2,
} from "lucide-react";

import { AddBudgetCategoryModal } from "./add-budget-category-modal";
import { PeriodFiltersRow } from "@/components/shared/period-filters";
import { BudgetSettingsModal } from "./budget-settings-modal";
import { VaultPageHeaderActions } from "@/components/layout/vault-page-header-actions";
import { DeleteCategoryDialog } from "@/features/categories/delete-category-dialog";
import { Button } from "@/components/ui/button";
import { VaultToast } from "@/components/ui/vault-toast";
import { Progress } from "@/components/ui/progress";
import { useBudget } from "@/features/budget/hooks/use-budget";
import {
  BUCKET_CONFIG,
  MOBILE_BUCKET_TABS,
  MOBILE_BUCKET_TINT,
  NET_PAY_SPLIT_COLUMNS,
} from "@/features/budget/config";
import { getBudgetCategoryColorSwatchClass } from "@/types/budgetCategories";
import type { BudgetCategory } from "@/types/financial";
import {
  formatBudgetUsageLabel,
  getBudgetLeftAmount,
  getBudgetUsagePercent,
  isBudgetOverTarget,
} from "@/utils/budgetDisplay";

export const BudgetPage = () => {
  const {
    filter,
    formatMoneyFixed,
    formatMoneySigned,
    budgetSplitPercentages,
    budgetCategories,
    isSettingsOpen,
    setIsSettingsOpen,
    deletingCategory,
    setDeletingCategory,
    isDeletingCategory,
    collapsedBuckets,
    addCategoryBucket,
    editingCategory,
    activeMobileBucket,
    setActiveMobileBucket,
    spendByCategory,
    periodBudget,
    isNetPayNegative,
    openAddCategory,
    openEditCategory,
    closeCategoryModal,
    toggleBucket,
    focusMobileBucket,
    confirmDeleteCategory,
    toastMessage,
    toastVariant,
    setToastMessage,
  } = useBudget();

  return (
    <>
      {toastMessage ? (
        <VaultToast
          message={toastMessage}
          variant={toastVariant}
          onClose={() => setToastMessage(null)}
        />
      ) : null}

      <VaultPageHeaderActions>
        <Button
          type="button"
          variant="outline"
          className="vault-budget-settings-btn"
          onClick={() => setIsSettingsOpen(true)}
        >
          <Settings className="mr-2 size-4" />
          Settings
        </Button>
      </VaultPageHeaderActions>

      <div className="space-y-6">
        <div className="vault-budget-net-pay-card rounded-xl border border-slate-100 p-5 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Net Pay
          </p>
          <div className="mt-1 flex items-center justify-between gap-4 sm:gap-6">
            <p
              className={`min-w-0 flex-1 font-mono text-xl font-bold tabular-nums tracking-tight sm:text-2xl ${
                isNetPayNegative ? "text-red-600" : "text-slate-900"
              }`}
            >
              {formatMoneySigned(periodBudget.netPay)}
            </p>
            <div className="flex shrink-0 items-center gap-3 sm:gap-5">
              {NET_PAY_SPLIT_COLUMNS.map((column) => {
                const percent = budgetSplitPercentages[column.splitKey];
                const handleClick = () => {
                  focusMobileBucket(column.category);
                };
                const content = (
                  <>
                    <span className="text-xs text-slate-500">{column.label}</span>
                    <span className="mt-0.5 text-sm font-bold tabular-nums text-slate-900">
                      {percent}%
                    </span>
                  </>
                );

                return (
                  <div key={column.category}>
                    <div className="hidden min-w-12 flex-col items-center text-center md:flex">
                      {content}
                    </div>
                    <button
                      type="button"
                      onClick={handleClick}
                      className="flex min-w-11 flex-col items-center text-center transition active:opacity-70 md:hidden"
                      aria-label={`${column.label} ${percent}%`}
                    >
                      {content}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="mt-1 text-sm text-slate-500">{periodBudget.label}</p>
        </div>

        <PeriodFiltersRow />

        <div className="flex rounded-lg bg-slate-100 p-1 md:hidden">
          {MOBILE_BUCKET_TABS.map((tab) => {
            const isActive = activeMobileBucket === tab.category;
            const count = budgetCategories[tab.category].length;

            return (
              <button
                key={tab.category}
                type="button"
                onClick={() => setActiveMobileBucket(tab.category)}
                className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                {tab.label}{" "}
                <span className="text-slate-400">({count})</span>
              </button>
            );
          })}
        </div>

        <div
          key={`${filter.periodType}-${filter.year}-${filter.month}-${filter.endMonth}`}
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          {BUCKET_CONFIG.map((bucket) => {
            const isMobileHidden = activeMobileBucket !== bucket.category;
            const targetAmount = periodBudget.bucketAllocations[bucket.category];
            const spentAmount = spendByCategory[bucket.category];
            const leftAmount = getBudgetLeftAmount(targetAmount, spentAmount);
            const ratio = getBudgetUsagePercent(targetAmount, spentAmount);
            const isOverBudget = isBudgetOverTarget(targetAmount, spentAmount);
            const isCollapsed = collapsedBuckets[bucket.category];
            const items = budgetCategories[bucket.category];

            return (
              <div
                key={bucket.category}
                className={`vault-budget-bucket-card flex h-full flex-col rounded-xl border border-slate-100 border-l-4 shadow-sm ${bucket.accent} ${MOBILE_BUCKET_TINT[bucket.category]} ${
                  isMobileHidden ? "hidden md:flex" : "flex"
                }`}
              >
                <div className="flex flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`vault-budget-bucket-badge ${bucket.badgeClass}`}
                      >
                        {bucket.category}
                      </span>
                      <span className="vault-budget-bucket-split">
                        {budgetSplitPercentages[bucket.splitKey]}%
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleBucket(bucket.category)}
                      className="vault-budget-collapse-btn flex size-8 items-center justify-center rounded-lg"
                      aria-label={
                        isCollapsed ? "Expand section" : "Collapse section"
                      }
                    >
                      {isCollapsed ? (
                        <ChevronDown className="size-4" />
                      ) : (
                        <ChevronUp className="size-4" />
                      )}
                    </button>
                  </div>

                  <p
                    className={`mt-3 font-mono text-2xl font-bold tabular-nums ${
                      targetAmount < 0 ? "text-red-600" : "text-slate-900"
                    }`}
                  >
                    {formatMoneySigned(targetAmount)}
                  </p>

                  <div className="mt-4 flex flex-col">
                    <Progress
                      value={ratio}
                      className="h-1.5 bg-slate-100"
                      indicatorClassName={bucket.bar}
                    />
                    <p
                      className={`vault-budget-bucket-percent mt-2 text-xs font-medium${
                        isOverBudget
                          ? " vault-budget-bucket-percent--over"
                          : ""
                      }`}
                    >
                      {formatBudgetUsageLabel(targetAmount, spentAmount)}
                    </p>
                    <div className="mt-1">
                      <div className="flex justify-between text-xs">
                        <span className="vault-budget-bucket-meta">
                          {bucket.spentLabel}:{" "}
                          <span className="vault-budget-bucket-meta-value">
                            {formatMoneyFixed(spentAmount)}
                          </span>
                        </span>
                        <span className="vault-budget-bucket-meta">
                          {bucket.leftLabel}:{" "}
                          <span className="vault-budget-bucket-meta-value">
                            {formatMoneySigned(leftAmount)}
                          </span>
                        </span>
                      </div>
                      {!isCollapsed ? (
                        <div
                          className="vault-budget-bucket-divider"
                          aria-hidden="true"
                        />
                      ) : null}
                    </div>

                    {!isCollapsed ? (
                      <>
                      {items.length > 0 ? (
                        <div className="mt-5">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            Categories
                          </p>
                          <ul className="mt-3 divide-y divide-slate-100 md:space-y-3 md:divide-y-0">
                            {items.map((item) => {
                              const allocated =
                                targetAmount * (item.sharePercent / 100);
                              const itemSpent = 0;
                              const itemOverBudget = isBudgetOverTarget(
                                allocated,
                                itemSpent,
                              );

                              return (
                                <li key={item.id}>
                                  <button
                                    type="button"
                                    onClick={() => openEditCategory(item)}
                                    className="flex w-full flex-col py-3 text-left transition active:bg-white/60 md:hidden"
                                  >
                                    <div className="flex min-w-0 items-center gap-2">
                                      <span
                                        className={`size-2.5 shrink-0 rounded-full ${getBudgetCategoryColorSwatchClass(item.color)}`}
                                      />
                                      <span className="truncate text-sm font-semibold text-slate-900">
                                        {item.name}
                                      </span>
                                      <span className="text-sm text-slate-500">
                                        {item.sharePercent}%
                                      </span>
                                    </div>
                                    <p
                                      className={`mt-2 font-mono text-lg font-bold tabular-nums ${
                                        allocated < 0
                                          ? "text-red-600"
                                          : "text-slate-900"
                                      }`}
                                    >
                                      {formatMoneySigned(allocated)}
                                    </p>
                                    <div className="mt-2 flex items-center justify-between text-xs">
                                      <span
                                        className={
                                          itemOverBudget
                                            ? "font-medium text-emerald-600"
                                            : "text-slate-500"
                                        }
                                      >
                                        {formatBudgetUsageLabel(
                                          allocated,
                                          itemSpent,
                                        )}
                                      </span>
                                      <span className="text-slate-500">
                                        {bucket.spentLabel}:{" "}
                                        {formatMoneyFixed(itemSpent)}
                                      </span>
                                    </div>
                                  </button>

                                  <div className="vault-budget-category-card hidden rounded-lg border border-slate-100 p-4 md:block">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex min-w-0 items-center gap-2">
                                        <span
                                          className={`size-2.5 shrink-0 rounded-full ${getBudgetCategoryColorSwatchClass(item.color)}`}
                                        />
                                        <span className="truncate text-sm font-semibold text-slate-900">
                                          {item.name}
                                        </span>
                                        <span className="text-sm text-slate-500">
                                          {item.sharePercent}%
                                        </span>
                                      </div>
                                      <div className="flex shrink-0 items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => openEditCategory(item)}
                                          className="vault-budget-category-edit-btn rounded-lg p-2"
                                          aria-label={`Edit ${item.name}`}
                                        >
                                          <Pencil className="size-4" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setDeletingCategory(item)
                                          }
                                          className="vault-budget-category-delete-btn rounded-lg p-2"
                                          aria-label={`Delete ${item.name}`}
                                        >
                                          <Trash2 className="size-4" />
                                        </button>
                                      </div>
                                    </div>
                                    <p
                                      className={`mt-2 font-mono text-lg font-bold tabular-nums ${
                                        allocated < 0
                                          ? "text-red-600"
                                          : "text-slate-900"
                                      }`}
                                    >
                                      {formatMoneySigned(allocated)}
                                    </p>
                                    <div className="mt-2 flex items-center justify-between text-xs">
                                      <span
                                        className={
                                          itemOverBudget
                                            ? "font-medium text-emerald-600"
                                            : "text-slate-500"
                                        }
                                      >
                                        {formatBudgetUsageLabel(
                                          allocated,
                                          itemSpent,
                                        )}
                                      </span>
                                      <span className="text-slate-500">
                                        {bucket.spentLabel}:{" "}
                                        {formatMoneyFixed(itemSpent)}
                                      </span>
                                    </div>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      ) : null}

                      <div className="mt-5">
                        <Button
                          type="button"
                          variant="outline"
                          className="vault-budget-add-category-btn h-10 w-full text-sm"
                          onClick={() => openAddCategory(bucket.category)}
                        >
                          <Plus className="mr-2 size-4" />
                          Add Category
                        </Button>

                        <div className="mt-4 text-center">
                          <Link
                            href={bucket.expensesHref}
                            className="vault-budget-view-link"
                          >
                            {bucket.category === "SAVINGS"
                              ? "View Savings →"
                              : "View Expenses →"}
                          </Link>
                        </div>
                      </div>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AddBudgetCategoryModal
        open={Boolean(addCategoryBucket)}
        bucket={addCategoryBucket}
        editingCategory={editingCategory}
        onClose={closeCategoryModal}
        onSuccess={setToastMessage}
      />

      <BudgetSettingsModal
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSuccess={() =>
          setToastMessage("Budget settings saved successfully")
        }
      />

      <DeleteCategoryDialog
        open={Boolean(deletingCategory)}
        categoryName={deletingCategory?.name ?? ""}
        isDeleting={isDeletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={() => void confirmDeleteCategory()}
      />
    </>
  );
};
