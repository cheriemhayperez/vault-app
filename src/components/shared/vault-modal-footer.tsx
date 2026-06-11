import type { ReactNode } from "react";

import { VaultModalCancelButton } from "@/components/shared/vault-modal-cancel-button";

interface VaultModalFooterProps {
  onCancel: () => void;
  cancelDisabled?: boolean;
  cancelClassName?: string;
  children: ReactNode;
  className?: string;
}

export const VaultModalFooter = ({
  onCancel,
  cancelDisabled,
  cancelClassName,
  children,
  className = "mt-6 flex justify-end gap-2",
}: VaultModalFooterProps) => (
  <div className={className}>
    <VaultModalCancelButton
      onClick={onCancel}
      disabled={cancelDisabled}
      className={cancelClassName}
    />
    {children}
  </div>
);
