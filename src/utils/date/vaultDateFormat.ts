import type { VaultDateFormatId } from "@/utils/vaultPreferences";

const pad2 = (value: number): string => String(value).padStart(2, "0");

const toValidDate = (value: string | Date | number): Date | null => {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatVaultDate = (
  value: string | Date | number,
  formatId: VaultDateFormatId,
): string => {
  const date = toValidDate(value);
  if (!date) {
    return "—";
  }

  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  switch (formatId) {
    case "dmy_long":
      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    case "mdy_numeric":
      return `${pad2(month)}/${pad2(day)}/${year}`;
    case "dmy_numeric":
      return `${pad2(day)}/${pad2(month)}/${year}`;
    case "iso":
      return `${year}-${pad2(month)}-${pad2(day)}`;
    case "mdy_long":
    default:
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
  }
};

let activeDateFormat: VaultDateFormatId = "mdy_long";

export const setActiveDateFormat = (formatId: VaultDateFormatId): void => {
  activeDateFormat = formatId;
};

export const getActiveDateFormat = (): VaultDateFormatId => activeDateFormat;

export const formatActiveVaultDate = (value: string | Date | number): string =>
  formatVaultDate(value, activeDateFormat);
