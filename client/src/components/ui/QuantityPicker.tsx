import { cn } from '../../utils/cn';

interface QuantityPickerProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
  disabled?: boolean;
}

export function QuantityPicker({
  value,
  onChange,
  min = 1,
  max = 99,
  size = 'md',
  disabled = false,
}: QuantityPickerProps) {
  const btn = cn(
    'inline-flex w-8 items-center justify-center border border-line-strong text-muted transition-colors focus-ring',
    'hover:border-accent hover:text-accent',
    disabled && 'cursor-not-allowed opacity-50',
    size === 'sm' ? 'h-7' : 'h-9'
  );

  return (
    <div className="inline-flex items-stretch overflow-hidden rounded-xs" aria-label="Quantity">
      <button
        type="button"
        className={btn}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span
        className={cn(
          'inline-flex min-w-10 items-center justify-center border-y border-line-strong text-small font-medium text-ink',
          size === 'sm' ? 'h-7' : 'h-9'
        )}
      >
        {value}
      </span>
      <button
        type="button"
        className={btn}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}