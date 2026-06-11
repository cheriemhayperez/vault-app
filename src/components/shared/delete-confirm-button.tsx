import { Loader2 } from "lucide-react";

interface DeleteConfirmButtonProps {
  isProcessing?: boolean;
  label?: string;
  className?: string;
  onClick: () => void;
}

export const DeleteConfirmButton = ({
  isProcessing = false,
  label = "Delete",
  className = "",
  onClick,
}: DeleteConfirmButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={isProcessing}
    aria-busy={isProcessing}
    className={`rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-90 ${className}`}
  >
    <span className="inline-flex min-h-5 min-w-[6.5rem] items-center justify-center gap-2">
      {isProcessing ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Deleting...
        </>
      ) : (
        label
      )}
    </span>
  </button>
);
