import type { OrderStatus, ReviewStatus } from '../../types';
import { cn } from '../../utils/cn';

const orderStyles: Record<OrderStatus, string> = {
  pending: 'bg-warning-soft text-warning',
  confirmed: 'bg-info-soft text-info',
  shipped: 'bg-info-soft text-info',
  delivered: 'bg-success-soft text-success',
  cancelled: 'bg-neutral-100 text-neutral-500',
};

const reviewStyles: Record<ReviewStatus, string> = {
  pending: 'bg-warning-soft text-warning',
  approved: 'bg-success-soft text-success',
  rejected: 'bg-danger-soft text-danger',
};

interface StatusBadgeProps {
  status: OrderStatus | ReviewStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const style =
    status in orderStyles
      ? orderStyles[status as OrderStatus]
      : reviewStyles[status as ReviewStatus];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-xs px-2 py-0.5 text-x-small font-medium uppercase tracking-wide',
        style
      )}
    >
      {status}
    </span>
  );
}