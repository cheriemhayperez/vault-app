import type { VaultCurrencyCode } from "@/utils/vaultPreferences";

interface CurrencyMeta {
  locale: string;
  currency: string;
  maxFractionDigits: number;
}

const CURRENCY_META: Record<VaultCurrencyCode, CurrencyMeta> = {
  php: { locale: "en-PH", currency: "PHP", maxFractionDigits: 0 },
  usd: { locale: "en-US", currency: "USD", maxFractionDigits: 2 },
  eur: { locale: "de-DE", currency: "EUR", maxFractionDigits: 2 },
  gbp: { locale: "en-GB", currency: "GBP", maxFractionDigits: 2 },
  jpy: { locale: "ja-JP", currency: "JPY", maxFractionDigits: 0 },
};

export interface VaultCurrencyFormatters {
  currency: VaultCurrencyCode;
  formatMoney: (value: number) => string;
  formatMoneyFixed: (value: number) => string;
  formatMoneySigned: (value: number) => string;
  formatMoneyMetric: (value: number) => string;
  formatMoneyAxisTick: (value: number) => string;
}

const getCurrencySymbol = (meta: CurrencyMeta): string => {
  const parts = new Intl.NumberFormat(meta.locale, {
    style: "currency",
    currency: meta.currency,
    maximumFractionDigits: 0,
  }).formatToParts(0);

  return parts.find((part) => part.type === "currency")?.value ?? meta.currency;
};

export const createCurrencyFormatters = (
  code: VaultCurrencyCode,
): VaultCurrencyFormatters => {
  const meta = CURRENCY_META[code];
  const symbol = getCurrencySymbol(meta);

  const moneyFormatter = new Intl.NumberFormat(meta.locale, {
    style: "currency",
    currency: meta.currency,
    maximumFractionDigits: meta.maxFractionDigits,
  });

  const moneyFormatterFixed = new Intl.NumberFormat(meta.locale, {
    style: "currency",
    currency: meta.currency,
    minimumFractionDigits: meta.currency === "JPY" ? 0 : 2,
    maximumFractionDigits: meta.currency === "JPY" ? 0 : 2,
  });

  return {
    currency: code,
    formatMoney: (value: number) =>
      moneyFormatter.format(Math.max(0, Number.isFinite(value) ? value : 0)),
    formatMoneyFixed: (value: number) =>
      moneyFormatterFixed.format(Math.max(0, Number.isFinite(value) ? value : 0)),
    formatMoneySigned: (value: number) => {
      if (!Number.isFinite(value)) {
        return moneyFormatterFixed.format(0);
      }
      if (value < 0) {
        return `-${moneyFormatterFixed.format(Math.abs(value))}`;
      }
      return moneyFormatterFixed.format(value);
    },
    formatMoneyMetric: (value: number) => {
      const safe = Math.max(0, Number.isFinite(value) ? value : 0);
      if (safe === 0) {
        return `${symbol}0`;
      }
      return moneyFormatterFixed.format(safe);
    },
    formatMoneyAxisTick: (value: number) => {
      const safe = Math.max(0, Number(value));
      if (safe === 0) {
        return `${symbol}0`;
      }
      if (safe >= 1000) {
        const thousands = safe / 1000;
        const label =
          thousands % 1 === 0
            ? thousands.toFixed(0)
            : thousands.toFixed(1).replace(/\.0$/, "");
        return `${symbol}${label}k`;
      }
      return `${symbol}${Math.round(safe)}`;
    },
  };
};

let activeFormatters = createCurrencyFormatters("php");

export const setActiveCurrencyFormatters = (
  code: VaultCurrencyCode,
): VaultCurrencyFormatters => {
  activeFormatters = createCurrencyFormatters(code);
  return activeFormatters;
};

export const getActiveCurrencyFormatters = (): VaultCurrencyFormatters =>
  activeFormatters;
