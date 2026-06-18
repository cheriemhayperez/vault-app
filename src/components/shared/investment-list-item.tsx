"use client";

import { useMemo, useState } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  SquarePen,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { InvestmentActionsMenu } from "@/components/shared/investment-actions-menu";
import { useVaultPreferences } from "@/contexts/vault-preferences-context";
import type { InvestmentReturnType, VaultInvestment } from "@/types/investments";
import {
  getInvestmentReturnTypeLabel,
  getInvestmentTransactionLabel,
  getInvestmentTypeLabel,
} from "@/types/investments";
import { computeInvestmentReturnTotals } from "@/utils/vaultInvestments";

interface InvestmentListItemProps {
  investment: VaultInvestment;
  isMenuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
  onAddReturn: () => void;
  onRecordIncome: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onEditReturn?: (returnId: string) => void;
}

interface ReturnRow {
  id: string;
  type: InvestmentReturnType;
  notes?: string;
  date: string;
  amount: number;
}

const formatDisplayDate = (
  value: string,
  formatDate: (input: string) => string,
): string => formatDate(`${value}T12:00:00.000Z`);

const formatShortReturnDate = (value: string): string => {
  const date = new Date(`${value}T12:00:00.000Z`);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const getTransactionBadgeLabel = (transactionType: VaultInvestment["transactionType"]) => {
  if (transactionType === "buy") {
    return "Buy";
  }
  return getInvestmentTransactionLabel(transactionType);
};

const getTransactionIcon = (transactionType: VaultInvestment["transactionType"]) => {
  if (transactionType === "sell") {
    return {
      Icon: TrendingDown,
      boxClass: "vault-investment-transaction-icon vault-investment-transaction-icon--sell",
    };
  }

  return {
    Icon: TrendingUp,
    boxClass: "vault-investment-transaction-icon vault-investment-transaction-icon--buy",
  };
};

const buildReturnRows = (investment: VaultInvestment): ReturnRow[] => {
  const rows: ReturnRow[] = investment.returns.map((item) => ({
    id: item.id,
    type: item.type,
    notes: item.notes,
    date: item.date,
    amount: item.amount,
  }));

  if (
    investment.transactionType === "dividend" ||
    investment.transactionType === "interest"
  ) {
    rows.unshift({
      id: `${investment.id}-inline`,
      type: investment.transactionType,
      notes: investment.notes,
      date: investment.date,
      amount: investment.amount,
    });
  }

  return rows;
};

export const InvestmentListItem = ({
  investment,
  isMenuOpen,
  onMenuOpenChange,
  onAddReturn,
  onRecordIncome,
  onEdit,
  onDelete,
  onEditReturn,
}: InvestmentListItemProps) => {
  const { formatMoneyFixed, formatDate } = useVaultPreferences();
  const [expanded, setExpanded] = useState(false);

  const returnRows = useMemo(
    () => buildReturnRows(investment),
    [investment],
  );

  const returnTotals = useMemo(
    () => computeInvestmentReturnTotals(investment),
    [investment],
  );

  const totalPayouts = returnTotals.totalPayouts;
  const netProfit = returnTotals.netProfit;
  const netProfitPercent = returnTotals.netProfitPercent;
  const { Icon, boxClass } = getTransactionIcon(
    investment.transactionType,
  );

  return (
    <div className="vault-investment-list-card rounded-xl border border-slate-100 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        className="vault-investment-list-trigger group flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${boxClass}`}
          >
            <Icon className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-slate-900">
              {investment.name}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-5">
          <div className="text-right">
            <p className="text-xs text-slate-500">Amount</p>
            <p className="font-mono text-lg font-bold tabular-nums text-slate-900">
              {formatMoneyFixed(investment.amount)}
            </p>
          </div>
          {returnRows.length > 0 ? (
            <div className="hidden text-right sm:block">
              <p className="text-xs text-slate-500">Returns</p>
              <p className="text-sm font-semibold text-emerald-600">
                {returnRows.length} payment{returnRows.length === 1 ? "" : "s"}
              </p>
            </div>
          ) : null}
          <span
            className="vault-investment-toggle-btn flex size-8 shrink-0 items-center justify-center rounded-lg"
            aria-hidden
          >
            {expanded ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </span>
        </div>
      </button>

      {expanded ? (
        <div className="vault-investment-list-body border-t border-slate-100 px-5 pb-5 pt-4">
          <div className="vault-investment-list-panel rounded-lg border border-slate-100 bg-slate-50/40 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                  {getInvestmentTypeLabel(investment.type)}
                </span>
                <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-700">
                  {getTransactionBadgeLabel(investment.transactionType)}
                </span>
                {!investment.parentId ? (
                  <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    Parent
                  </span>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Calendar className="size-3.5" />
                  {formatDisplayDate(investment.date, formatDate)}
                </span>
                <InvestmentActionsMenu
                  isOpen={isMenuOpen}
                  onOpenChange={onMenuOpenChange}
                  onAddReturn={onAddReturn}
                  onRecordIncome={onRecordIncome}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </div>
            </div>

            {returnRows.length > 0 ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-slate-500">Amount</p>
                  <p className="font-mono text-xl font-bold tabular-nums text-slate-900">
                    {formatMoneyFixed(investment.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Total Payouts</p>
                  <p className="font-mono text-xl font-bold tabular-nums text-slate-900">
                    {formatMoneyFixed(totalPayouts)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Net Profit</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-mono text-xl font-bold tabular-nums text-emerald-600">
                      {netProfit >= 0 ? "+" : ""}
                      {formatMoneyFixed(netProfit)}
                    </p>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      {netProfit >= 0 ? "+" : ""}
                      {netProfitPercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <p className="text-xs text-slate-500">Amount</p>
                <p className="font-mono text-xl font-bold tabular-nums text-slate-900">
                  {formatMoneyFixed(investment.amount)}
                </p>
              </div>
            )}

            {returnRows.length > 0 ? (
              <div className="mt-5">
                <div className="relative py-3">
                  <div className="absolute inset-x-0 top-1/2 border-t border-slate-200" />
                  <p className="relative mx-auto w-fit bg-slate-50 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Related Returns ({returnRows.length})
                  </p>
                </div>

                <div className="overflow-x-auto rounded-lg border border-slate-100 bg-white">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {returnRows.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-slate-50 last:border-b-0"
                        >
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                                {getInvestmentTypeLabel(investment.type)}
                              </span>
                              <span className="text-sm text-slate-600">
                                {getInvestmentReturnTypeLabel(item.type)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            {item.notes?.trim() || "—"}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {formatShortReturnDate(item.date)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-semibold tabular-nums text-emerald-600">
                            +{formatMoneyFixed(item.amount)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              aria-label="Edit return"
                              onClick={() => onEditReturn?.(item.id)}
                              className="inline-flex items-center justify-center rounded-md p-1.5 text-slate-400 transition hover:bg-slate-50 hover:text-violet-600"
                            >
                              <SquarePen className="size-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
};
