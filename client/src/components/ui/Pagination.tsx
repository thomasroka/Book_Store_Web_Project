export function Pagination({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages: Array<number | '…'> = [];
  const range = (start: number, end: number) => {
    for (let i = start; i <= end; i += 1) pages.push(i);
  };

  if (totalPages <= 7) {
    range(1, totalPages);
  } else {
    if (page <= 4) {
      range(1, 5);
      pages.push('…');
      range(totalPages - 1, totalPages);
    } else if (page >= totalPages - 3) {
      range(1, 2);
      pages.push('…');
      range(totalPages - 4, totalPages);
    } else {
      range(1, 1);
      pages.push('…');
      range(page - 1, page + 1);
      pages.push('…');
      range(totalPages, totalPages);
    }
  }

  const base =
    'inline-flex h-8 min-w-8 items-center justify-center rounded-xs px-2 text-small transition-colors';
  const inactive = 'text-body hover:bg-neutral-100';
  const active = 'bg-accent font-medium text-paper';

  return (
    <nav className="flex items-center gap-1" aria-label="Pagination">
      <button
        className={`${base} ${inactive}`}
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
      >
        ←
      </button>
      {pages.map((p, i) =>
        typeof p === 'number' ? (
          <button
            key={`${p}-${i}`}
            className={`${base} ${p === page ? active : inactive}`}
            onClick={() => onPage(p)}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        ) : (
          <span key={`gap-${i}`} className="px-1 text-muted">
            …
          </span>
        )
      )}
      <button
        className={`${base} ${inactive}`}
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
      >
        →
      </button>
    </nav>
  );
}