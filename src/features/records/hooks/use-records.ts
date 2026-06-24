"use client";

import { useMemo, useState } from "react";

import type { FilterSelectOption } from "@/components/shared/filter-select-menu";
import { useVaultPreferences } from "@/contexts/vault-preferences-context";
import { useAppDispatch, useAppSelector } from "@/store";
import { deleteVaultRecord, updateVaultRecord } from "@/api/ledger";
import { getCurrentVaultUser } from "@/api/user";
import { loadVaultData } from "@/features/system/load-vault-data";
import { useAutoDismissToast } from "@/hooks/use-auto-dismiss-toast";
import { useConfirmVaultDelete } from "@/hooks/use-confirm-vault-delete";
import { removePayRecord, updatePayRecord } from "@/store/slices/financialSlice";
import {
  findPayCategoryByName,
  type PayCategory,
} from "@/types/categories";
import type { Transaction } from "@/types/financial";
import {
  buildPayRecordLedgerRows,
  countDistinctPayRecordMonths,
  groupPayRecordsByMonth,
  isPayRecord,
  sumPayRecordDeductions,
  sumPayRecordIncome,
} from "@/utils/payRecords";

const MIN_SYNC_ANIMATION_MS = 800;

export type RecordsTimeFilter = "all" | "month" | "last3" | "last6" | "year";

const passesRecordsTimeFilter = (
  recordDate: Date,
  filter: RecordsTimeFilter,
  now: Date,
): boolean => {
  switch (filter) {
    case "month":
      return (
        recordDate.getMonth() === now.getMonth() &&
        recordDate.getFullYear() === now.getFullYear()
      );
    case "year":
      return recordDate.getFullYear() === now.getFullYear();
    case "last3": {
      const cutoff = new Date(now);
      cutoff.setMonth(cutoff.getMonth() - 3);
      cutoff.setHours(0, 0, 0, 0);
      return recordDate >= cutoff;
    }
    case "last6": {
      const cutoff = new Date(now);
      cutoff.setMonth(cutoff.getMonth() - 6);
      cutoff.setHours(0, 0, 0, 0);
      return recordDate >= cutoff;
    }
    default:
      return true;
  }
};

