"use client";

import { Check } from "lucide-react";
import type { InputHTMLAttributes, ReactNode } from "react";

interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: ReactNode;
}

export const Checkbox = ({
  className = "",
  label,
  id,
  checked,
  disabled,
  onChange,
  ...props
}: CheckboxProps) => {
  const inputId =
    id ?? (typeof label === "string" ? label.replace(/\s+/g, "-").toLowerCase() : undefined);

  return (
    <label
      htmlFor={inputId}
      className={`inline-flex cursor-pointer items-center gap-2 ${
        disabled ? "cursor-not-allowed opacity-60" : ""
      } ${className}`}
    >
      <span className="relative flex size-4 shrink-0 items-center justify-center">
        <input
          {...props}
          id={inputId}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className={`flex size-4 items-center justify-center rounded border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-violet-500 peer-focus-visible:ring-offset-1 ${
            checked
              ? "border-violet-600 bg-violet-600 text-white"
              : "border-slate-300 bg-white"
          }`}
        >
          {checked ? <Check className="size-3" strokeWidth={3} /> : null}
        </span>
      </span>
      {label ? (
        <span className="text-sm font-medium text-slate-700">{label}</span>
      ) : null}
    </label>
  );
};
