import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn';

interface SearchBarProps {
  className?: string;
  initialValue?: string;
  onSearch?: (term: string) => void;
  navigatesToResults?: boolean;
}

export function SearchBar({
  className,
  initialValue = '',
  onSearch,
  navigatesToResults,
}: SearchBarProps) {
  const [term, setTerm] = useState(initialValue);
  const navigate = useNavigate();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const value = term.trim();
    if (onSearch) {
      onSearch(value);
      return;
    }
    if (navigatesToResults) {
      navigate(value ? `/search?q=${encodeURIComponent(value)}` : '/search');
    }
  };

  return (
    <form role="search" onSubmit={submit} className={cn('relative', className)}>
      <svg
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
        <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Search titles, authors, ISBN…"
        aria-label="Search books"
        className="w-full rounded-xs border border-line-strong bg-surface py-2 pl-9 pr-3 text-small text-ink placeholder:text-neutral-400 focus-ring"
      />
    </form>
  );
}