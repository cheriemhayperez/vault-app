"use client";

import Link from "next/link";
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  FileText,
  Filter,
  Plus,
  RefreshCw,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import type { FilterSelectOption } from "@/components/shared/filter-select-menu";
import { FilterSelectMenu } from "@/components/shared/filter-select-menu";
import { FormErrorBanner } from "@/components/shared/form-error-banner";
import { AdditionalPayModal } from "./additional-pay-modal";
import { DeleteRecordDialog } from "./delete-record-dialog";
import { PayRecordModal } from "./pay-record-modal";
import { QuickDeductionModal } from "./quick-deduction-modal";
import { PayRecordDirectionIcon } from "@/components/shared/pay-record-direction-icon";
import { RecordCategoryBadge } from "@/components/shared/record-category-badge";
import { RecordActionsMenu } from "@/components/shared/record-actions-menu";
import { VaultPageHeaderActions } from "@/components/layout/vault-page-header-actions";
import { Button } from "@/components/ui/button";
import { VaultToast } from "@/components/ui/vault-toast";
import {
  type RecordsTimeFilter,
  useRecords,
} from "@/features/records/hooks/use-records";
import {
  formatSignedAmount,
  LEDGER_COLUMNS,
  RECORDS_FILTER_CONTROL_CLASS,
  RECORDS_LEDGER_GRID_CLASS,
  TIME_FILTER_OPTIONS,
} from "@/features/records/config";
import {
  getCategoryColorSwatchClass,
  getCategoryQuickActionClassName,
} from "@/types/categories";
import {
  getRecordRowDescription,
  isEmptyRecordRowDescription,
} from "@/utils/payRecords";

