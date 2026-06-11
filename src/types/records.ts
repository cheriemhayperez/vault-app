import type { Transaction } from "@/types/financial";

export type VaultPayRecordType = "income" | "deduction";

export interface VaultPayRecordMetadata {
  timestamp?: string;
  status?: Transaction["status"];
  linkedSalaryRecordId?: string;
  linkedInvestmentId?: string;
  investmentTypeLabel?: string;
  investmentName?: string;
  /** User-entered description (optional). Title column holds category label. */
  description?: string;
}

/** Supabase `records` table row shape. */
export interface VaultPayRecordRow {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  type: VaultPayRecordType;
  category_id: string | null;
  investment_id?: string | null;
  metadata?: VaultPayRecordMetadata | null;
  created_at?: string;
  updated_at?: string;
}
