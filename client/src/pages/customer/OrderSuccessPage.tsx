import { Link, useParams } from 'react-router-dom';
import { orderService } from '../../services/order.service';
import { useFetch } from '../../hooks/useFetch';
import { formatCurrency } from '../../utils/format';
import { Button } from '../../components/ui/Button';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { PageLoader } from '../../components/ui/Spinner';
import { ErrorMessage } from '../../components/ui/ErrorMessage';

export function OrderSuccessPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, loading, error } = useFetch(() => orderService.detail(id!), [id]);

  if (loading) return <PageLoader />;
  if (error || !order) {
    return (
      <div className="container-shell py-24 text-center">
        <ErrorMessage message={error ?? 'Order not found.'} />
      </div>
    );
  }

  return (
    <div className="container-shell py-16">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Order placed' }]} />
      <div className="mx-auto mt-8 max-w-xl text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-soft text-success">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 12.5l5 5L20 6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <h1 className="editorial-heading mt-6 text-display">Thank you for your order</h1>
        <p className="mt-3 text-small text-muted">
          Order <span className="font-medium text-ink">{order.orderNumber}</span> has been placed and is
          now <span className="font-medium text-ink">pending</span> confirmation.
        </p>
        <div className="mx-auto mt-8 max-w-sm rounded-md border border-line bg-surface p-6">
          <dl className="space-y-2 text-small">
            <div className="flex justify-between text-muted">
              <dt>Items</dt>
              <dd className="text-ink">{order.items.reduce((n, i) => n + i.quantity, 0)}</dd>
            </div>
            <div className="flex justify-between text-muted">
              <dt>Total</dt>
              <dd className="text-ink">{formatCurrency(order.total)}</dd>
            </div>
            <div className="flex justify-between text-muted">
              <dt>Ship to</dt>
              <dd className="max-w-[60%] text-right text-ink">
                {order.shippingInfo.name}, {order.shippingInfo.city}
              </dd>
            </div>
          </dl>
        </div>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to={`/orders/${order._id}`}>
            <Button>View order</Button>
          </Link>
          <Link to="/orders">
            <Button variant="secondary">My orders</Button>
          </Link>
          <Link to="/books">
            <Button variant="ghost">Keep browsing</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}