"use client";

import { useEffect, useState } from "react";

import { getCurrentVaultUser } from "@/api/user";
import { supabase } from "@/lib/supabaseClient";

export const useHome = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    const resolveSession = async () => {
      const user = await getCurrentVaultUser();
      if (mounted) {
        setIsAuthenticated(Boolean(user));
        setIsLoading(false);
      }
    };

    void resolveSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setIsAuthenticated(Boolean(session?.user));
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { isLoading, isAuthenticated };
};
