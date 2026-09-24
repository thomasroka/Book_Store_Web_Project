import { useState } from 'react';
import { adminService } from '../../services/admin.service';
import { useFetch } from '../../hooks/useFetch';
import { getErrorMessage } from '../../services/api';
import { cn } from '../../utils/cn';
import { Input } from '../../components/ui/Input';
import { Pagination } from '../../components/ui/Pagination';
import { PageLoader } from '../../components/ui/Spinner';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { Table, TableBody, Td, Th, Tr } from '../../components/ui/Table';

export function InventoryPage() {
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  const { data, loading, error, refetch } = useFetch(
    () => adminService.listBooks({ search: search || undefined, lowStock: lowStockOnly, page, limit: 20 }),
    [search, lowStockOnly, page]
  );

  const books = data?.items ?? [];
  const meta = data?.meta;

  const startEdit = (id: string, current: number) => {
    setEditingId(id);
    setEditValue(String(current));
  };

  const saveStock = async (id: string) => {
    const value = Number(editValue);
    if (Number.isNaN(value) || !Number.isInteger(value) || value < 0) {
      window.alert('Stock must be a whole number of zero or more.');
      return;
    }
    if (value === books.find((b) => b._id === id)?.stock) {
      setEditingId(null);
      return;
    }
    setSavingId(id);
    try {
      await adminService.updateStock(id, value);
      setEditingId(null);
      void refetch();
    } catch (err) {
      window.alert(getErrorMessage(err));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search inventory…"
            aria-label="Search inventory"
            className="w-64"
          />
          <label className="inline-flex cursor-pointer items-center gap-2 text-small text-body">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => {
                setLowStockOnly(e.target.checked);
                setPage(1);
              }}
              className="h-4 w-4 rounded-xs accent-[#2E4A3A]"
            />
            Low stock only (≤ 5)
          </label>
        </div>
        <p className="text-x-small text-muted">Click a stock value to edit it inline.</p>
      </div>

      {loading && <PageLoader />}
      {error && <ErrorMessage message={error} />}
      {!loading && !error && (
        <>
          <Table>
            <thead>
              <Tr className="hover:bg-transparent">
                <Th>Book</Th>
                <Th>Author</Th>
                <Th className="text-right">Stock</Th>
                <Th className="text-right">Status</Th>
              </Tr>
            </thead>
            <TableBody>
              {books.length === 0 && (
                <Tr className="hover:bg-transparent">
                  <Td colSpan={4} className="py-10 text-center text-muted">
                    No books match the current filter.
                  </Td>
                </Tr>
              )}
              {books.map((book) => {
                const low = book.stock <= 5;
                const out = book.stock === 0;
                return (
                  <Tr key={book._id}>
                    <Td className="font-medium text-ink">{book.title}</Td>
                    <Td className="text-body">{book.author}</Td>
                    <Td className="text-right">
                      {editingId === book._id ? (
                        <div className="inline-flex items-center gap-2">
                          <Input
                            autoFocus
                            className="w-24 text-right"
                            type="number"
                            min={0}
                            step={1}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') void saveStock(book._id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                          />
                          <button
                            onClick={() => void saveStock(book._id)}
                            disabled={savingId === book._id}
                            className="rounded-xs bg-accent px-2 py-1 text-x-small font-medium text-paper hover:bg-accent-dark"
                          >
                            {savingId === book._id ? '…' : 'Save'}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(book._id, book.stock)}
                          className={cn(
                            'rounded-xs px-2 py-1 font-medium tabular-nums focus-ring',
                            out ? 'text-danger' : low ? 'text-warning' : 'text-ink',
                            'hover:bg-neutral-100'
                          )}
                          title="Edit stock"
                        >
                          {book.stock}
                        </button>
                      )}
                    </Td>
                    <Td className="text-right">
                      <span
                        className={cn(
                          'inline-block rounded-xs px-2 py-0.5 text-x-small font-medium',
                          out
                            ? 'bg-danger-soft text-danger'
                            : low
                              ? 'bg-warning-soft text-warning'
                              : 'bg-success-soft text-success'
                        )}
                      >
                        {out ? 'Out of stock' : low ? 'Low stock' : 'In stock'}
                      </span>
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
        </>
      )}
    </div>
  );
}