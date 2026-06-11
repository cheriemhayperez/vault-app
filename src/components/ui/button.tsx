import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "default" | "outline" | "destructive";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClassName: Record<ButtonVariant, string> = {
  default:
    "bg-[#7c3aed] text-white hover:bg-[#6d28d9] focus-visible:outline-violet-400",
  outline:
    "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 focus-visible:outline-slate-300",
  destructive:
    "bg-rose-600 text-white hover:bg-rose-700 focus-visible:outline-rose-400",
};

export const Button = ({
  className = "",
  variant = "default",
  ...props
}: ButtonProps) => (
  <button
    className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40 ${variantClassName[variant]} ${className}`}
    {...props}
  />
);
