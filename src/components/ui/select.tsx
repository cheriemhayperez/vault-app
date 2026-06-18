import type { SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = ({ className = "", ...props }: SelectProps) => (
  <select
    className={`vault-field-control h-10 w-full rounded-lg px-3 text-sm outline-none ring-0 transition disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500 dark:disabled:bg-transparent ${className}`}
    {...props}
  />
);
