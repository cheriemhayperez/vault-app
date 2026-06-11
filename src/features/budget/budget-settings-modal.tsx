"use client";

import { useEffect, useMemo, useState } from "react";

import { VaultModalFooter } from "@/components/shared/vault-modal-footer";
import { VaultModalHeader } from "@/components/shared/vault-modal-header";
import { VaultSubmitButton } from "@/components/shared/vault-submit-button";
import { Input } from "@/components/ui/input";
import {
  VaultModalOverlay,
  vaultModalPanelClass,
} from "@/components/ui/vault-modal-overlay";
import { useModalEscape } from "@/hooks/use-modal-escape";
import { useAppDispatch, useAppSelector } from "@/store";
import { setBudgetSplitPercentages } from "@/store/slices/financialSlice";
import type { BudgetSplitPercentages } from "@/types/deductions";

const PRESETS: { id: string; label: string; split: BudgetSplitPercentages }[] = [
  { id: "50-30-20", label: "50/30/20", split: { needs: 50, wants: 30, savings: 20 } },
  { id: "60-20-20", label: "60/20/20", split: { needs: 60, wants: 20, savings: 20 } },
  { id: "70-20-10", label: "70/20/10", split: { needs: 70, wants: 20, savings: 10 } },
  { id: "80-10-10", label: "80/10/10", split: { needs: 80, wants: 10, savings: 10 } },
];

const BUCKET_ROWS = [
  { key: "needs" as const, label: "Needs", dotClass: "bg-blue-500" },
  { key: "wants" as const, label: "Wants", dotClass: "bg-violet-500" },
  { key: "savings" as const, label: "Savings", dotClass: "bg-emerald-500" },
];

interface BudgetSettingsModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const findMatchingPresetId = (split: BudgetSplitPercentages): string | null => {
  const match = PRESETS.find(
    (preset) =>
      preset.split.needs === split.needs &&
      preset.split.wants === split.wants &&
      preset.split.savings === split.savings,
  );
  return match?.id ?? null;
};

export const BudgetSettingsModal = ({
  open,
  onClose,
  onSuccess,
}: BudgetSettingsModalProps) => {
  const dispatch = useAppDispatch();
  const savedSplit = useAppSelector(
    (state) => state.financial.budgetSplitPercentages,
  );

  const [needs, setNeeds] = useState("50");
  const [wants, setWants] = useState("30");
  const [savings, setSavings] = useState("20");
  const [activePresetId, setActivePresetId] = useState<string | null>("50-30-20");

  useEffect(() => {
    if (!open) {
      return;
    }
    setNeeds(String(savedSplit.needs));
    setWants(String(savedSplit.wants));
    setSavings(String(savedSplit.savings));
    setActivePresetId(findMatchingPresetId(savedSplit));
  }, [open, savedSplit]);

  useModalEscape(onClose, { open });

  const parsedSplit = useMemo(() => {
    const n = Number(needs);
    const w = Number(wants);
    const s = Number(savings);
    return {
      needs: Number.isFinite(n) ? n : 0,
      wants: Number.isFinite(w) ? w : 0,
      savings: Number.isFinite(s) ? s : 0,
    };
  }, [needs, wants, savings]);

  const totalPercent = parsedSplit.needs + parsedSplit.wants + parsedSplit.savings;
  const isTotalValid = totalPercent === 100;

  const applyPreset = (presetId: string) => {
    const preset = PRESETS.find((item) => item.id === presetId);
    if (!preset) {
      return;
    }
    setActivePresetId(presetId);
    setNeeds(String(preset.split.needs));
    setWants(String(preset.split.wants));
    setSavings(String(preset.split.savings));
  };

  const handleFieldChange = (
    field: "needs" | "wants" | "savings",
    value: string,
  ) => {
    setActivePresetId(null);
    if (field === "needs") {
      setNeeds(value);
    } else if (field === "wants") {
      setWants(value);
    } else {
      setSavings(value);
    }
  };

  const handleSave = () => {
    if (!isTotalValid) {
      return;
    }
    dispatch(setBudgetSplitPercentages(parsedSplit));
    onSuccess?.();
    onClose();
  };

  if (!open) {
    return null;
  }

  const fieldValues = { needs, wants, savings };

  return (
    <VaultModalOverlay ariaLabelledBy="budget-settings-title" onClose={onClose}>
      <div className={`${vaultModalPanelClass} max-w-md`}>
        <VaultModalHeader
          titleId="budget-settings-title"
          title="Budget Settings"
          onClose={onClose}
        />

        <div className="mt-6 space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-500">Quick Presets</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => {
                const isActive = activePresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset.id)}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                      isActive
                        ? "border-violet-500 bg-violet-50 text-violet-800"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            {BUCKET_ROWS.map((row) => (
              <div
                key={row.key}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`size-2.5 rounded-full ${row.dotClass}`}
                  />
                  <span className="text-sm font-medium text-slate-900">
                    {row.label}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={fieldValues[row.key]}
                    className="h-9 w-16 border-slate-300 text-center text-sm focus-visible:border-violet-500 focus-visible:ring-violet-500/20"
                    onChange={(event) =>
                      handleFieldChange(row.key, event.target.value)
                    }
                  />
                  <span className="text-sm text-slate-500">%</span>
                </div>
              </div>
            ))}
          </div>

          <p
            className={`text-sm font-medium ${
              isTotalValid ? "text-violet-600" : "text-rose-500"
            }`}
          >
            Total: {totalPercent}%
          </p>
        </div>

        <VaultModalFooter onCancel={onClose}>
          <VaultSubmitButton
            type="button"
            label="Save"
            mode="save"
            disabled={!isTotalValid}
            onClick={handleSave}
          />
        </VaultModalFooter>
      </div>
    </VaultModalOverlay>
  );
};
