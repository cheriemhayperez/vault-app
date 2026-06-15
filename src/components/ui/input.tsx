import type { InputHTMLAttributes } from "react";

/** Extra classes for modal fields and pickers that share violet focus styling. */
export const VAULT_FIELD_INPUT_CLASS = "vault-field-control";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = ({ className = "", ...props }: InputProps) => (
  <input
    className={`vault-field-control h-10 w-full rounded-lg px-3 text-sm outline-none ring-0 placeholder:text-slate-400 read-only:cursor-not-allowed read-only:border-slate-200 read-only:bg-slate-100 read-only:text-slate-600 read-only:focus:border-slate-200 ${className}`}
    {...props}
  />
);
