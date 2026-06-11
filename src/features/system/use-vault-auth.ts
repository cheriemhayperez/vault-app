"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabaseClient";
import { getCurrentVaultUser } from "@/api/user";

type AuthStatus = "checking" | "authenticated" | "unauthenticated";

export const useVaultAuth = () => {
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState<AuthStatus>("checking");

  useEffect(() => {
    let mounted = true;

    const resolveAuth = async () => {
      const user = await getCurrentVaultUser();
      if (!mounted) {
        return;
      }

      if (!user) {
        setAuthStatus("unauthenticated");
        router.replace("/login");
        return;
      }

      setAuthStatus("authenticated");
    };

    void resolveAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) {
        return;
      }

      if (!session?.user) {
        setAuthStatus("unauthenticated");
        router.replace("/login");
        return;
      }

      setAuthStatus("authenticated");
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  return { authStatus, isAuthenticated: authStatus === "authenticated" };
};
