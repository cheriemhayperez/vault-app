import { Loader2 } from "lucide-react";

export type VaultSubmitMode = "save" | "update";

interface VaultSubmitButtonProps {
  isProcessing?: boolean;
  label: string;
  mode?: VaultSubmitMode;
  processingLabel?: string;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
  onClick?: () => void;
}

export const getVaultSubmitProcessingLabel = (
  label: string,
  mode?: VaultSubmitMode,
): string => {
  if (mode === "update") {
    return "Updating...";
  }
  if (mode === "save") {
    return "Saving...";
  }
  if (/update|edit/i.test(label)) {
    return "Updating...";
  }
  return "Saving...";
};

export const VaultSubmitButton = ({
  isProcessing = false,
  label,
  mode,
  processingLabel,
  disabled = false,
  type = "button",
  className = "",
  onClick,
}: VaultSubmitButtonProps) => {
  const isDisabled = disabled || isProcessing;
  const isValidationDisabled = disabled && !isProcessing;
  const busyLabel =
    processingLabel ?? getVaultSubmitProcessingLabel(label, mode);

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={isProcessing}
      aria-disabled={isDisabled}
      className={`rounded-lg bg-violet-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition enabled:hover:bg-violet-700 ${
        isValidationDisabled ? "opacity-40 shadow-none" : ""
      } ${className}`}
    >
      <span className="inline-flex min-h-5 min-w-[6.5rem] items-center justify-center gap-2">
        {isProcessing ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            {busyLabel}
          </>
        ) : (
          label
        )}
      </span>
    </button>
  );
};
