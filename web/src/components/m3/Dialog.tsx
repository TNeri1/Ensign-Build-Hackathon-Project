import { useEffect, useId, useRef, type MouseEvent, type SyntheticEvent } from 'react';
import { Button } from './Button';
import { Icon } from './Icon';
import type { IconName } from './icons';
import './Dialog.css';

export interface DialogProps {
  open: boolean;
  title: string;
  icon?: IconName;
  children: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  /** Colors the confirm action in the error role and focuses Cancel first. */
  destructive?: boolean;
  onConfirm: () => void;
  /** Called on Cancel, Escape and scrim click. The parent sets open={false}. */
  onClose: () => void;
}

const FIELD = 'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled])';

/**
 * Material 3 basic dialog on the native <dialog> + showModal() (top layer, inert background,
 * focus trap). Focus moves into the dialog on open and back to the opener on close.
 */
export function Dialog({
  open,
  title,
  icon,
  children,
  confirmLabel,
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onClose,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const downOnScrim = useRef(false);
  const titleId = useId();
  const bodyId = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      if (typeof d.showModal === 'function') d.showModal();
      else d.setAttribute('open', '');
      const target = d.querySelector<HTMLElement>(FIELD) ?? d.querySelector<HTMLElement>('[data-autofocus]');
      target?.focus();
    } else if (!open && d.open) {
      if (typeof d.close === 'function') d.close();
      else d.removeAttribute('open');
      opener.current?.focus();
      opener.current = null;
    }
  }, [open]);

  // Never leave a modal open in the top layer if the component unmounts while open.
  useEffect(() => {
    const d = ref.current;
    return () => {
      if (d?.open && typeof d.close === 'function') d.close();
    };
  }, []);

  const onCancel = (e: SyntheticEvent<HTMLDialogElement>) => {
    e.preventDefault(); // Escape: let the parent own the open state
    onClose();
  };
  const onMouseDown = (e: MouseEvent<HTMLDialogElement>) => {
    downOnScrim.current = e.target === e.currentTarget;
  };
  const onClick = (e: MouseEvent<HTMLDialogElement>) => {
    if (downOnScrim.current && e.target === e.currentTarget) onClose();
    downOnScrim.current = false;
  };

  return (
    <dialog
      ref={ref}
      className={`md-dialog${icon ? ' md-dialog--with-icon' : ''}`}
      aria-labelledby={titleId}
      aria-describedby={bodyId}
      onCancel={onCancel}
      onMouseDown={onMouseDown}
      onClick={onClick}
    >
      <div className="md-dialog__container">
        {icon && <Icon name={icon} size={24} className="md-dialog__icon" />}
        <h2 id={titleId} className="md-dialog__headline">
          {title}
        </h2>
        <div id={bodyId} className="md-dialog__content">
          {children}
        </div>
        <div className="md-dialog__actions">
          <Button variant="text" onClick={onClose} data-autofocus={destructive ? '' : undefined}>
            {cancelLabel}
          </Button>
          <Button
            variant="text"
            className={destructive ? 'md-dialog__destructive' : undefined}
            onClick={onConfirm}
            data-autofocus={destructive ? undefined : ''}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
