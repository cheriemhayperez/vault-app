/** Temporary client id before Supabase assigns a UUID on insert. */
export const createTempTransactionId = (): string =>
  `tx-${new Date().toISOString()}-${Math.random().toString(36).slice(2, 8)}`;
