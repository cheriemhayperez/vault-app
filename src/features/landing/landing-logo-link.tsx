"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { VaultLogo } from "@/components/auth/vault-logo";

interface LandingLogoLinkProps {
  className?: string;
  height?: number;
  onClick?: () => void;
}

export const LandingLogoLink = ({
  className = "",
  height = 36,
  onClick,
}: LandingLogoLinkProps) => {
  const pathname = usePathname();

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.();

    if (pathname === "/") {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <Link href="/" className={className} onClick={handleClick}>
      <VaultLogo height={height} />
    </Link>
  );
};
