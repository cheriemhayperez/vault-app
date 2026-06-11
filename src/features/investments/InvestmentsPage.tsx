"use client";

import { Download, PieChart } from "lucide-react";

import { DeleteInvestmentDialog } from "./delete-investment-dialog";
import { AddInvestmentModal } from "./add-investment-modal";
import { AddInvestmentReturnModal } from "./add-investment-return-modal";
import { EditInvestmentReturnModal } from "./edit-investment-return-modal";
import { RecordInvestmentIncomeModal } from "./record-investment-income-modal";
import { InvestmentListItem } from "@/components/shared/investment-list-item";
import { InvestmentPortfolioCharts } from "./investment-portfolio-charts";
import { PeriodFiltersRow } from "@/components/shared/period-filters";
import { Button } from "@/components/ui/button";
import { VaultToast } from "@/components/ui/vault-toast";
import { useInvestments } from "@/features/investments/hooks/use-investments";
import { METRIC_CARDS } from "@/features/investments/config";

import styles from "./InvestmentsPage.module.css";

export const InvestmentsPage = () => {
  const {
    investments,
    modalInvestment,
    isAddOpen,
    returnTarget,
    editReturnTarget,
    incomeTarget,
    openMenuId,
    deletingInvestment,
    isDeletingInvestment,
    toastMessage,
    toastVariant,
    parentInvestments,
    metrics,
    returnsData,
    growthData,
    hasInvestments,
    setIsAddOpen,
    setModalInvestment,
    setReturnTarget,
    setEditReturnTarget,
    setIncomeTarget,
    setOpenMenuId,
    setDeletingInvestment,
    setToastMessage,
    openCreate,
    openEdit,
    handleSaveInvestment,
    handleDeleteInvestment,
    handleExport,
    handleRecordIncome,
    handleReturnSaved,
    openEditReturn,
    handleEditReturnSaved,
    handleIncomeSaved,
    formatMetricValue,
  } = useInvestments();

  return (
    <>
      {toastMessage ? (
        <VaultToast
          message={toastMessage}
          variant={toastVariant}
          onClose={() => setToastMessage(null)}
        />
      ) : null}

      <div className={styles.page}>
        <div className={styles.headerRow}>
          <div className={styles.header}>
            <h1 className={styles.title}>Investments</h1>
            <p className={styles.subtitle}>
              Track your investment portfolio and returns
            </p>
          </div>
          <PeriodFiltersRow className="shrink-0 sm:pt-0.5" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {METRIC_CARDS.map((card) => {
            const Icon = card.icon;
            const rawValue = metrics[card.valueKey];
            const displayValue = formatMetricValue(card.valueKey, rawValue);

            return (
              <div
                key={card.title}
                className="relative overflow-hidden rounded-xl border border-slate-100 bg-white p-5 shadow-sm"
              >
                <span className="absolute left-0 top-0 h-full w-1 bg-violet-500" />
                <div className="flex items-start justify-between pl-2">
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      {card.title}
                    </p>
                    <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-slate-900">
                      {displayValue}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{card.subtext}</p>
                    {card.valueKey === "profit" && !hasInvestments ? (
                      <p className="mt-1 text-xs text-vault-accent">
                        +0.00% from last month
                      </p>
                    ) : null}
                    {card.valueKey === "profit" &&
                    hasInvestments &&
                    metrics.capital > 0 ? (
                      <p className="mt-1 text-xs text-slate-500">
                        {((rawValue / metrics.capital) * 100).toFixed(2)}% from
                        capital
                      </p>
                    ) : null}
                  </div>
                  <Icon className="size-4 text-violet-600" />
                </div>
              </div>
            );
          })}
        </div>

        {hasInvestments ? (
          <InvestmentPortfolioCharts
            returnsData={returnsData}
            growthData={growthData}
            totalReturns={metrics.payouts}
            totalCapital={metrics.capital}
          />
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            All Investments
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {hasInvestments ? (
              <>
                <span className="text-sm text-slate-500">
                  {parentInvestments.length} investment
                  {parentInvestments.length === 1 ? "" : "s"}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-200 bg-white text-slate-700"
                  onClick={handleExport}
                  disabled={parentInvestments.length === 0}
                >
                  <Download className="mr-2 size-4" />
                  Export
                </Button>
              </>
            ) : null}
            <Button type="button" onClick={openCreate}>
              + Add Investment
            </Button>
          </div>
        </div>

        {parentInvestments.length > 0 ? (
          <div className="space-y-4">
            {parentInvestments.map((investment) => (
              <InvestmentListItem
                key={investment.id}
                investment={investment}
                isMenuOpen={openMenuId === investment.id}
                onMenuOpenChange={(open) =>
                  setOpenMenuId(open ? investment.id : null)
                }
                onAddReturn={() => setReturnTarget(investment)}
                onRecordIncome={() => handleRecordIncome(investment)}
                onEdit={() => openEdit(investment)}
                onEditReturn={(returnId) => openEditReturn(investment, returnId)}
                onDelete={() => setDeletingInvestment(investment)}
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <PieChart className="size-8 text-violet-500" strokeWidth={1.5} />
            </div>
            <h2 className={styles.emptyTitle}>No investments yet</h2>
            <p className={styles.emptyText}>
              Start tracking your investment portfolio
            </p>
          </div>
        )}
      </div>

      <AddInvestmentModal
        open={isAddOpen}
        investment={modalInvestment}
        investments={investments}
        onClose={() => {
          setIsAddOpen(false);
          setModalInvestment(null);
        }}
        onSave={handleSaveInvestment}
      />

      <AddInvestmentReturnModal
        open={Boolean(returnTarget)}
        investment={returnTarget}
        onClose={() => setReturnTarget(null)}
        onSaved={handleReturnSaved}
      />

      <EditInvestmentReturnModal
        open={Boolean(editReturnTarget)}
        target={editReturnTarget}
        onClose={() => setEditReturnTarget(null)}
        onSaved={handleEditReturnSaved}
      />

      <RecordInvestmentIncomeModal
        open={Boolean(incomeTarget)}
        investment={incomeTarget}
        onClose={() => setIncomeTarget(null)}
        onSaved={handleIncomeSaved}
      />

      <DeleteInvestmentDialog
        open={Boolean(deletingInvestment)}
        isDeleting={isDeletingInvestment}
        onClose={() => {
          if (!isDeletingInvestment) {
            setDeletingInvestment(null);
          }
        }}
        onConfirm={() => {
          void handleDeleteInvestment();
        }}
      />
    </>
  );
};
