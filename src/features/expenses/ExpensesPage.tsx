"use client";

import { Landmark, PiggyBank, Wallet } from "lucide-react";

import { AddExpenseModal } from "./add-expense-modal";
import { DeleteExpenseDialog } from "./delete-expense-dialog";
import { ExpenseCategoryLabel } from "@/components/shared/expense-category-label";
import { PeriodFiltersRow } from "@/components/shared/period-filters";
import { RecordActionsMenu } from "@/components/shared/record-actions-menu";
import { Button } from "@/components/ui/button";
import { VaultToast } from "@/components/ui/vault-toast";
import { useExpenses } from "@/features/expenses/hooks/use-expenses";
import {
  BUCKET_COLUMNS,
  EXPENSES_LEDGER_GRID_CLASS,
  EXPENSE_ACTIONS_TRIGGER_CLASS,
  EXPENSE_SUMMARY_COLUMNS,
  LEDGER_COLUMNS,
  MOBILE_BUCKET_TABS,
} from "@/features/expenses/config";

export const ExpensesPage = () => {
  const {
    formatMoneyFixed,
    formatDate,
    budgetCategories,
    addBucket,
    editingExpense,
    openMenuId,
    setOpenMenuId,
    activeMobileBucket,
    setActiveMobileBucket,
    periodLabel,
    categoryNameById,
    expensesByBucket,
    monthExpenses,
    totalSpentMonth,
    remainingCash,
    spendByBucket,
    closeModal,
    openAdd,
    openEdit,
    deletingExpense,
    setDeletingExpense,
    isDeletingExpense,
    openDeleteExpense,
    confirmDeleteExpense,
    toastMessage,
    toastVariant,
    setToastMessage,
  } = useExpenses();

  return (
    <>
      {toastMessage ? (
        <VaultToast
          message={toastMessage}
          variant={toastVariant}
          onClose={() => setToastMessage(null)}
        />
      ) : null}

      <div className="space-y-6">
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-5 sm:gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-start gap-6 sm:gap-8 md:flex-1 md:gap-12">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Total Expenses
                </p>
                <p className="mt-1 font-mono text-xl font-bold tabular-nums tracking-tight text-slate-900 sm:text-2xl">
                  {formatMoneyFixed(totalSpentMonth)}
                </p>
              </div>

              <div className="min-w-0 border-l border-slate-200 pl-6 sm:pl-8 md:pl-12">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Remaining Cash
                </p>
                <p className="mt-1 font-mono text-xl font-bold tabular-nums tracking-tight text-emerald-600 sm:text-2xl">
                  {formatMoneyFixed(remainingCash)}
                </p>
              </div>
            </div>

            <div className="flex w-full items-center justify-between gap-3 sm:justify-start sm:gap-5 md:w-auto md:shrink-0">
              {EXPENSE_SUMMARY_COLUMNS.map((column) => (
                <div
                  key={column.category}
                  className="flex min-w-11 flex-col items-center text-center"
                >
                  <span className="text-xs text-slate-500">{column.label}</span>
                  <span
                    className={`mt-0.5 text-xl font-bold tabular-nums ${column.valueClass}`}
                  >
                    {formatMoneyFixed(spendByBucket[column.category])}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-1 text-sm text-slate-500">{periodLabel}</p>
        </div>

        <PeriodFiltersRow />

        <div className="flex rounded-lg bg-slate-100 p-1 md:hidden">
          {MOBILE_BUCKET_TABS.map((tab) => {
            const isActive = activeMobileBucket === tab.category;
            const count = expensesByBucket[tab.category].length;

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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {BUCKET_COLUMNS.map((column) => {
            const items = expensesByBucket[column.category];
            const spentAmount = spendByBucket[column.category];
            const Icon = column.icon;
            const isMobileHidden = activeMobileBucket !== column.category;

            return (
              <div
                key={column.category}
                className={`flex h-full flex-col rounded-xl border border-slate-100 bg-white p-5 shadow-sm ${
                  isMobileHidden ? "hidden md:flex" : "flex"
                }`}
              >
                <span
                  className={`inline-flex w-fit items-center rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${column.badgeClass}`}
                >
                  {column.category}
                </span>

                <p className="mt-3 font-mono text-2xl font-bold tabular-nums text-slate-900">
                  {formatMoneyFixed(spentAmount)}
                </p>

                <Button
                  type="button"
                  className={`mt-4 w-full text-white ${column.buttonClass}`}
                  onClick={() => openAdd(column.category)}
                >
                  <Icon className="mr-2 size-4" />
                  {column.addLabel}
                </Button>

                {items.length > 0 ? (
                  <ul className="mt-4 flex-1 space-y-2">
                    {items.map((expense) => (
                      <li
                        key={expense.id}
                        className="vault-expense-item-card flex items-center justify-between gap-2 rounded-lg px-3 py-2.5"
                      >
                        <div className="min-w-0">
                          <ExpenseCategoryLabel
                            expense={expense}
                            budgetCategories={budgetCategories}
                            bucket={column.category}
                            categoryNameById={categoryNameById}
                          />
                          <p className="mt-1.5 text-[11px] text-slate-500">
                            {formatDate(expense.timestamp)}
                          </p>
                        </div>
                        <span className="shrink-0 font-mono text-sm font-semibold tabular-nums text-rose-600">
                          -{formatMoneyFixed(expense.amount)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-6 flex-1 text-center text-sm text-slate-400">
                    <p>No expenses yet.</p>
                    <p className="mt-1">Click the button above to add one.</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="min-w-0 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Recent Expenses
            </h2>
          </div>

          {monthExpenses.length > 0 ? (
            <div className="overflow-x-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300">
              <div className="min-w-[42rem] lg:min-w-full">
                <div
                  className={`vault-ledger-table-header ${EXPENSES_LEDGER_GRID_CLASS} px-5 py-2.5`}
                >
                  {LEDGER_COLUMNS.map((heading) => (
                    <span
                      key={heading}
                      className={`whitespace-nowrap text-[10px] font-semibold uppercase tracking-wide text-slate-500 ${
                        heading === "Amount" ? "text-right" : ""
                      }`}
                    >
                      {heading}
                    </span>
                  ))}
                  <span className="sr-only">Actions</span>
                </div>
                <div className="vault-ledger-table-rows divide-y divide-slate-100">
                  {monthExpenses.map((expense) => (
                    <div
                      key={expense.id}
                      className={`${EXPENSES_LEDGER_GRID_CLASS} px-5 py-3.5 text-sm hover:bg-slate-50/60`}
                    >
                      <p className="truncate font-medium text-slate-800">
                        {expense.merchantOrLabel}
                      </p>
                      <ExpenseCategoryLabel
                        expense={expense}
                        budgetCategories={budgetCategories}
                        bucket={expense.category}
                        categoryNameById={categoryNameById}
                      />
                      <p className="truncate text-slate-600">
                        {expense.category}
                      </p>
                      <p className="whitespace-nowrap text-slate-600">
                        {formatDate(expense.timestamp)}
                      </p>
                      <p className="whitespace-nowrap text-right font-semibold tabular-nums text-rose-600">
                        -{formatMoneyFixed(expense.amount)}
                      </p>
                      <RecordActionsMenu
                        isOpen={openMenuId === expense.id}
                        onOpenChange={(isOpen) =>
                          setOpenMenuId(isOpen ? expense.id : null)
                        }
                        onEdit={() => {
                          setOpenMenuId(null);
                          openEdit(expense);
                        }}
                        onDelete={() => openDeleteExpense(expense)}
                        triggerClassName={EXPENSE_ACTIONS_TRIGGER_CLASS}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[200px] flex-col items-center justify-center px-6 py-12 text-center">
              <p className="text-sm text-slate-500">
                No expenses logged this month yet.
              </p>
            </div>
          )}
        </div>
      </div>

      <AddExpenseModal
        open={Boolean(addBucket)}
        bucket={addBucket}
        expense={editingExpense}
        onClose={closeModal}
        onSuccess={setToastMessage}
      />

      <DeleteExpenseDialog
        open={Boolean(deletingExpense)}
        expenseLabel={deletingExpense?.merchantOrLabel || "Expense"}
        isDeleting={isDeletingExpense}
        onClose={() => setDeletingExpense(null)}
        onConfirm={() => void confirmDeleteExpense()}
      />
    </>
  );
};
