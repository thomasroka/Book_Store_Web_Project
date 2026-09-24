import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ invalid = false, className, children, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cn(
          'w-full appearance-none rounded-sm border bg-surface px-3 py-2 pr-8 text-small text-ink focus-ring',
          invalid ? 'border-danger' : 'border-line-strong hover:border-neutral-400',
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);