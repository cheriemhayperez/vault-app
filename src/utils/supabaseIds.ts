const SUPABASE_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const isSupabaseUuid = (value: string): boolean =>
  SUPABASE_UUID_RE.test(value);

/** Throws when delete is attempted on a temp client id (not yet saved to Supabase). */
export const requireSupabaseUuidForDelete = (
  id: string,
  label = "Item",
): void => {
  if (!isSupabaseUuid(id)) {
    throw new Error(`${label} has not synced yet. Refresh the page and try again.`);
  }
};
