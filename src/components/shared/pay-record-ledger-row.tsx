"use client";

import { ChevronDown, ChevronRight, Link2Off } from "lucide-react";

import { PayRecordDirectionIcon } from "@/components/shared/pay-record-direction-icon";
import { RecordActionsMenu } from "@/components/shared/record-actions-menu";
import { RecordCategoryBadge } from "@/components/shared/record-category-badge";
import {
  formatSignedAmount,
  RECORDS_LEDGER_GRID_CLASS,
} from "@/features/records/config";
import type { PayCategory } from "@/types/categories";
import type { Transaction } from "@/types/financial";
import {
  formatLinkedDeductionCountLabel,
  getRecordRowDescription,
  isEmptyRecordRowDescription,
  sumLinkedDeductionAmount,
  type PayRecordLedgerRow,
} from "@/utils/payRecords";

interface PayRecordLedgerRowGroupProps {
  row: PayRecordLedgerRow;
  isExpanded: boolean;
  openMenuId: string | null;
  incomeCategories: PayCategory[];
  deductionCategories: PayCategory[];
  formatDate: (input: string) => string;
  formatMoneyFixed: (amount: number) => string;
  onToggleExpanded: (recordId: string) => void;
  onMenuOpenChange: (recordId: string, isOpen: boolean) => void;
  onEdit: (record: Transaction) => void;
  onDelete: (record: Transaction) => void;
  onUnlinkFromSalary: (record: Transaction) => void;
  unlinkingRecordId: string | null;
}

