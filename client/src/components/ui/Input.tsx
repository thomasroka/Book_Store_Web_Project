import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ invalid = false, className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full rounded-sm border bg-surface px-3 py-2 text-small text-ink placeholder:text-neutral-400 focus-ring',
          invalid ? 'border-danger' : 'border-line-strong hover:border-neutral-400',
          className
        )}
        {...props}
      />
    );
  }
);