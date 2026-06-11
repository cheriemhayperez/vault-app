"use client";

import { Calendar, Coins, SlidersHorizontal } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { FilterSelectMenu } from "@/components/shared/filter-select-menu";
import { VaultToast } from "@/components/ui/vault-toast";
import { useVaultToast } from "@/hooks/use-vault-toast";
import { useVaultPreferences } from "@/contexts/vault-preferences-context";
import {
  type VaultPreferences,
} from "@/utils/vaultPreferences";

const CURRENCY_OPTIONS = [
  { value: "php", label: "₱ PHP", menuLabel: "₱ Philippine Peso" },
  { value: "usd", label: "$ USD", menuLabel: "$ US Dollar" },
  { value: "eur", label: "€ EUR", menuLabel: "€ Euro" },
  { value: "gbp", label: "£ GBP", menuLabel: "£ British Pound" },
  { value: "jpy", label: "¥ JPY", menuLabel: "¥ Japanese Yen" },
] as const;

const DATE_FORMAT_OPTIONS = [
  { value: "mdy_long", label: "Jan 1, 2025" },
  { value: "dmy_long", label: "1 Jan 2025" },
  { value: "mdy_numeric", label: "01/01/2025" },
  { value: "dmy_numeric", label: "01/01/2025 (DD/MM)" },
  { value: "iso", label: "2025-01-01" },
] as const;

const PREFERENCE_ROWS: {
  id: keyof VaultPreferences;
  title: string;
  description: string;
  icon: LucideIcon;
  ariaLabel: string;
  options: { value: string; label: string; menuLabel?: string }[];
}[] = [
  {
    id: "currency",
    title: "Currency",
    description: "Used for displaying monetary amounts",
    icon: Coins,
    ariaLabel: "Currency",
    options: [...CURRENCY_OPTIONS],
  },
  {
    id: "dateFormat",
    title: "Date Format",
    description: "How dates appear in the app",
    icon: Calendar,
    ariaLabel: "Date format",
    options: [...DATE_FORMAT_OPTIONS],
  },
];

export const SettingsPreferencesPanel = () => {
  const { preferences, updatePreference } = useVaultPreferences();
  const { toastMessage, toastVariant, setToastMessage } = useVaultToast();

  const handlePreferenceChange = <K extends keyof VaultPreferences>(
    key: K,
    value: VaultPreferences[K],
  ) => {
    if (preferences[key] === value) {
      return;
    }
    updatePreference(key, value);
    setToastMessage("Preference saved");
  };

  return (
    <>
      {toastMessage ? (
        <VaultToast
          message={toastMessage}
          variant={toastVariant}
          onClose={() => setToastMessage(null)}
        />
      ) : null}

      <div className="border-b border-slate-100 pb-6">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-violet-50">
            <SlidersHorizontal className="size-5 text-violet-600" />
          </div>
          <div>
            <h2 className="font-semibold tracking-tight text-slate-900">
              Preferences
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Currency, dates, and more
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-sm font-semibold text-slate-900">Regional Settings</h3>
        <p className="mt-1 text-sm text-slate-500">
          Customize how data is displayed throughout the application.
        </p>

        <div className="mt-5 space-y-3">
          {PREFERENCE_ROWS.map((row) => {
            const Icon = row.icon;
            const value = preferences[row.id];

            return (
              <div
                key={row.id}
                className="flex flex-col gap-4 rounded-lg border border-slate-100 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-violet-50">
                    <Icon className="size-5 text-violet-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">
                      {row.title}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {row.description}
                    </p>
                  </div>
                </div>

                <div className="w-full shrink-0 sm:w-44">
                  <FilterSelectMenu
                    value={value}
                    options={row.options}
                    ariaLabel={row.ariaLabel}
                    minWidthClass="min-w-full sm:min-w-44"
                    onChange={(nextValue) => {
                      handlePreferenceChange(
                        row.id,
                        nextValue as VaultPreferences[typeof row.id],
                      );
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-sm text-slate-600">
            <span className="font-medium text-slate-700">Note:</span> These
            preferences are stored locally in your browser and will persist
            across sessions.
          </p>
        </div>
      </div>
    </>
  );
};
