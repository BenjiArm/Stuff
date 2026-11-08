import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';

export function useClickOutside(refs: RefObject<HTMLElement | null>[], onOutside: () => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const handler = (e: MouseEvent) => {
      if (refs.some((r) => r.current && r.current.contains(e.target as Node))) return;
      onOutside();
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onOutside();
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', esc);
    };
  }, [enabled, onOutside, refs]);
}

interface PopoverProps {
  anchor: RefObject<HTMLElement | null>;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  align?: 'left' | 'right';
  width?: number;
  offset?: number;
  className?: string;
  placement?: 'below' | 'over';
}

/** Floating panel rendered in a portal, positioned against an anchor element. */
export function Popover({ anchor, open, onClose, children, align = 'left', width, offset = 4, className = '', placement = 'below' }: PopoverProps) {
  const panel = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const close = useCallback(() => onClose(), [onClose]);
  useClickOutside([panel, anchor as RefObject<HTMLElement>], close, open);

  useLayoutEffect(() => {
    if (!open || !anchor.current) return;
    const place = () => {
      const r = anchor.current!.getBoundingClientRect();
      const w = width ?? panel.current?.offsetWidth ?? 200;
      const h = panel.current?.offsetHeight ?? 0;
      let left = align === 'left' ? r.left : r.right - w;
      left = Math.max(8, Math.min(left, window.innerWidth - w - 8));
      let top = placement === 'over' ? r.top : r.bottom + offset;
      if (top + h > window.innerHeight - 8) top = Math.max(8, (placement === 'over' ? r.bottom : r.top - offset) - h);
      setPos({ top, left });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, anchor, align, width, offset, placement]);

  if (!open) return null;
  return createPortal(
    <div
      ref={panel}
      className={`fixed z-[60] animate-pop-in rounded-xl bg-white py-2 shadow-menu ${className}`}
      style={{ top: pos?.top ?? -9999, left: pos?.left ?? -9999, width }}
    >
      {children}
    </div>,
    document.body,
  );
}

interface MenuItemProps {
  icon?: ReactNode;
  children: ReactNode;
  onClick?: () => void;
  selected?: boolean;
  danger?: boolean;
  disabled?: boolean;
  trailing?: ReactNode;
}

export function MenuItem({ icon, children, onClick, selected, danger, disabled, trailing }: MenuItemProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex min-h-[40px] w-full items-center gap-4 px-4 py-2 text-left text-sm transition-colors hover:bg-black/[0.05] disabled:cursor-default disabled:text-[#909090] disabled:hover:bg-transparent ${
        selected ? 'bg-black/[0.05]' : ''
      } ${danger ? 'text-[#cc0000]' : 'text-[#0f0f0f]'}`}
    >
      {icon && <span className="flex h-6 w-6 shrink-0 items-center justify-center text-[#0f0f0f]">{icon}</span>}
      <span className="flex-1">{children}</span>
      {trailing}
    </button>
  );
}

export function MenuDivider() {
  return <div className="my-2 h-px bg-black/[0.1]" />;
}

/** Convenience hook for anchor + open state. */
export function useMenu<T extends HTMLElement = HTMLButtonElement>() {
  const ref = useRef<T>(null);
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((o) => !o), []);
  const close = useCallback(() => setOpen(false), []);
  return { ref, open, setOpen, toggle, close };
}