export const RecordsPage = () => {
  const {
    formatMoneyFixed,
    formatDate,
    income,
    deductionCategories,
    isAddModalOpen,
    isAdditionalPayOpen,
    quickDeductionCategory,
    editingRecord,
    deletingRecord,
    openMenuId,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    timeFilter,
    setTimeFilter,
    collapsedMonths,
    isSyncing,
    syncMessage,
    toastMessage,
    toastVariant,
    syncError,
    categoryFilterOptions,
    filteredRecords,
    totalIncome,
    totalDeductions,
    netFilteredTotal,
    monthGroups,
    hasRecords,
    hasFilteredRecords,
    monthCount,
    toggleMonth,
    openAddRecord,
    openQuickDeduction,
    closeAddRecord,
    closeQuickDeduction,
    setIsAdditionalPayOpen,
    setEditingRecord,
    setDeletingRecord,
    setOpenMenuId,
    setSyncMessage,
    setToastMessage,
    handleSyncRecords,
    handleConfirmDelete,
    isDeletingRecord,
  } = useRecords();

  const isAnyRecordModalOpen =
    isAddModalOpen ||
    isAdditionalPayOpen ||
    Boolean(quickDeductionCategory) ||
    Boolean(editingRecord) ||
    Boolean(deletingRecord);

  return (
    <>
      {!isAnyRecordModalOpen && (syncMessage || toastMessage) ? (
        <VaultToast
          message={syncMessage ?? toastMessage ?? ""}
          variant={syncMessage ? "success" : toastVariant}
          onClose={() => {
            setSyncMessage(null);
            setToastMessage(null);
          }}
        />
      ) : null}

      <VaultPageHeaderActions>
        <Button
          type="button"
          variant="outline"
          aria-busy={isSyncing}
          className={`transition-all duration-200 ${
            isSyncing
              ? "cursor-wait border-violet-300 bg-violet-50 text-violet-700 shadow-sm ring-2 ring-violet-200/50 disabled:opacity-100"
              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
          }`}
          disabled={isSyncing}
          title="Reload pay records from the server"
          onClick={handleSyncRecords}
        >
          <RefreshCw
            className={`mr-2 size-4 shrink-0 transition-transform ${
              isSyncing ? "animate-spin text-violet-600" : ""
            }`}
          />
          {isSyncing ? "Syncing…" : "Sync Linked Dates"}
        </Button>
        <Button
          type="button"
          className="bg-violet-600 hover:bg-violet-700"
          onClick={openAddRecord}
        >
          <Plus className="mr-2 size-4" />
          Add Record
        </Button>
      </VaultPageHeaderActions>

      <div className="w-full min-w-0 space-y-6">
        {syncError ? (
          <FormErrorBanner variant="page" message={syncError} />
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Quick Deductions
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Add common deductions quickly
                </p>
              </div>
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg vault-dashboard-icon--red">
                <TrendingDown className="size-4" />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {deductionCategories.length > 0 ? (
                deductionCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => openQuickDeduction(category)}
                    className={getCategoryQuickActionClassName(category.color)}
                  >
                    <span
                      className={`size-2 shrink-0 rounded-full ${getCategoryColorSwatchClass(category.color)}`}
                    />
                    {category.name}
                  </button>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  No deduction categories found.{" "}
                  <Link
                    href="/categories"
                    className="font-medium text-violet-600 hover:text-violet-700"
                  >
                    Create one first
                  </Link>
                  .
                </p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Additional Income
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Add bonuses, overtime, and more
                </p>
                <button
                  type="button"
                  className="vault-field-control vault-additional-pay-btn mt-3 inline-flex h-8 items-center px-3 text-xs font-medium outline-none focus:ring-0"
                  onClick={() => setIsAdditionalPayOpen(true)}
                >
                  <Plus className="vault-additional-pay-btn-icon mr-1.5 size-3.5" />
                  Add Additional Pay
                </button>
              </div>
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg vault-dashboard-icon--emerald">
                <TrendingUp className="size-4" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="overflow-visible rounded-xl border border-slate-100 bg-white shadow-sm">
              <div className="flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:gap-3">
                <div className="flex items-center gap-3 md:contents">
                  <span className="flex h-9 shrink-0 items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <Filter className="size-4" strokeWidth={2} />
                    Filters
                  </span>

                  <div className="relative min-w-0 flex-1 md:w-64 md:flex-none md:shrink-0">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="search"
                      placeholder="Search records..."
                      value={searchQuery}
                      onChange={(event) => {
                        setSearchQuery(event.target.value);
                      }}
                      className={`${RECORDS_FILTER_CONTROL_CLASS} w-full bg-slate-50 pl-9 pr-3 placeholder:text-slate-400`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 md:contents">
                  <FilterSelectMenu
                    value={categoryFilter}
                    options={categoryFilterOptions}
                    onChange={(value) => {
                      setCategoryFilter(value);
                    }}
                    ariaLabel="Category filter"
                    minWidthClass="min-w-0 w-full md:min-w-38 md:w-auto md:shrink-0"
                  />

                  <FilterSelectMenu
                    value={timeFilter}
                    options={TIME_FILTER_OPTIONS}
                    onChange={(value) => {
                      setTimeFilter(value as RecordsTimeFilter);
                    }}
                    triggerPrefix={<Calendar className="size-3.5 text-slate-400" />}
                    ariaLabel="Time period filter"
                    minWidthClass="min-w-0 w-full md:min-w-34 md:w-auto md:shrink-0"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4 border-t border-slate-100 px-4 py-4 md:flex-row md:items-center md:justify-between md:gap-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-8">
                  <div className="grid grid-cols-2 gap-4 md:contents">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Total Income
                      </p>
                      <p className="mt-0.5 font-mono text-2xl font-bold tabular-nums text-emerald-600">
                        +{formatMoneyFixed(totalIncome)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Total Deductions
                      </p>
                      <p className="mt-0.5 font-mono text-2xl font-bold tabular-nums text-rose-600">
                        -{formatMoneyFixed(totalDeductions)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-end justify-between gap-4 md:contents">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Net
                      </p>
                      <p className="mt-0.5 font-mono text-2xl font-bold tabular-nums text-slate-900">
                        {formatMoneyFixed(netFilteredTotal)}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm text-slate-500 md:hidden">
                      {monthCount} {monthCount === 1 ? "month" : "months"} ·{" "}
                      {filteredRecords.length}{" "}
                      {filteredRecords.length === 1 ? "record" : "records"}
                    </p>
                  </div>
                </div>
                <p className="hidden shrink-0 text-sm text-slate-500 md:block">
                  {monthCount} {monthCount === 1 ? "month" : "months"} ·{" "}
                  {filteredRecords.length}{" "}
                  {filteredRecords.length === 1 ? "record" : "records"}
                </p>
              </div>
            </div>

          <div className="space-y-4">
            {hasFilteredRecords ? (
              monthGroups.map((group) => {
                const isCollapsed = collapsedMonths[group.key] ?? false;

                return (
                  <div
                    key={group.key}
                    className="overflow-visible rounded-xl border border-slate-100 bg-white shadow-sm"
                  >
                    <button
                      type="button"
                      onClick={() => toggleMonth(group.key)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-slate-50/80 sm:gap-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-md vault-dashboard-icon--emerald">
                          {isCollapsed ? (
                            <ChevronRight className="size-4" />
                          ) : (
                            <ChevronDown className="size-4" />
                          )}
                        </span>
                        <div className="flex min-w-0 items-center gap-2">
                          <p className="truncate font-semibold text-slate-900">
                            {group.label}
                          </p>
                          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                            {group.fullRecordCount}{" "}
                            {group.fullRecordCount === 1
                              ? "record"
                              : "records"}
                          </span>
                        </div>
                      </div>
                      <p className="shrink-0 text-sm tabular-nums">
                        <span className="font-medium text-slate-500">Total: </span>
                        <span
                          className={`font-semibold ${
                            group.netTotal >= 0
                              ? "text-emerald-600"
                              : "text-red-600"
                          }`}
                        >
                          {group.netTotal >= 0 ? "+" : ""}
                          {formatMoneyFixed(Math.abs(group.netTotal))}
                        </span>
                      </p>
                    </button>

                    {!isCollapsed ? (
                      <div className="overflow-x-auto md:overflow-visible">
                          <div
                            className={`vault-ledger-table-header vault-ledger-table-header--border-top ${RECORDS_LEDGER_GRID_CLASS} px-4 py-2.5`}
                          >
                            {LEDGER_COLUMNS.map((column) => (
                              <span
                                key={column.label}
                                className={`text-[10px] font-semibold uppercase tracking-wide text-slate-500 ${column.headerClass}`}
                              >
                                {column.label}
                              </span>
                            ))}
                            <span className="sr-only">Actions</span>
                          </div>

                          <div className="vault-ledger-table-rows divide-y divide-slate-100">
                            {group.records.map((record) => (
                              <div
                                key={record.id}
                                className={`${RECORDS_LEDGER_GRID_CLASS} px-4 py-3.5 text-sm hover:bg-slate-50/60`}
                              >
                                <div className="flex justify-center">
                                  <PayRecordDirectionIcon
                                    direction={record.direction}
                                  />
                                </div>
                                <p
                                  className={`min-w-0 truncate ${
                                    isEmptyRecordRowDescription(record)
                                      ? "text-slate-400"
                                      : "font-medium text-slate-800"
                                  }`}
                                >
                                  {getRecordRowDescription(record)}
                                </p>
                                <RecordCategoryBadge
                                  record={record}
                                  incomeCategories={income}
                                  deductionCategories={deductionCategories}
                                />
                                <p className="whitespace-nowrap text-slate-600">
                                  {formatDate(record.timestamp)}
                                </p>
                                <p
                                  className={`whitespace-nowrap text-right font-semibold tabular-nums ${
                                    record.direction === "CREDIT"
                                      ? "text-emerald-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {formatSignedAmount(record)}
                                </p>
                                <div className="flex justify-end">
                                  <RecordActionsMenu
                                    isOpen={openMenuId === record.id}
                                    onOpenChange={(isOpen) =>
                                      setOpenMenuId(isOpen ? record.id : null)
                                    }
                                    onEdit={() => setEditingRecord(record)}
                                    onDelete={() => setDeletingRecord(record)}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                      </div>
                    ) : null}
                  </div>
                );
              })
            ) : hasRecords ? (
              <div className="overflow-visible rounded-xl border border-slate-100 bg-white shadow-sm">
                <div className="flex min-h-[240px] flex-col items-center justify-center px-6 py-16 text-center">
                  <p className="text-sm font-medium text-slate-700">
                    No records match your filters
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Try adjusting search or filters.
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-visible rounded-xl border border-slate-100 bg-white shadow-sm">
                <div className="flex min-h-[400px] flex-col items-center justify-center px-6 py-20 text-center">
                  <div className="flex size-16 items-center justify-center rounded-2xl bg-slate-100">
                    <FileText className="size-8 text-slate-400" />
                  </div>
                  <p className="mt-4 text-base font-semibold tracking-tight text-slate-900">
                    No records found
                  </p>
                  <p className="mt-1 text-sm tracking-tight text-slate-500">
                    Add your first pay record to get started.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      <PayRecordModal
        open={isAddModalOpen}
        mode="add"
        onClose={closeAddRecord}
        onSuccess={() => setToastMessage("Record added successfully")}
      />

      <AdditionalPayModal
        open={isAdditionalPayOpen}
        onClose={() => setIsAdditionalPayOpen(false)}
        onSuccess={() =>
          setToastMessage("Additional pay recorded successfully")
        }
      />

      <QuickDeductionModal
        open={Boolean(quickDeductionCategory)}
        category={quickDeductionCategory}
        onClose={closeQuickDeduction}
        onSuccess={() => setToastMessage("Deduction added successfully")}
      />

      <PayRecordModal
        open={Boolean(editingRecord)}
        mode="edit"
        record={editingRecord}
        onClose={() => setEditingRecord(null)}
        onSuccess={() => setToastMessage("Record updated successfully")}
      />

      <DeleteRecordDialog
        open={Boolean(deletingRecord)}
        isDeleting={isDeletingRecord}
        onClose={() => setDeletingRecord(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};