export const useRecords = () => {
  const { formatMoneyFixed, formatDate } = useVaultPreferences();
  const dispatch = useAppDispatch();
  const { transactions } = useAppSelector((state) => state.financial);
  const { income, deduction: deductionCategories } = useAppSelector(
    (state) => state.categories,
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdditionalPayOpen, setIsAdditionalPayOpen] = useState(false);
  const [quickDeductionCategory, setQuickDeductionCategory] =
    useState<PayCategory | null>(null);
  const [editingRecord, setEditingRecord] = useState<Transaction | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState<RecordsTimeFilter>("all");
  const [collapsedMonths, setCollapsedMonths] = useState<Record<string, boolean>>(
    {},
  );
  const [expandedPayRecordIds, setExpandedPayRecordIds] = useState<
    Record<string, boolean>
  >({});
  const [unlinkingRecordId, setUnlinkingRecordId] = useState<string | null>(
    null,
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const {
    deletingItem: deletingRecord,
    setDeletingItem: setDeletingRecord,
    isDeleting: isDeletingRecord,
    confirmDelete: handleConfirmDelete,
    toastMessage,
    toastVariant,
    setToastMessage,
  } = useConfirmVaultDelete<Transaction>({
    deleteFn: (record, userId) => deleteVaultRecord(record.id, userId),
    onDeleted: (record) => dispatch(removePayRecord(record.id)),
    successMessage: "Record deleted successfully",
  });

  const payRecords = useMemo(
    () =>
      [...transactions]
        .filter(isPayRecord)
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        ),
    [transactions],
  );

  const categoryFilterOptions = useMemo(() => {
    const options: FilterSelectOption[] = [
      { value: "all", label: "All Categories" },
    ];
    const seen = new Set<string>();

    const addCategory = (name: string) => {
      if (seen.has(name)) {
        return;
      }
      seen.add(name);
      const matched = findPayCategoryByName(
        name,
        income,
        deductionCategories,
      );
      options.push({
        value: name,
        label: name,
        colorId: matched?.color,
      });
    };

    for (const category of [...income, ...deductionCategories]) {
      addCategory(category.name);
    }

    for (const record of payRecords) {
      if (record.recordCategory) {
        addCategory(record.recordCategory);
      }
    }

    return options;
  }, [payRecords, income, deductionCategories]);

  const filteredRecords = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const now = new Date();

    return payRecords.filter((record) => {
      if (categoryFilter !== "all" && record.recordCategory !== categoryFilter) {
        return false;
      }

      const recordDate = new Date(record.timestamp);
      if (!passesRecordsTimeFilter(recordDate, timeFilter, now)) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = [
        record.merchantOrLabel,
        record.recordCategory,
        record.category,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [payRecords, searchQuery, categoryFilter, timeFilter]);

  const totalIncome = useMemo(
    () => sumPayRecordIncome(filteredRecords),
    [filteredRecords],
  );

  const totalDeductions = useMemo(
    () => sumPayRecordDeductions(filteredRecords),
    [filteredRecords],
  );

  const netFilteredTotal = useMemo(
    () => Math.max(0, totalIncome - totalDeductions),
    [totalIncome, totalDeductions],
  );

  const monthGroups = useMemo(
    () =>
      groupPayRecordsByMonth(filteredRecords).map((group) => ({
        ...group,
        fullRecordCount: group.records.length,
        ledgerRows: buildPayRecordLedgerRows(group.records),
      })),
    [filteredRecords],
  );

  const hasRecords = payRecords.length > 0;
  const hasFilteredRecords = filteredRecords.length > 0;
  const monthCount = countDistinctPayRecordMonths(filteredRecords);

  const toggleMonth = (key: string) => {
    setCollapsedMonths((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  };

  const togglePayRecordExpanded = (recordId: string) => {
    setExpandedPayRecordIds((previous) => ({
      ...previous,
      [recordId]: !previous[recordId],
    }));
  };

  const handleUnlinkFromSalary = async (record: Transaction) => {
    const parentId = record.linkedSalaryRecordId;
    if (!parentId || unlinkingRecordId) {
      return;
    }

    setUnlinkingRecordId(record.id);
    try {
      const user = await getCurrentVaultUser();
      if (!user) {
        return;
      }

      const { linkedSalaryRecordId: _removed, ...unlinkedRecord } = record;
      const saved = await updateVaultRecord(unlinkedRecord, user.id);
      dispatch(updatePayRecord(saved));

      const remainingLinkedCount = transactions.filter(
        (item) =>
          item.id !== record.id && item.linkedSalaryRecordId === parentId,
      ).length;

      if (remainingLinkedCount === 0) {
        setExpandedPayRecordIds((previous) => {
          const next = { ...previous };
          delete next[parentId];
          return next;
        });
      }

      setToastMessage("Deduction unlinked from salary");
    } catch (error) {
      console.error("Failed to unlink deduction:", error);
      setSyncError("Failed to unlink deduction from salary");
    } finally {
      setUnlinkingRecordId(null);
    }
  };

  const openAddRecord = () => {
    setIsAddModalOpen(true);
  };

  const openQuickDeduction = (category: PayCategory) => {
    setQuickDeductionCategory(category);
  };

  const closeAddRecord = () => {
    setIsAddModalOpen(false);
  };

  const closeQuickDeduction = () => {
    setQuickDeductionCategory(null);
  };

  useAutoDismissToast(syncMessage, setSyncMessage);

  const handleSyncRecords = async () => {
    if (isSyncing) {
      return;
    }

    setIsSyncing(true);
    setSyncError(null);
    const startedAt = Date.now();

    try {
      const result = await loadVaultData(dispatch);
      const elapsed = Date.now() - startedAt;
      if (elapsed < MIN_SYNC_ANIMATION_MS) {
        await new Promise((resolve) => {
          window.setTimeout(resolve, MIN_SYNC_ANIMATION_MS - elapsed);
        });
      }

      if (result.ok) {
        setSyncMessage("Records synced from server");
      } else {
        setSyncError(result.message);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  return {
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
    expandedPayRecordIds,
    unlinkingRecordId,
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
    togglePayRecordExpanded,
    handleUnlinkFromSalary,
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
  };
};
