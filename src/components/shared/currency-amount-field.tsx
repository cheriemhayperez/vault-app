import type { ReactNode } from "react";

import { FormFieldLabel } from "@/components/shared/form-field-label";
import { Input } from "@/components/ui/input";
import { formatAmountInput } from "@/utils/format/formatters";

interface CurrencyAmountFieldProps {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
  inputClassName?: string;
  error?: string;
  helperText?: ReactNode;
}

const defaultInputClassName =
  "h-10 border-slate-300 pl-8 focus-visible:border-violet-500 focus-visible:ring-violet-500/20";

/** Emphasized amount field styling used in record/expense modals. */
export const VIOLET_AMOUNT_INPUT_CLASS =
  "border-violet-500 pl-9 focus:border-violet-500 focus:ring-violet-100";

export const CurrencyAmountField = ({
  id,
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  autoFocus = false,
  placeholder = "0.00",
  inputClassName = defaultInputClassName,
  error,
  helperText,
}: CurrencyAmountFieldProps) => (
  <div className="space-y-1.5">
    <FormFieldLabel required={required} htmlFor={id}>
      {label}
    </FormFieldLabel>
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
        ₱
      </span>
      <Input
        id={id}
        type="text"
        autoFocus={autoFocus}
        inputMode="decimal"
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        className={`${inputClassName}${error ? " border-rose-400" : ""}`}
        onChange={(event) => onChange(formatAmountInput(event.target.value))}
      />
    </div>
    {error ? <p className="text-xs text-rose-500">{error}</p> : null}
    {helperText}
  </div>
);
