import type { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import './Modal.css';

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  wide,
}: {
  open: boolean;
  title: ReactNode;
  description?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-scrim" />
        <Dialog.Content
          className={`modal${wide ? ' modal--wide' : ''}`}
          aria-describedby={description ? undefined : undefined}
        >
          <div className="modal-head">
            <div>
              <Dialog.Title className="modal-title">{title}</Dialog.Title>
              {description && (
                <Dialog.Description className="modal-desc">{description}</Dialog.Description>
              )}
            </div>
            <Dialog.Close className="modal-close" aria-label="Close">
              <X size={16} />
            </Dialog.Close>
          </div>
          <div className="modal-body">{children}</div>
          {footer && <div className="modal-foot">{footer}</div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
