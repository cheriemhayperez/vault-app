"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useDashboardPeriod } from "@/contexts/dashboard-period-context";
import { useVaultPreferences } from "@/contexts/vault-preferences-context";
import {
  deleteVaultInvestment,
  fetchUserInvestments,
  insertVaultInvestment,
  migrateLocalInvestmentsToSupabase,
  updateVaultInvestment,
} from "@/api/investments";
import { getCurrentVaultUser } from "@/api/user";
import type { EditInvestmentReturnTarget } from "@/features/investments/edit-investment-return-modal";
import type { VaultInvestment } from "@/types/investments";
import { useVaultToast } from "@/hooks/use-vault-toast";
import {
  clearVaultInvestmentsLocal,
  computeInvestmentMetrics,
  exportInvestmentsCsv,
  getPortfolioGrowthPoints,
  getReturnsByInvestment,
  readVaultInvestments,
  scopeInvestmentsToPeriod,
} from "@/utils/vaultInvestments";

export const useInvestments = () => {
  const { filter } = useDashboardPeriod();
  const { formatMoneyMetric, formatMoneySigned } = useVaultPreferences();
  const [investments, setInvestments] = useState<VaultInvestment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modalInvestment, setModalInvestment] = useState<VaultInvestment | null>(
    null,
  );
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [returnTarget, setReturnTarget] = useState<VaultInvestment | null>(null);
  const [editReturnTarget, setEditReturnTarget] =
    useState<EditInvestmentReturnTarget | null>(null);
  const [incomeTarget, setIncomeTarget] = useState<VaultInvestment | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deletingInvestment, setDeletingInvestment] =
    useState<VaultInvestment | null>(null);
  const [isDeletingInvestment, setIsDeletingInvestment] = useState(false);
  const { toastMessage, toastVariant, setToastMessage, showToastError } =
    useVaultToast();

  const loadInvestments = useCallback(async () => {
    setLoadError(null);
    setIsLoading(true);
    try {
      const user = await getCurrentVaultUser();
      if (!user) {
        setInvestments(readVaultInvestments());
        return;
      }

      let rows = await fetchUserInvestments(user.id);

      if (rows.length === 0) {
        const localRows = readVaultInvestments();
        if (localRows.length > 0) {
          rows = await migrateLocalInvestmentsToSupabase(user.id, localRows);
          clearVaultInvestmentsLocal();
        }
      }

      setInvestments(rows);
    } catch (error) {
      console.error("Failed to load investments:", error);
      setLoadError(
        error instanceof Error ? error.message : "Could not load investments.",
      );
      setInvestments(readVaultInvestments());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInvestments();
  }, [loadInvestments]);

  const filteredInvestments = useMemo(
    () => scopeInvestmentsToPeriod(investments, filter),
    [investments, filter],
  );

  const parentInvestments = useMemo(
    () => filteredInvestments.filter((investment) => !investment.parentId),
    [filteredInvestments],
  );

  const metrics = useMemo(
    () => computeInvestmentMetrics(filteredInvestments),
    [filteredInvestments],
  );

  const returnsData = useMemo(
    () => getReturnsByInvestment(filteredInvestments),
    [filteredInvestments],
  );

  const growthData = useMemo(
    () => getPortfolioGrowthPoints(filteredInvestments),
    [filteredInvestments],
  );

  const openCreate = () => {
    setModalInvestment(null);
    setIsAddOpen(true);
  };

  const openEdit = (investment: VaultInvestment) => {
    setModalInvestment(investment);
    setIsAddOpen(true);
  };

  const handleSaveInvestment = async (investment: VaultInvestment) => {
    try {
      const user = await getCurrentVaultUser();
      if (!user) {
        return;
      }

      const isEdit = investments.some((item) => item.id === investment.id);
      const saved = isEdit
        ? await updateVaultInvestment(user.id, investment)
        : await insertVaultInvestment(user.id, investment);

      setInvestments((current) => {
        if (isEdit) {
          return current.map((item) => (item.id === saved.id ? saved : item));
        }
        return [saved, ...current];
      });
      setToastMessage(
        isEdit
          ? "Investment updated successfully"
          : "Investment added successfully",
      );
    } catch (error) {
      console.error("Failed to save investment:", error);
      showToastError("Could not save investment");
    }
  };

  const handleDeleteInvestment = async () => {
    if (!deletingInvestment) {
      return;
    }

    setIsDeletingInvestment(true);
    try {
      const user = await getCurrentVaultUser();
      if (!user) {
        return;
      }
      await deleteVaultInvestment(user.id, deletingInvestment.id);
      setInvestments((current) =>
        current.filter((item) => item.id !== deletingInvestment.id),
      );
      setOpenMenuId(null);
      setDeletingInvestment(null);
      setToastMessage("Investment deleted successfully");
    } catch (error) {
      console.error("Failed to delete investment:", error);
      showToastError("Could not delete investment");
    } finally {
      setIsDeletingInvestment(false);
    }
  };

  const handleExport = () => {
    const csv = exportInvestmentsCsv(filteredInvestments);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "vault-investments.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleRecordIncome = (investment: VaultInvestment) => {
    setIncomeTarget(investment);
  };

  const handleReturnSaved = (saved: VaultInvestment) => {
    setInvestments((current) =>
      current.map((item) => (item.id === saved.id ? saved : item)),
    );
    setReturnTarget(null);
    setToastMessage("Return recorded successfully");
    void loadInvestments();
  };

  const openEditReturn = (investment: VaultInvestment, returnId: string) => {
    if (returnId === `${investment.id}-inline`) {
      openEdit(investment);
      return;
    }

    const returnItem = investment.returns.find((item) => item.id === returnId);
    if (!returnItem) {
      return;
    }

    setEditReturnTarget({ investment, returnItem });
  };

  const handleEditReturnSaved = (saved: VaultInvestment) => {
    setInvestments((current) =>
      current.map((item) => (item.id === saved.id ? saved : item)),
    );
    setEditReturnTarget(null);
    setToastMessage("Return updated successfully");
    void loadInvestments();
  };

  const handleIncomeSaved = () => {
    setIncomeTarget(null);
    setToastMessage("Income recorded successfully");
  };

  const formatMetricValue = (
    valueKey: "capital" | "payouts" | "profit" | "positions",
    rawValue: number,
  ): string => {
    if (valueKey === "positions") {
      return String(rawValue);
    }
    if (valueKey === "profit") {
      if (rawValue > 0) {
        return `+${formatMoneyMetric(rawValue)}`;
      }
      if (rawValue < 0) {
        return formatMoneySigned(rawValue);
      }
      return `+${formatMoneyMetric(0)}`;
    }
    return formatMoneyMetric(rawValue);
  };

  return {
    investments,
    isLoading,
    loadError,
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
    filteredInvestments,
    parentInvestments,
    metrics,
    returnsData,
    growthData,
    hasInvestments: investments.length > 0,
    setIsAddOpen,
    setModalInvestment,
    setReturnTarget,
    setEditReturnTarget,
    setIncomeTarget,
    setOpenMenuId,
    setDeletingInvestment,
    setToastMessage,
    loadInvestments,
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
  };
};

