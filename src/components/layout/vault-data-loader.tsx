"use client";

import { useVaultDataLoader } from "@/features/system/use-vault-data-loader";

export const VaultDataLoader = () => {
  const { loadError } = useVaultDataLoader();

  if (!loadError) {
    return null;
  }

  return (
    <div
      role="alert"
      className="fixed bottom-4 left-1/2 z-50 max-w-lg -translate-x-1/2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 shadow-lg"
    >
      <p className="font-semibold">Could not load your Vault data</p>
      <p className="mt-1 text-rose-700">{loadError}</p>
    </div>
  );
};
