import { useState } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../services/order.service';
import { useFetch } from '../../hooks/useFetch';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { type OrderStatus } from '../../types';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Pagination } from '../../components/ui/Pagination';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { PageLoader } from '../../components/ui/Spinner';
import { ErrorMessage } from '../../components/ui/ErrorMessage';

export function MyOrdersPage() {
  const [page, setPage] = useState(1);
  const { data, loading, error } = useFetch(() => orderService.mine(page, 10), [page]);

  const orders = data?.orders ?? [];
  const meta = data?.meta;

  return (
    <div className="container-shell py-10">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'My Orders' }]} />
      <h1 className="editorial-heading mt-3 text-display">My orders</h1>

      {loading && <div className="mt-8"><PageLoader /></div>}
      {error && <div className="mt-8"><ErrorMessage message={error} /></div>}
      {!loading && !error && orders.length === 0 && (
        <div className="mt-8">
          <EmptyState
            title="No orders yet"
            description="Orders you place will be listed here with their current status."
            action={
              <Link to="/books">
                <Button>Browse books</Button>
              </Link>
            }
          />
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <>
          <ul className="mt-8 divide-y divide-line rounded-md border border-line bg-surface">
            {orders.map((order) => {
              const status = order.status as OrderStatus;
              const itemsCount = order.items.reduce((n, i) => n + i.quantity, 0);
              return (
                <li key={order._id}>
                  <Link
                    to={`/orders/${order._id}`}
                    className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4 transition-colors hover:bg-neutral-50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-ink">{order.orderNumber}</p>
                      <p className="text-x-small text-muted">{formatDateTime(order.createdAt)}</p>
                    </div>
                    <p className="text-small text-muted">
                      {itemsCount} {itemsCount === 1 ? 'book' : 'books'}
                    </p>
                    <p className="text-small font-medium text-ink">{formatCurrency(order.total)}</p>
                    <StatusBadge status={status} />
                  </Link>
                </li>
              );
            })}
          </ul>
          {meta && (
            <div className="mt-8 flex justify-center">
              <Pagination page={meta.page} totalPages={meta.totalPages} onPage={setPage} />
            </div>
          )}
        </>
      )}
    </div>
  );
}