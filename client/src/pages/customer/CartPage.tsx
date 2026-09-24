import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { getErrorMessage } from '../../services/api';
import { formatCurrency } from '../../utils/format';
import { BookCover } from '../../components/BookCover';
import { Button } from '../../components/ui/Button';
import { QuantityPicker } from '../../components/ui/QuantityPicker';
import { EmptyState } from '../../components/ui/EmptyState';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';

export function CartPage() {
  const { items, total, count, loading, updateQuantity, remove } = useCart();

  if (loading) {
    return <div className="container-shell py-10" />;
  }

  return (
    <div className="container-shell py-10">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Cart' }]} />
      <h1 className="editorial-heading mt-3 text-display">Your cart</h1>

      {items.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="Your cart is empty"
            description="When you add a book, it will appear here, ready to check out."
            action={
              <Link to="/books">
                <Button>Browse books</Button>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
          <ul className="divide-y divide-line">
            {items.map((item) => (
              <li key={item._id} className="flex gap-5 py-6">
                <div className="w-24 shrink-0 sm:w-28">
                  <Link to={`/books/${item.book._id}`}>
                    <BookCover title={item.book.title} author={item.book.author} src={item.book.coverImage} />
                  </Link>
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link
                        to={`/books/${item.book._id}`}
                        className="font-serif text-title font-medium leading-snug text-ink hover:underline"
                      >
                        {item.book.title}
                      </Link>
                      <p className="mt-0.5 text-small text-muted">{item.book.author}</p>
                    </div>
                    <button
                      onClick={() => void remove(item._id).catch((err) => window.alert(getErrorMessage(err)))}
                      className="shrink-0 rounded-xs p-1 text-muted hover:text-danger focus-ring"
                      aria-label={`Remove ${item.book.title} from cart`}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                  <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-4">
                    <QuantityPicker
                      value={item.quantity}
                      max={item.book.stock === 0 ? item.quantity : Math.max(item.book.stock, item.quantity)}
                      onChange={(q) =>
                        void updateQuantity(item._id, q).catch((err) => window.alert(getErrorMessage(err)))
                      }
                    />
                    <p className="font-medium text-ink">{formatCurrency(item.book.price * item.quantity)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit lg:sticky lg:top-24">
            <div className="rounded-md border border-line bg-surface p-6">
              <h2 className="font-serif text-heading text-ink">Order summary</h2>
              <dl className="mt-4 space-y-2 text-small">
                <div className="flex justify-between text-muted">
                  <dt>Subtotal ({count} {count === 1 ? 'book' : 'books'})</dt>
                  <dd className="text-ink">{formatCurrency(total)}</dd>
                </div>
                <div className="flex justify-between text-muted">
                  <dt>Shipping</dt>
                  <dd className="text-ink">Calculated at checkout</dd>
                </div>
                <div className="flex justify-between border-t border-line pt-3 text-title font-medium text-ink">
                  <dt>Total</dt>
                  <dd>{formatCurrency(total)}</dd>
                </div>
              </dl>
              <Link to="/checkout" className="mt-6 block">
                <Button fullWidth size="lg">
                  Proceed to checkout
                </Button>
              </Link>
              <p className="mt-3 text-center text-x-small text-muted">
                This is a demo store. Checkout places a simulated order with no payment.
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}