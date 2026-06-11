export type VaultCurrencyCode = "php" | "usd" | "eur" | "gbp" | "jpy";

export type VaultDateFormatId =
  | "mdy_long"
  | "dmy_long"
  | "mdy_numeric"
  | "dmy_numeric"
  | "iso";

export interface VaultPreferences {
  currency: VaultCurrencyCode;
  dateFormat: VaultDateFormatId;
}

export const VAULT_PREFERENCES_STORAGE_KEY = "vault-preferences";

export const DEFAULT_VAULT_PREFERENCES: VaultPreferences = {
  currency: "php",
  dateFormat: "mdy_long",
};

const isCurrencyCode = (value: string): value is VaultCurrencyCode =>
  value === "php" ||
  value === "usd" ||
  value === "eur" ||
  value === "gbp" ||
  value === "jpy";

const isDateFormatId = (value: string): value is VaultDateFormatId =>
  value === "mdy_long" ||
  value === "dmy_long" ||
  value === "mdy_numeric" ||
  value === "dmy_numeric" ||
  value === "iso";

export const readVaultPreferences = (): VaultPreferences => {
  if (typeof window === "undefined") {
    return DEFAULT_VAULT_PREFERENCES;
  }

  try {
    const raw = localStorage.getItem(VAULT_PREFERENCES_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_VAULT_PREFERENCES;
    }

    const parsed = JSON.parse(raw) as Partial<VaultPreferences>;
    const currencyValue = parsed.currency ?? "";
    const dateFormatValue = parsed.dateFormat ?? "";

    return {
      currency: isCurrencyCode(currencyValue)
        ? currencyValue
        : DEFAULT_VAULT_PREFERENCES.currency,
      dateFormat: isDateFormatId(dateFormatValue)
        ? dateFormatValue
        : DEFAULT_VAULT_PREFERENCES.dateFormat,
    };
  } catch {
    return DEFAULT_VAULT_PREFERENCES;
  }
};

export const writeVaultPreferences = (
  patch: Partial<VaultPreferences>,
): VaultPreferences => {
  const next = {
    ...readVaultPreferences(),
    ...patch,
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(VAULT_PREFERENCES_STORAGE_KEY, JSON.stringify(next));
  }

  return next;
};
