"use client";

import { TrendingDown, TrendingUp } from "lucide-react";

import type { TransactionDirection } from "@/types/financial";

interface PayRecordDirectionIconProps {
  direction: TransactionDirection;
  size?: "sm" | "md";
}

export const PayRecordDirectionIcon = ({
  direction,
  size = "sm",
}: PayRecordDirectionIconProps) => {
  const isIncome = direction === "CREDIT";
  const boxClass = size === "sm" ? "size-7" : "size-8";
  const iconClass = size === "sm" ? "size-3.5" : "size-4";

  return (
    <span
      className={`vault-direction-icon inline-flex shrink-0 items-center justify-center rounded-full ${boxClass} ${
        isIncome ? "vault-direction-icon--credit" : "vault-direction-icon--debit"
      }`}
      aria-hidden
    >
      {isIncome ? (
        <TrendingUp className={iconClass} strokeWidth={2.25} />
      ) : (
        <TrendingDown className={iconClass} strokeWidth={2.25} />
      )}
    </span>
  );
};
