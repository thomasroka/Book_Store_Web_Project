import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-accent text-paper hover:bg-accent-dark active:bg-accent-deep disabled:bg-neutral-200 disabled:text-neutral-400',
  secondary:
    'bg-transparent text-accent border border-line-strong hover:border-accent hover:bg-accent-soft disabled:border-line disabled:text-neutral-400',
  ghost:
    'bg-transparent text-body hover:text-ink hover:bg-neutral-100 disabled:text-neutral-400',
  danger:
    'bg-transparent text-danger border border-line-strong hover:border-danger hover:bg-danger-soft disabled:border-line disabled:text-neutral-400',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-small',
  md: 'px-4 py-2 text-small',
  lg: 'px-5 py-2.5 text-title',
};

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-sm font-medium transition-colors duration-150 focus-ring',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}