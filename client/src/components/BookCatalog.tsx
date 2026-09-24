import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { bookService } from '../services/book.service';
import { categoryService } from '../services/category.service';
import { useFetch } from '../hooks/useFetch';
import type { Category } from '../types';
import { BookGrid } from './BookGrid';
import { Select } from './ui/Select';
import { Pagination } from './ui/Pagination';
import { ErrorMessage } from './ui/ErrorMessage';
import { PageLoader } from './ui/Spinner';
import { EmptyState } from './ui/EmptyState';
import { cn } from '../utils/cn';

interface BookCatalogProps {
  initialQuery?: string;
  heading?: string;
}

export function BookCatalog({ initialQuery = '', heading }: BookCatalogProps) {
  const [params, setParams] = useSearchParams();
  const search = params.get('q') ?? initialQuery;
  const category = params.get('category') ?? '';
  const sort = params.get('sort') ?? 'newest';
  const page = Number(params.get('page') ?? 1);

  const [searchInput, setSearchInput] = useState(search);
  const { data: categories } = useFetch<Category[]>(() => categoryService.list(), []);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (searchInput !== search) {
        update({ q: searchInput || undefined, page: undefined });
      }
    }, 350);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  function update(patch: Record<string, string | number | undefined>) {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(patch)) {
      if (value === undefined || value === '') next.delete(key);
      else next.set(key, String(value));
    }
    setParams(next, { replace: true });
  }

  const query = useMemo(
    () => ({
      search: search || undefined,
      category: category || undefined,
      sort: sort as 'newest' | 'price-asc' | 'price-desc' | 'rating' | undefined,
      page,
      limit: 20,
    }),
    [search, category, sort, page]
  );

  const { data, loading, error } = useFetch(() => bookService.list(query), [
    search,
    category,
    sort,
    page,
  ]);

  const result = data ?? { books: [], total: 0, totalPages: 1 };

  const sortLabel: Record<string, string> = {
    newest: 'Newest first',
    'price-asc': 'Price: low to high',
    'price-desc': 'Price: high to low',
    rating: 'Highest rated',
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
      <aside className="hidden lg:block">
        <nav className="sticky top-24" aria-label="Categories">
          <p className="text-x-small font-semibold uppercase tracking-wide text-muted">Categories</p>
          <ul className="mt-3 space-y-1">
            <li>
              <button
                onClick={() => update({ category: undefined, page: undefined })}
                className={cn(
                  'w-full rounded-xs px-2 py-1.5 text-left text-small',
                  !category ? 'bg-accent-soft font-medium text-accent' : 'text-body hover:bg-neutral-100'
                )}
              >
                All Books
              </button>
            </li>
            {(categories ?? []).map((cat) => (
              <li key={cat._id}>
                <button
                  onClick={() => update({ category: cat._id, page: undefined })}
                  className={cn(
                    'w-full rounded-xs px-2 py-1.5 text-left text-small',
                    category === cat._id
                      ? 'bg-accent-soft font-medium text-accent'
                      : 'text-body hover:bg-neutral-100'
                  )}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            {heading && <h1 className="editorial-heading text-heading-lg">{heading}</h1>}
            <p className="mt-1 text-small text-muted">
              {result.total} {result.total === 1 ? 'book' : 'books'}
              {category && ` in this category`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search…"
              aria-label="Search"
              className="w-44 rounded-xs border border-line-strong bg-surface px-3 py-2 text-small text-ink placeholder:text-neutral-400 focus-ring sm:hidden"
            />
            <Select value={sort} onChange={(e) => update({ sort: e.target.value, page: undefined })} className="w-auto">
              {Object.entries(sortLabel).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="mt-6">
          {loading && <PageLoader />}
          {error && <ErrorMessage message={error} />}
          {!loading && !error && result.books.length === 0 && (
            <EmptyState
              title="No books found"
              description="Try a different search term or category."
            />
          )}
          {!loading && !error && result.books.length > 0 && <BookGrid books={result.books} />}
        </div>

        <div className="mt-10 flex justify-center">
          <Pagination page={page} totalPages={result.totalPages} onPage={(p) => update({ page: p })} />
        </div>
      </section>
    </div>
  );
}