"use client";

import { useEffect, useRef, useState } from "react";

import { useVaultReady } from "@/contexts/vault-ready-context";
import { loadVaultData } from "./load-vault-data";
import { useAppDispatch } from "@/store";

export const useVaultDataLoader = () => {
  const dispatch = useAppDispatch();
  const { setVaultReady } = useVaultReady();
  const hasLoadedRef = useRef(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      setLoadError(null);
      const result = await loadVaultData(dispatch);

      if (!isMounted) {
        return;
      }

      if (result.ok) {
        hasLoadedRef.current = true;
      } else {
        setLoadError(result.message);
      }

      setVaultReady(true);
    };

    void run();

    return () => {
      isMounted = false;
      setVaultReady(true);
    };
  }, [dispatch, setVaultReady]);

  return { loadError };
};
