interface VaultModalCancelButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export const VaultModalCancelButton = ({
  onClick,
  disabled = false,
  label = "Cancel",
  className = "",
}: VaultModalCancelButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 ${className}`}
  >
    {label}
  </button>
);
