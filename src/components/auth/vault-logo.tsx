import { useId } from "react";

interface VaultLogoProps {
  className?: string;
  height?: number;
}

export const VaultLogo = ({
  className = "",
  height = 40,
}: VaultLogoProps) => {
  const gradientId = useId();
  const width = Math.round(height * 2.75);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 132 48"
      width={width}
      height={height}
      fill="none"
      aria-label="Vault"
      role="img"
      className={`shrink-0 ${className}`}
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="6"
          y1="4"
          x2="42"
          y2="44"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--vault-accent)" />
          <stop offset="1" stopColor="var(--vault-accent-deep)" />
        </linearGradient>
      </defs>

      <rect
        x="0"
        y="0"
        width="48"
        height="48"
        rx="12"
        fill={`url(#${gradientId})`}
      />
      <path
        d="M24 13.5c-5.2 0-7.5 3.2-7.5 6.8 0 5.8 7.5 11.2 7.5 11.2s7.5-5.4 7.5-11.2c0-3.6-2.3-6.8-7.5-6.8Z"
        stroke="white"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M18.5 26.5 22 23l3 2 4.5-5"
        stroke="white"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="18.5" cy="26.5" r="1.5" fill="white" />

      <text
        x="58"
        y="32.5"
        fill="var(--foreground)"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontSize="26"
        fontWeight="700"
        letterSpacing="-0.02em"
      >
        Vault
      </text>
    </svg>
  );
};
