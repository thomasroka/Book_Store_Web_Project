import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { getErrorMessage } from '../../services/api';
import { formatCurrency } from '../../utils/format';
import { BookCover } from '../../components/BookCover';
import { RatingStars } from '../../components/ui/RatingStars';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';

export function WishlistPage() {
  const { items, loading, toggle } = useWishlist();
  const { add } = useCart();

  if (loading) return <div className="container-shell py-10" />;

  return (
    <div className="container-shell py-10">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Wishlist' }]} />
      <h1 className="editorial-heading mt-3 text-display">Your wishlist</h1>

      {items.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="Nothing saved yet"
            description="Books you save with the heart icon will appear here."
            action={
              <Link to="/books">
                <Button>Discover books</Button>
              </Link>
            }
          />
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-line">
          {items.map(({ book, _id }) => (
            <li key={_id} className="flex gap-5 py-6">
              <div className="w-24 shrink-0 sm:w-28">
                <Link to={`/books/${book._id}`}>
                  <BookCover title={book.title} author={book.author} src={book.coverImage} />
                </Link>
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link
                      to={`/books/${book._id}`}
                      className="font-serif text-title font-medium leading-snug text-ink hover:underline"
                    >
                      {book.title}
                    </Link>
                    <p className="mt-0.5 text-small text-muted">{book.author}</p>
                    <div className="mt-1.5">
                      <RatingStars value={book.ratingAvg} count={book.ratingCount} />
                    </div>
                  </div>
                  <button
                    onClick={() => void toggle(book._id).catch((err) => window.alert(getErrorMessage(err)))}
                    className="shrink-0 rounded-xs p-1 text-muted hover:text-danger focus-ring"
                    aria-label={`Remove ${book.title} from wishlist`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-4">
                  <p className="font-medium text-ink">{formatCurrency(book.price)}</p>
                  <Button
                    size="sm"
                    disabled={book.stock === 0}
                    onClick={() => void add(book._id, 1).catch((err) => window.alert(getErrorMessage(err)))}
                  >
                    {book.stock === 0 ? 'Out of stock' : 'Add to cart'}
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}