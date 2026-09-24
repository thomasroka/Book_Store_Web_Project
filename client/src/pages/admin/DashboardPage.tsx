import { Link } from 'react-router-dom';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { adminService } from '../../services/admin.service';
import { useFetch } from '../../hooks/useFetch';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { type OrderStatus } from '../../types';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PageLoader } from '../../components/ui/Spinner';
import { ErrorMessage } from '../../components/ui/ErrorMessage';

export function DashboardPage() {
  const { data, loading, error } = useFetch(() => adminService.stats(), []);

  if (loading) return <PageLoader />;
  if (error || !data) return <ErrorMessage message={error ?? 'Could not load dashboard.'} />;

  const statItems = [
    { label: 'Revenue', value: formatCurrency(data.revenue) },
    { label: 'Orders', value: String(data.orders) },
    { label: 'Books', value: String(data.books) },
    { label: 'Customers', value: String(data.customers) },
    { label: 'Low stock', value: String(data.lowStock) },
    { label: 'Pending reviews', value: String(data.pendingReviews) },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line md:grid-cols-3 xl:grid-cols-6">
        {statItems.map((item) => (
          <div key={item.label} className="bg-surface px-5 py-6">
            <p className="text-x-small uppercase tracking-wide text-muted">{item.label}</p>
            <p className="mt-2 font-serif text-heading-lg text-ink">{item.value}</p>
          </div>
        ))}
      </div>

      {data.pendingReviews > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xs border border-warning bg-warning-soft px-4 py-3">
          <p className="text-small text-warning">
            {data.pendingReviews} review{data.pendingReviews > 1 ? 's' : ''} awaiting moderation.
          </p>
          <Link to="/admin/reviews" className="text-small font-medium text-warning underline">
            Moderate reviews →
          </Link>
        </div>
      )}

      <div className="grid gap-8 xl:grid-cols-[1.6fr_1fr]">
        <section>
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-heading text-ink">Revenue, last 6 months</h2>
            <span className="text-x-small text-muted">Simulated demo orders</span>
          </div>
          <div className="mt-4 h-72 rounded-md border border-line bg-surface p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthly} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="#EFEDE8" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B6559' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6B6559' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `$${v}`}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
                  contentStyle={{ borderRadius: 4, fontSize: 12, border: '1px solid #E3DDD3' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#2E4A3A" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section>
          <h2 className="font-serif text-heading text-ink">Top selling books</h2>
          <ul className="mt-4 divide-y divide-line rounded-md border border-line bg-surface">
            {data.topBooks.length === 0 && (
              <li className="px-5 py-6 text-small text-muted">No orders yet — sales appear here.</li>
            )}
            {data.topBooks.map((book, index) => (
              <li key={book._id} className="flex items-center gap-4 px-5 py-4">
                <span className="w-5 text-title font-medium text-neutral-400">{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <Link to={`/admin/books/${book._id}`} className="block truncate text-small font-medium text-ink hover:underline">
                    {book.title}
                  </Link>
                  <p className="text-x-small text-muted">{book.quantity} sold</p>
                </div>
                <span className="text-small font-medium text-ink">{formatCurrency(book.revenue)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-heading text-ink">Recent orders</h2>
          <Link to="/admin/orders" className="text-small font-medium text-accent hover:text-accent-dark">
            View all →
          </Link>
        </div>
        <ul className="mt-4 divide-y divide-line rounded-md border border-line bg-surface">
          {data.recentOrders.length === 0 && (
            <li className="px-5 py-6 text-small text-muted">No orders yet.</li>
          )}
          {data.recentOrders.map((order) => {
            const user = typeof order.user === 'string' ? null : order.user;
            return (
              <li key={String(order._id)} className="flex flex-wrap items-center gap-4 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <Link to={`/admin/orders`} className="block truncate text-small font-medium text-ink">
                    {String(order.orderNumber)}
                  </Link>
                  <p className="text-x-small text-muted">
                    {user?.name ?? 'Unknown'} · {formatDateTime(String(order.createdAt))}
                  </p>
                </div>
                <span className="text-small font-medium text-ink">{formatCurrency(Number(order.total))}</span>
                <StatusBadge status={String(order.status) as OrderStatus} />
              </li>
            );
          })}
        </ul>
      </section>

      <div>
        <Link to="/admin/books/new">
          <Button>Add a book</Button>
        </Link>
      </div>
    </div>
  );
}