import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

export const Card = ({ className = "", ...props }: CardProps) => (
  <div
    className={`rounded-2xl border border-slate-200 bg-white/90 p-1 shadow-sm backdrop-blur-md ${className}`}
    {...props}
  />
);

export const CardHeader = ({ className = "", ...props }: CardProps) => (
  <div className={`p-5 pb-3 ${className}`} {...props} />
);

export const CardContent = ({ className = "", ...props }: CardProps) => (
  <div className={`p-5 pt-1 ${className}`} {...props} />
);
