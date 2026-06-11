import type { ReactNode } from "react";

interface FormFieldLabelProps {
  children: ReactNode;
  required?: boolean;
  optional?: boolean;
  htmlFor?: string;
}

export const FormFieldLabel = ({
  children,
  required = false,
  optional = false,
  htmlFor,
}: FormFieldLabelProps) => (
  <label htmlFor={htmlFor} className="text-xs font-medium text-slate-700">
    {children}
    {required ? <span className="text-rose-500"> *</span> : null}
    {optional ? (
      <span className="font-normal text-slate-400"> (optional)</span>
    ) : null}
  </label>
);
