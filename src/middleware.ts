import { type NextRequest, NextResponse } from "next/server";

import { isPublicLightOnlyPath } from "@/utils/theme";

export const middleware = (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  if (!isPublicLightOnlyPath(pathname)) {
    return NextResponse.next();
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-vault-force-light-theme", "1");

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
};

export const config = {
  matcher: ["/login", "/signup"],
};
