import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ invalid = false, className, ...props }, ref) {
    return (
      <textarea
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