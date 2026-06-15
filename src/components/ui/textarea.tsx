import type { TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = ({ className = "", ...props }: TextareaProps) => (
  <textarea
    className={`vault-field-control w-full resize-none rounded-lg px-3 py-2 text-sm outline-none ring-0 transition placeholder:text-slate-400 disabled:cursor-not-allowed ${className}`}
    {...props}
  />
);
