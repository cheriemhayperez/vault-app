import { Suspense } from "react";

import { AuthCallbackClient } from "./auth-callback-client";
import { PageLoadingSpinner } from "@/components/ui/page-loading-spinner";

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center">
          <PageLoadingSpinner label="Signing you in…" />
        </div>
      }
    >
      <AuthCallbackClient />
    </Suspense>
  );
}
