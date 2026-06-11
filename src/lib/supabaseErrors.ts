export const formatSupabaseError = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (error && typeof error === "object") {
    const record = error as {
      message?: string;
      code?: string;
      details?: string;
      hint?: string;
    };

    const parts = [
      record.message,
      record.code ? `code: ${record.code}` : null,
      record.details ? `details: ${record.details}` : null,
      record.hint ? `hint: ${record.hint}` : null,
    ].filter(Boolean);

    if (parts.length > 0) {
      return parts.join(" — ");
    }
  }

  return "Unknown Supabase error";
};

export const isTableMissingError = (error: unknown): boolean => {
  const message = formatSupabaseError(error).toLowerCase();
  return (
    message.includes("pgrst205") ||
    message.includes("could not find the table") ||
    (message.includes("relation") && message.includes("does not exist"))
  );
};

/** @deprecated Use isTableMissingError */
export const isRecordsTableMissingError = isTableMissingError;

export const getVaultSetupMessage = (): string =>
  "Vault tables are missing. In Supabase SQL Editor, run in order: `supabase/categories.sql`, `supabase/budget.sql`, `supabase/records.sql`, `supabase/expenses.sql`, `supabase/reminders.sql`, then refresh.";

/** @deprecated Use getVaultSetupMessage */
export const getRecordsSetupMessage = (): string =>
  "The `records` or `expenses` table is missing. Run `supabase/records.sql` and `supabase/expenses.sql` after categories.sql, then refresh.";

/** @deprecated Use getVaultSetupMessage */
export const getCategoriesSetupMessage = (): string =>
  "Vault category tables are missing. Run `supabase/categories.sql` and `supabase/budget.sql`, then refresh.";

export const throwTableError = (table: string, error: unknown): never => {
  const message = formatSupabaseError(error);
  if (isTableMissingError(error)) {
    throw new Error(`Could not find the public.${table} table. ${message}`);
  }
  throw new Error(message);
};
