"use client";

import { useLayoutEffect, type ReactNode } from "react";

import { useVaultPageHeaderActions } from "@/contexts/vault-page-header-actions-context";

interface VaultPageHeaderActionsProps {
  children: ReactNode;
}

export const VaultPageHeaderActions = ({
  children,
}: VaultPageHeaderActionsProps) => {
  const { setActions } = useVaultPageHeaderActions();

  useLayoutEffect(() => {
    setActions(children);
    return () => setActions(null);
  }, [children, setActions]);

  return null;
};
