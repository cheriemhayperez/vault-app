"use client";

import type { InputHTMLAttributes, ReactNode } from "react";

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: ReactNode;
  variant?: "light" | "glass";
}

const variantStyles = {
  light:
    "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-violet-500",
  glass:
    "border-white/15 bg-white/5 text-white placeholder:text-slate-500 focus:border-violet-400/80 focus:bg-white/10",
};

export const AuthField = ({
  label,
  icon,
  id,
  variant = "light",
  className = "",
  ...props
}: AuthFieldProps) => {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className="sr-only">
        {label}
      </label>
      <div className="relative">
        <span
          className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 ${
            variant === "glass" ? "text-slate-400" : "text-slate-400"
          }`}
        >
          {icon}
        </span>
        <input
          id={fieldId}
          className={`h-11 w-full rounded-lg border pl-11 pr-4 text-sm outline-none ring-0 transition ${variantStyles[variant]} ${className}`}
          {...props}
        />
      </div>
    </div>
  );
};
