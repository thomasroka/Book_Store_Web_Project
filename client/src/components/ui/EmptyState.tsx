import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-line-strong px-6 py-16 text-center">
      <h3 className="font-serif text-heading text-ink">{title}</h3>
      {description && <p className="mt-2 max-w-md text-small text-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}