interface PayRecordLedgerRowItemProps {
  record: Transaction;
  linkedDeductions: Transaction[];
  isLinkedChild?: boolean;
  isLastLinkedChild?: boolean;
  isExpanded?: boolean;
  openMenuId: string | null;
  incomeCategories: PayCategory[];
  deductionCategories: PayCategory[];
  formatDate: (input: string) => string;
  formatMoneyFixed: (amount: number) => string;
  onToggleExpanded?: () => void;
  onMenuOpenChange: (isOpen: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  onUnlinkFromSalary?: () => void;
  isUnlinking?: boolean;
}

const rowGridClass = (
  isLinkedChild: boolean,
  isExpanded = false,
  isLastLinkedChild = false,
) =>
  `${RECORDS_LEDGER_GRID_CLASS} px-4 py-3.5 text-sm hover:bg-slate-50/60 ${
    isLinkedChild ? "vault-pay-record-ledger-row--linked-child" : ""
  } ${
    isLinkedChild && isLastLinkedChild
      ? "vault-pay-record-ledger-row--linked-child-last"
      : ""
  } ${
    !isLinkedChild && isExpanded
      ? "vault-pay-record-ledger-row--expanded-parent"
      : ""
  }`;

const PayRecordSalaryLinkButton = ({
  onUnlink,
  isUnlinking = false,
}: {
  onUnlink: () => void;
  isUnlinking?: boolean;
}) => (
  <button
    type="button"
    onClick={(event) => {
      event.stopPropagation();
      onUnlink();
    }}
    disabled={isUnlinking}
    className="vault-pay-record-link-btn group relative flex size-7 shrink-0 items-center justify-center rounded-md disabled:cursor-not-allowed disabled:opacity-60"
    aria-label="Unlink from salary"
  >
    <Link2Off className="size-3.5" strokeWidth={2.25} />
    <span role="tooltip" className="vault-pay-record-link-tooltip">
      Unlink from salary
    </span>
  </button>
);

const PayRecordLedgerRowItem = ({
  record,
  linkedDeductions,
  isLinkedChild = false,
  isLastLinkedChild = false,
  isExpanded = false,
  openMenuId,
  incomeCategories,
  deductionCategories,
  formatDate,
  formatMoneyFixed,
  onToggleExpanded,
  onMenuOpenChange,
  onEdit,
  onDelete,
  onUnlinkFromSalary,
  isUnlinking = false,
}: PayRecordLedgerRowItemProps) => {
  const hasLinkedDeductions = !isLinkedChild && linkedDeductions.length > 0;
  const linkedDeductionTotal = sumLinkedDeductionAmount(linkedDeductions);
  const netAmount =
    record.direction === "CREDIT" && hasLinkedDeductions
      ? Math.max(0, record.amount - linkedDeductionTotal)
      : null;

  return (
    <div
      className={rowGridClass(
        isLinkedChild,
        isExpanded,
        isLastLinkedChild,
      )}
    >
      <div className="flex items-center justify-center gap-1">
        {hasLinkedDeductions ? (
          <button
            type="button"
            onClick={onToggleExpanded}
            aria-expanded={isExpanded}
            aria-label={
              isExpanded
                ? "Collapse linked deductions"
                : "Expand linked deductions"
            }
            className="vault-pay-record-expand-btn flex size-7 shrink-0 items-center justify-center rounded-md"
          >
            {isExpanded ? (
              <ChevronDown className="size-4" strokeWidth={2.25} />
            ) : (
              <ChevronRight className="size-4" strokeWidth={2.25} />
            )}
          </button>
        ) : isLinkedChild ? (
          <PayRecordSalaryLinkButton
            onUnlink={() => onUnlinkFromSalary?.()}
            isUnlinking={isUnlinking}
          />
        ) : (
          <span className="size-7 shrink-0" aria-hidden />
        )}
        <PayRecordDirectionIcon direction={record.direction} />
      </div>

      <div className="min-w-0">
        <p
          className={`truncate ${
            isEmptyRecordRowDescription(record)
              ? "text-slate-400"
              : "font-medium text-slate-800"
          }`}
        >
          {getRecordRowDescription(record)}
        </p>
        {hasLinkedDeductions && !isExpanded ? (
          <p className="mt-0.5 text-xs text-slate-500">
            {formatLinkedDeductionCountLabel(linkedDeductions.length)}
          </p>
        ) : null}
      </div>

      <RecordCategoryBadge
        record={record}
        incomeCategories={incomeCategories}
        deductionCategories={deductionCategories}
      />
      <p className="whitespace-nowrap text-slate-600">
        {formatDate(record.timestamp)}
      </p>

      <div className="text-right">
        <p
          className={`whitespace-nowrap font-semibold tabular-nums ${
            record.direction === "CREDIT" ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {formatSignedAmount(record)}
        </p>
        {netAmount !== null ? (
          <p className="mt-0.5 whitespace-nowrap text-xs text-slate-500">
            Net: {formatMoneyFixed(netAmount)}
          </p>
        ) : null}
      </div>

      <div className="flex justify-end">
        <RecordActionsMenu
          isOpen={openMenuId === record.id}
          onOpenChange={onMenuOpenChange}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
};

export const PayRecordLedgerRowGroup = ({
  row,
  isExpanded,
  openMenuId,
  incomeCategories,
  deductionCategories,
  formatDate,
  formatMoneyFixed,
  onToggleExpanded,
  onMenuOpenChange,
  onEdit,
  onDelete,
  onUnlinkFromSalary,
  unlinkingRecordId,
}: PayRecordLedgerRowGroupProps) => {
  const { record, linkedDeductions } = row;

  return (
    <div className="vault-pay-record-ledger-group">
      <PayRecordLedgerRowItem
        record={record}
        linkedDeductions={linkedDeductions}
        isExpanded={isExpanded}
        openMenuId={openMenuId}
        incomeCategories={incomeCategories}
        deductionCategories={deductionCategories}
        formatDate={formatDate}
        formatMoneyFixed={formatMoneyFixed}
        onToggleExpanded={() => onToggleExpanded(record.id)}
        onMenuOpenChange={(isOpen) => onMenuOpenChange(record.id, isOpen)}
        onEdit={() => onEdit(record)}
        onDelete={() => onDelete(record)}
      />
      {isExpanded
        ? linkedDeductions.map((deduction, index) => (
            <PayRecordLedgerRowItem
              key={deduction.id}
              record={deduction}
              linkedDeductions={[]}
              isLinkedChild
              isLastLinkedChild={index === linkedDeductions.length - 1}
              openMenuId={openMenuId}
              incomeCategories={incomeCategories}
              deductionCategories={deductionCategories}
              formatDate={formatDate}
              formatMoneyFixed={formatMoneyFixed}
              onMenuOpenChange={(isOpen) =>
                onMenuOpenChange(deduction.id, isOpen)
              }
              onEdit={() => onEdit(deduction)}
              onDelete={() => onDelete(deduction)}
              onUnlinkFromSalary={() => onUnlinkFromSalary(deduction)}
              isUnlinking={unlinkingRecordId === deduction.id}
            />
          ))
        : null}
    </div>
  );
};
