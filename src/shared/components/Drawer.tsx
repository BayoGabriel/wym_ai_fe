import type { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import './Drawer.css';

export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = 420,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="drawer-scrim" />
        <Dialog.Content
          className="drawer"
          style={{ width: `min(${width}px, 100vw)` }}
        >
          <div className="drawer-head">
            <div>
              <Dialog.Title className="drawer-title">{title}</Dialog.Title>
              {description && (
                <Dialog.Description className="drawer-desc">{description}</Dialog.Description>
              )}
            </div>
            <Dialog.Close className="modal-close" aria-label="Close">
              <X size={16} />
            </Dialog.Close>
          </div>
          <div className="drawer-body">{children}</div>
          {footer && <div className="drawer-foot">{footer}</div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
