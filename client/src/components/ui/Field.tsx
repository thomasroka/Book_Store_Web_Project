import type { ReactNode } from 'react';

export interface FieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, error, hint, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-x-small font-medium uppercase tracking-wide text-muted"
      >
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-x-small text-muted">{hint}</p>}
      {error && <p className="text-x-small text-danger">{error}</p>}
    </div>
  );
}