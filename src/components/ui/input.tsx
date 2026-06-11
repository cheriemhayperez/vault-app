import type { InputHTMLAttributes } from "react";

/** Extra classes for modal fields and pickers that share violet focus styling. */
export const VAULT_FIELD_INPUT_CLASS =
  "h-10 border-slate-300 focus-visible:border-violet-500 focus-visible:ring-violet-500/20";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = ({ className = "", ...props }: InputProps) => (
  <input
    className={`h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-0 transition placeholder:text-slate-400 focus:border-violet-500 read-only:cursor-not-allowed read-only:border-slate-200 read-only:bg-slate-100 read-only:text-slate-600 read-only:focus:border-slate-200 ${className}`}
    {...props}
  />
);
