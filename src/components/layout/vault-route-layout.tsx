import { VaultLayout } from "@/components/layout/vault-layout";

export default function VaultRouteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <VaultLayout>{children}</VaultLayout>;
}
