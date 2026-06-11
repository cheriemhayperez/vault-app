interface PageLoadingSpinnerProps {
  label?: string;
}

export const PageLoadingSpinner = ({ label }: PageLoadingSpinnerProps) => (
  <div
    className="flex min-h-[320px] flex-col items-center justify-center gap-3"
    role="status"
    aria-live="polite"
    aria-busy="true"
    aria-label={label ?? "Loading"}
  >
    <div
      className="size-8 animate-spin rounded-full border-2 border-slate-200 border-t-violet-600"
      aria-hidden
    />
    {label ? <p className="text-sm text-slate-500">{label}</p> : null}
  </div>
);
