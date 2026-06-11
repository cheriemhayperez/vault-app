"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  createCurrencyFormatters,
  setActiveCurrencyFormatters,
  type VaultCurrencyFormatters,
} from "@/utils/format/currencyFormat";
import {
  formatVaultDate,
  setActiveDateFormat,
} from "@/utils/date/vaultDateFormat";
import {
  DEFAULT_VAULT_PREFERENCES,
  readVaultPreferences,
  writeVaultPreferences,
  type VaultCurrencyCode,
  type VaultDateFormatId,
  type VaultPreferences,
} from "@/utils/vaultPreferences";

interface VaultPreferencesContextValue extends VaultCurrencyFormatters {
  preferences: VaultPreferences;
  formatDate: (value: string | Date | number) => string;
  updatePreference: <K extends keyof VaultPreferences>(
    key: K,
    value: VaultPreferences[K],
  ) => void;
}

const VaultPreferencesContext = createContext<VaultPreferencesContextValue | null>(
  null,
);

export const VaultPreferencesProvider = ({ children }: { children: ReactNode }) => {
  const [preferences, setPreferences] = useState<VaultPreferences>(
    DEFAULT_VAULT_PREFERENCES,
  );

  useEffect(() => {
    const stored = readVaultPreferences();
    setPreferences(stored);
    setActiveCurrencyFormatters(stored.currency);
    setActiveDateFormat(stored.dateFormat);
  }, []);

  const formatters = useMemo(
    () => createCurrencyFormatters(preferences.currency),
    [preferences.currency],
  );

  const formatDate = useCallback(
    (value: string | Date | number) =>
      formatVaultDate(value, preferences.dateFormat),
    [preferences.dateFormat],
  );

  useEffect(() => {
    setActiveCurrencyFormatters(preferences.currency);
    setActiveDateFormat(preferences.dateFormat);
  }, [preferences.currency, preferences.dateFormat]);

  const updatePreference = useCallback(
    <K extends keyof VaultPreferences>(key: K, value: VaultPreferences[K]) => {
      setPreferences((current) => {
        if (current[key] === value) {
          return current;
        }

        const next = { ...current, [key]: value };
        writeVaultPreferences({ [key]: value });
        return next;
      });
    },
    [],
  );

  const value = useMemo(
    (): VaultPreferencesContextValue => ({
      preferences,
      updatePreference,
      formatDate,
      currency: formatters.currency,
      formatMoney: formatters.formatMoney,
      formatMoneyFixed: formatters.formatMoneyFixed,
      formatMoneySigned: formatters.formatMoneySigned,
      formatMoneyMetric: formatters.formatMoneyMetric,
      formatMoneyAxisTick: formatters.formatMoneyAxisTick,
    }),
    [formatDate, formatters, preferences, updatePreference],
  );

  return (
    <VaultPreferencesContext.Provider value={value}>
      {children}
    </VaultPreferencesContext.Provider>
  );
};

export const useVaultPreferences = (): VaultPreferencesContextValue => {
  const context = useContext(VaultPreferencesContext);
  if (!context) {
    const formatDate = (value: string | Date | number) =>
      formatVaultDate(value, DEFAULT_VAULT_PREFERENCES.dateFormat);

    return {
      preferences: DEFAULT_VAULT_PREFERENCES,
      updatePreference: () => {},
      formatDate,
      ...createCurrencyFormatters(DEFAULT_VAULT_PREFERENCES.currency),
    };
  }
  return context;
};

export type { VaultCurrencyCode, VaultDateFormatId, VaultPreferences };
