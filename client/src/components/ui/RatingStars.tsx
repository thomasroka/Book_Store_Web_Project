import { cn } from '../../utils/cn';

interface RatingStarsProps {
  value: number;
  count?: number;
  size?: 'sm' | 'md';
}

function Star({ filled, half }: { filled: boolean; half?: boolean }) {
  return (
    <span className="relative inline-block" aria-hidden="true">
      <svg width={14} height={14} viewBox="0 0 24 24" className="text-neutral-300">
        <path
          fill="currentColor"
          d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.3l-5.8 3.1 1.1-6.5L2.6 9.3l6.5-.9z"
        />
      </svg>
      {filled && (
        <span className="absolute inset-0 overflow-hidden" style={{ width: half ? '50%' : '100%' }}>
          <svg width={14} height={14} viewBox="0 0 24 24" className="text-warning">
            <path
              fill="currentColor"
              d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.3l-5.8 3.1 1.1-6.5L2.6 9.3l6.5-.9z"
            />
          </svg>
        </span>
      )}
    </span>
  );
}

export function RatingStars({ value, count, size = 'sm' }: RatingStarsProps) {
  const rounded = Math.round(value * 2) / 2;

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = rounded >= star;
          const half = !filled && rounded === star - 0.5;
          return <Star key={star} filled={filled} half={half} />;
        })}
      </div>
      {typeof count === 'number' && (
        <span className={cn('text-muted', size === 'sm' ? 'text-x-small' : 'text-small')}>
          {value.toFixed(1)} · {count}
        </span>
      )}
    </div>
  );
}