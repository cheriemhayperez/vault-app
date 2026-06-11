import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";

import { Providers } from "@/components/ui/providers";
import {
  readThemeModeFromCookie,
  THEME_MODE_COOKIE,
} from "@/utils/theme";
import "@/styles/global.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vault — Freelancer Finance Dashboard",
  description:
    "Take-home pay, government deductions, and 50/30/20 budgeting for Filipino freelancers.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const themeMode = readThemeModeFromCookie(
    cookieStore.get(THEME_MODE_COOKIE)?.value,
  );

  return (
    <html
      lang="en"
      data-theme={themeMode}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-screen w-full overflow-x-hidden font-sans antialiased">
        <Providers>
          <div className="flex min-h-screen w-full flex-col">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
