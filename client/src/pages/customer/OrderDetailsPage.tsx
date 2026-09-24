import { Link, useParams } from 'react-router-dom';
import { orderService } from '../../services/order.service';
import { useFetch } from '../../hooks/useFetch';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { type OrderStatus } from '../../types';
import { cn } from '../../utils/cn';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { BookCover } from '../../components/BookCover';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { PageLoader } from '../../components/ui/Spinner';
import { ErrorMessage } from '../../components/ui/ErrorMessage';

const steps: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered'];

function ProgressSteps({ status }: { status: OrderStatus }) {
  if (status === 'cancelled') {
    return <p className="text-small text-danger">This order was cancelled.</p>;
  }
  const currentIndex = steps.indexOf(status);

  return (
    <ol className="flex items-center gap-0">
      {steps.map((step, index) => {
        const done = index <= currentIndex;
        const isLast = index === steps.length - 1;
        return (
          <li key={step} className="flex flex-1 items-center gap-2 last:flex-none">
            <span
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-x-small font-medium',
                done ? 'bg-accent text-paper' : 'bg-neutral-200 text-neutral-500'
              )}
            >
              {done ? index + 1 : ''}
            </span>
            <span className={cn('text-small capitalize', done ? 'text-ink' : 'text-muted')}>{step}</span>
            {!isLast && (
              <span className={cn('mx-1 h-px flex-1', done && index < currentIndex ? 'bg-accent' : 'bg-line-strong')} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, loading, error } = useFetch(() => orderService.detail(id!), [id]);

  if (loading) return <PageLoader />;
  if (error || !order) {
    return (
      <div className="container-shell py-10">
        <ErrorMessage message={error ?? 'Order not found.'} />
      </div>
    );
  }

  const status = order.status as OrderStatus;

  return (
    <div className="container-shell py-10">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'My Orders', to: '/orders' },
          { label: order.orderNumber },
        ]}
      />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-x-small text-muted">{formatDateTime(order.createdAt)}</p>
          <h1 className="editorial-heading mt-1 text-heading-lg">{order.orderNumber}</h1>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="mt-6 rounded-md border border-line bg-surface p-5">
        <ProgressSteps status={status} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <section>
          <h2 className="text-x-small font-semibold uppercase tracking-widest text-muted">Items</h2>
          <ul className="mt-3 divide-y divide-line rounded-md border border-line bg-surface">
            {order.items.map((item) => (
              <li key={item.book} className="flex items-center gap-4 px-5 py-4">
                <div className="w-12 shrink-0 sm:w-14">
                  <Link to={`/books/${item.book}`}>
                    <BookCover title={item.title} author={item.author} src={item.coverImage} />
                  </Link>
                </div>
                <div className="min-w-0 flex-1">
                  <Link to={`/books/${item.book}`} className="font-serif text-title font-medium text-ink hover:underline">
                    {item.title}
                  </Link>
                  <p className="text-x-small text-muted">{item.author}</p>
                </div>
                <p className="text-small text-muted">
                  {item.quantity} × {formatCurrency(item.price)}
                </p>
                <p className="font-medium text-ink">{formatCurrency(item.price * item.quantity)}</p>
              </li>
            ))}
          </ul>
        </section>

        <aside className="h-fit space-y-5 lg:sticky lg:top-24">
          <div className="rounded-md border border-line bg-surface p-6">
            <h2 className="font-serif text-heading text-ink">Shipping to</h2>
            <dl className="mt-3 space-y-1.5 text-small">
              <div>
                <dt className="text-muted">Name</dt>
                <dd className="text-ink">{order.shippingInfo.name}</dd>
              </div>
              <div>
                <dt className="text-muted">Address</dt>
                <dd className="text-ink">{order.shippingInfo.address}</dd>
              </div>
              <div>
                <dt className="text-muted">City</dt>
                <dd className="text-ink">{order.shippingInfo.city}</dd>
              </div>
              <div>
                <dt className="text-muted">Postal code</dt>
                <dd className="text-ink">{order.shippingInfo.postalCode}</dd>
              </div>
              {order.shippingInfo.phone && (
                <div>
                  <dt className="text-muted">Phone</dt>
                  <dd className="text-ink">{order.shippingInfo.phone}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="rounded-md border border-line bg-surface p-6">
            <h2 className="font-serif text-heading text-ink">Summary</h2>
            <dl className="mt-3 space-y-2 text-small">
              <div className="flex justify-between text-muted">
                <dt>Subtotal</dt>
                <dd className="text-ink">{formatCurrency(order.total)}</dd>
              </div>
              <div className="flex justify-between text-muted">
                <dt>Shipping</dt>
                <dd className="text-ink">Free</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-3 text-title font-medium text-ink">
                <dt>Total</dt>
                <dd>{formatCurrency(order.total)}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}