import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import { categoryService } from '../../services/category.service';
import { useFetch } from '../../hooks/useFetch';
import { getErrorMessage } from '../../services/api';
import { formatCurrency } from '../../utils/format';
import { cn } from '../../utils/cn';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Pagination } from '../../components/ui/Pagination';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { BookCover } from '../../components/BookCover';
import { Table, TableBody, Td, Th, Tr } from '../../components/ui/Table';
import { PageLoader } from '../../components/ui/Spinner';
import { ErrorMessage } from '../../components/ui/ErrorMessage';

export function AdminBooksPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [busyDelete, setBusyDelete] = useState(false);

  const { data: categories } = useFetch(() => categoryService.list(), []);

  const query = useMemo(
    () => ({ search, category: category || undefined, page, limit: 20 }),
    [search, category, page]
  );
  const { data, loading, error, refetch } = useFetch(() => adminService.listBooks(query), [
    search,
    category,
    page,
  ]);

  const books = data?.items ?? [];
  const meta = data?.meta;

  const confirmDelete = () => {
    if (!deleteId) return;
    setBusyDelete(true);
    adminService
      .deleteBook(deleteId)
      .then(() => {
        setDeleteId(null);
        if (books.length === 1 && page > 1) setPage(page - 1);
        void refetch();
      })
      .catch((err) => window.alert(getErrorMessage(err)))
      .finally(() => setBusyDelete(false));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search title, author, ISBN…"
            aria-label="Search books"
            className="w-64"
          />
          <Select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="w-52"
            aria-label="Filter by category"
          >
            <option value="">All categories</option>
            {(categories ?? []).map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <Link to="/admin/books/new">
          <Button>Add book</Button>
        </Link>
      </div>

      {loading && <PageLoader />}
      {error && <ErrorMessage message={error} />}
      {!loading && !error && (
        <>
          <Table>
            <thead>
              <Tr className="hover:bg-transparent">
                <Th>Book</Th>
                <Th>Category</Th>
                <Th className="text-right">Price</Th>
                <Th className="text-right">Stock</Th>
                <Th>Rating</Th>
                <Th className="text-right">Actions</Th>
              </Tr>
            </thead>
            <TableBody>
              {books.length === 0 && (
                <Tr className="hover:bg-transparent">
                  <Td colSpan={6} className="py-10 text-center text-muted">
                    No books match your filters.
                  </Td>
                </Tr>
              )}
              {books.map((book) => {
                const catName = typeof book.category === 'string' ? '—' : book.category?.name ?? '—';
                const low = book.stock <= 5;
                return (
                  <Tr key={book._id}>
                    <Td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 shrink-0">
                          <BookCover title={book.title} author={book.author} src={book.coverImage} />
                        </div>
                        <div className="min-w-0">
                          <Link to={`/admin/books/${book._id}`} className="block truncate font-medium text-ink hover:underline">
                            {book.title}
                          </Link>
                          <p className="truncate text-x-small text-muted">{book.author}</p>
                        </div>
                      </div>
                    </Td>
                    <Td className="whitespace-nowrap text-body">{catName}</Td>
                    <Td className="text-right font-medium text-ink">{formatCurrency(book.price)}</Td>
                    <Td className="text-right">
                      <span className={cn('font-medium', low ? 'text-danger' : 'text-ink')}>{book.stock}</span>
                    </Td>
                    <Td className="whitespace-nowrap text-body">
                      {book.ratingCount > 0 ? `${book.ratingAvg.toFixed(1)} (${book.ratingCount})` : '—'}
                    </Td>
                    <Td>
                      <div className="flex justify-end gap-2">
                        <Link to={`/admin/books/${book._id}`}>
                          <Button size="sm" variant="secondary">
                            Edit
                          </Button>
                        </Link>
                        <Button size="sm" variant="danger" onClick={() => setDeleteId(book._id)}>
                          Delete
                        </Button>
                      </div>
                    </Td>
                  </Tr>
                );
              })}
            </TableBody>
          </Table>

          {meta && (
            <div className="flex justify-center">
              <Pagination page={meta.page} totalPages={meta.totalPages} onPage={setPage} />
            </div>
          )}

          <ConfirmDialog
            open={deleteId !== null}
            title="Delete book"
            message="This will permanently remove the book from the store. This action cannot be undone."
            confirmLabel="Delete book"
            destructive
            busy={busyDelete}
            onConfirm={confirmDelete}
            onClose={() => setDeleteId(null)}
          />
        </>
      )}
    </div>
  );
}