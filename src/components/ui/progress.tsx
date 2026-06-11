interface ProgressProps {
  value: number;
  className?: string;
  indicatorClassName?: string;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const Progress = ({
  value,
  className = "",
  indicatorClassName = "",
}: ProgressProps) => (
  <div className={`h-2.5 w-full overflow-hidden rounded-full ${className || "bg-slate-200"}`}>
    <div
      className={`h-full rounded-full transition-all ${indicatorClassName}`}
      style={{ width: `${clamp(value, 0, 100)}%` }}
    />
  </div>
);
