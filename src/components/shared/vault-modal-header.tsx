import type { ReactNode } from "react";
import { X } from "lucide-react";

interface VaultModalHeaderProps {
  title: string;
  titleId?: string;
  description?: ReactNode;
  onClose: () => void;
  closeDisabled?: boolean;
}

export const VaultModalHeader = ({
  title,
  titleId,
  description,
  onClose,
  closeDisabled,
}: VaultModalHeaderProps) => (
  <div className="flex items-start justify-between gap-4">
    <div>
      <h2
        id={titleId}
        className="text-lg font-semibold tracking-tight text-slate-900"
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      ) : null}
    </div>
    <button
      type="button"
      onClick={onClose}
      disabled={closeDisabled}
      className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
      aria-label="Close"
    >
      <X className="size-4" />
    </button>
  </div>
);
