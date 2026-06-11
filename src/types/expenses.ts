import type { BudgetCategory, Transaction } from "@/types/financial";

export interface VaultLifestyleExpenseMetadata {
  timestamp?: string;
  status?: Transaction["status"];
  bucket?: BudgetCategory;
}

/** Supabase `expenses` table row shape. */
export interface VaultLifestyleExpenseRow {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  category_id: string | null;
  metadata?: VaultLifestyleExpenseMetadata | null;
  created_at?: string;
  updated_at?: string;
}
