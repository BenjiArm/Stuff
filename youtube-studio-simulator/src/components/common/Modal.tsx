import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { IconButton } from './Button';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: number | string;
  height?: number | string;
  headerExtra?: ReactNode;
  bodyClassName?: string;
  dismissible?: boolean;
}

export function Modal({ open, onClose, title, children, footer, width = 560, height, headerExtra, bodyClassName = '', dismissible = true }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && dismissible && onClose();
    document.addEventListener('keydown', esc);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', esc);
      document.body.style.overflow = prev;
    };
  }, [open, onClose, dismissible]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-black/50 p-4" onMouseDown={(e) => e.target === e.currentTarget && dismissible && onClose()}>
      <div
        role="dialog"
        aria-modal="true"
        className="flex max-h-[calc(100vh-32px)] w-full animate-pop-in flex-col overflow-hidden rounded-xl bg-white shadow-dialog"
        style={{ maxWidth: width, height }}
      >
        {title !== undefined && (
          <div className="flex shrink-0 items-center gap-2 border-b border-black/[0.1] py-2 pl-6 pr-3">
            <h2 className="min-w-0 flex-1 truncate py-2 text-xl font-medium text-[#0f0f0f]">{title}</h2>
            {headerExtra}
            <IconButton label="Close" onClick={onClose}>
              <X size={22} strokeWidth={1.75} />
            </IconButton>
          </div>
        )}
        <div className={`min-h-0 flex-1 overflow-y-auto ${bodyClassName || 'px-6 py-5'}`}>{children}</div>
        {footer && <div className="flex shrink-0 items-center justify-end gap-2 border-t border-black/[0.1] px-6 py-3">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

interface ConfirmProps {
  open: boolean;
  title: string;
  body: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
  danger?: boolean;
  requireCheck?: string;
  checked?: boolean;
  onCheck?: (v: boolean) => void;
}

export function ConfirmDialog({ open, title, body, confirmLabel, onConfirm, onClose, danger, requireCheck, checked, onCheck }: ConfirmProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      width={480}
      title={title}
      footer={
        <>
          <button className="h-9 rounded-full px-4 text-sm font-medium hover:bg-black/[0.05]" onClick={onClose}>
            Cancel
          </button>
          <button
            disabled={!!requireCheck && !checked}
            className={`h-9 rounded-full px-4 text-sm font-medium disabled:cursor-not-allowed disabled:bg-[#e5e5e5] disabled:text-[#909090] ${danger ? 'bg-[#0f0f0f] text-white hover:bg-[#272727]' : 'bg-[#0f0f0f] text-white hover:bg-[#272727]'}`}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="text-sm leading-6 text-[#0f0f0f]">{body}</div>
      {requireCheck && (
        <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm">
          <input type="checkbox" className="studio-check mt-0.5" checked={!!checked} onChange={(e) => onCheck?.(e.target.checked)} />
          <span>{requireCheck}</span>
        </label>
      )}
    </Modal>
  );
}
