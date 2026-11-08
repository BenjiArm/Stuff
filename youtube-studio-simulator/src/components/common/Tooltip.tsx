import { useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/** Dark Studio tooltip that appears after a short hover delay. */
export function Tooltip({ content, children, placement = 'bottom', className = '' }: { content: ReactNode; children: ReactNode; placement?: 'top' | 'bottom'; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const timer = useRef<number>();
  const show = () => {
    timer.current = window.setTimeout(() => {
      const r = ref.current?.getBoundingClientRect();
      if (r) setPos({ x: r.left + r.width / 2, y: placement === 'bottom' ? r.bottom + 8 : r.top - 8 });
    }, 350);
  };
  const hide = () => {
    window.clearTimeout(timer.current);
    setPos(null);
  };
  return (
    <span ref={ref} onMouseEnter={show} onMouseLeave={hide} onMouseDown={hide} className={`inline-flex ${className}`}>
      {children}
      {pos &&
        content &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[80] max-w-[280px] animate-fade-in rounded bg-[#616161] px-2 py-1.5 text-xs leading-4 text-white shadow"
            style={{ left: pos.x, top: pos.y, transform: `translate(-50%, ${placement === 'bottom' ? '0' : '-100%'})` }}
          >
            {content}
          </div>,
          document.body,
        )}
    </span>
  );
}
