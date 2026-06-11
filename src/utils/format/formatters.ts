import { getActiveCurrencyFormatters } from "@/utils/format/currencyFormat";

const COMPACT_NUMBER_FORMATTER = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** @deprecated Use useVaultPreferences().formatMoney. */
export const formatPhp = (value: number): string =>
  getActiveCurrencyFormatters().formatMoney(value);

/** @deprecated Use useVaultPreferences().formatMoneyFixed */
export const formatPhpFixed = (value: number): string =>
  getActiveCurrencyFormatters().formatMoneyFixed(value);

/** @deprecated Use useVaultPreferences().formatMoneySigned */
export const formatPhpSigned = (value: number): string =>
  getActiveCurrencyFormatters().formatMoneySigned(value);

/** @deprecated Use useVaultPreferences().formatMoneyMetric */
export const formatPhpMetric = (value: number): string =>
  getActiveCurrencyFormatters().formatMoneyMetric(value);

/** @deprecated Use useVaultPreferences().formatMoneyAxisTick */
export const formatPhpAxisTick = (value: number): string =>
  getActiveCurrencyFormatters().formatMoneyAxisTick(value);

export const formatUsd = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);

export const formatPercent = (value: number): string =>
  `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;

export const formatCompact = (value: number): string =>
  COMPACT_NUMBER_FORMATTER.format(value);

/** Strip commas and parse a currency text field value. */
export const parseAmountInput = (value: string): number => {
  const cleaned = value.replace(/,/g, "").trim();
  if (!cleaned) {
    return Number.NaN;
  }
  return Number(cleaned);
};

/** Format digits with thousands separators while typing (e.g. 20000 → 20,000). */
export const formatAmountInput = (raw: string): string => {
  const cleaned = raw.replace(/[^\d.]/g, "");
  if (!cleaned) {
    return "";
  }

  const dotIndex = cleaned.indexOf(".");
  const intDigits = dotIndex === -1 ? cleaned : cleaned.slice(0, dotIndex);
  const decimalDigits =
    dotIndex === -1 ? "" : cleaned.slice(dotIndex + 1).replace(/\./g, "");

  const formattedInt = intDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  if (dotIndex === -1) {
    return formattedInt;
  }

  return `${formattedInt}.${decimalDigits.slice(0, 2)}`;
};
