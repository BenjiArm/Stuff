import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

type Variant = 'primary' | 'tonal' | 'text' | 'outline' | 'blue' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md';
  icon?: ReactNode;
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-[#0f0f0f] text-white hover:bg-[#272727] disabled:bg-[#e5e5e5] disabled:text-[#909090]',
  tonal: 'bg-black/[0.05] text-[#0f0f0f] hover:bg-black/[0.1] disabled:text-[#909090]',
  text: 'text-[#065fd4] hover:bg-[#def1ff] disabled:text-[#909090] disabled:hover:bg-transparent',
  outline: 'border border-black/[0.1] text-[#0f0f0f] hover:bg-black/[0.05] disabled:text-[#909090]',
  blue: 'bg-[#065fd4] text-white hover:bg-[#0556bf] disabled:bg-[#e5e5e5] disabled:text-[#909090]',
  danger: 'bg-[#cc0000] text-white hover:bg-[#b00000]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'tonal', size = 'md', icon, className = '', children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={`inline-flex shrink-0 select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-full font-medium transition-colors duration-100 disabled:cursor-not-allowed ${
        size === 'sm' ? 'h-8 px-3 text-[13px]' : 'h-9 px-4 text-sm'
      } ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
});

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  size?: number;
  active?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, size = 40, active, className = '', children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex shrink-0 items-center justify-center rounded-full text-[#0f0f0f] transition-colors duration-100 hover:bg-black/[0.07] active:bg-black/[0.12] disabled:opacity-40 ${
        active ? 'bg-black/[0.07]' : ''
      } ${className}`}
      style={{ width: size, height: size }}
      {...rest}
    >
      {children}
    </button>
  );
});
