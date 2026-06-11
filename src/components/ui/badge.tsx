import type { HTMLAttributes } from "react";

type BadgeProps = HTMLAttributes<HTMLSpanElement>;

export const Badge = ({ className = "", ...props }: BadgeProps) => (
  <span
    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${className}`}
    {...props}
  />
);
