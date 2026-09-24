import { useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { bookService } from '../../services/book.service';
import { useFetch } from '../../hooks/useFetch';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { getErrorMessage } from '../../services/api';
import { formatCurrency } from '../../utils/format';
import { cn } from '../../utils/cn';
import { BookCover } from '../../components/BookCover';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { RatingStars } from '../../components/ui/RatingStars';
import { Button } from '../../components/ui/Button';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { PageLoader } from '../../components/ui/Spinner';
import { ReviewForm } from '../../components/ReviewForm';
import { ReviewList } from '../../components/ReviewList';

function Availability({ stock }: { stock: number }) {
  if (stock === 0) return <span className="text-small text-danger">Out of stock</span>;
  if (stock <= 5) return <span className="text-small text-warning">Low stock — only {stock} left</span>;
  return (
    <span className="inline-flex items-center gap-1.5 text-small text-success">
      <span className="inline-block h-2 w-2 rounded-full bg-success" />
      In stock — ships in 1–2 days
    </span>
  );
}

export function BookDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const { data, loading, error, refetch } = useFetch(
    () => bookService.detail(id!),
    [id]
  );

  const book = data?.book;
  const reviews = useMemo(() => data?.reviews ?? [], [data]);

  if (loading) return <PageLoader />;
  if (error) return <div className="container-shell py-10"><ErrorMessage message={error} /></div>;
  if (!book) return null;

  const category = typeof book.category !== 'string' ? book.category : null;
  const inWishlist = id ? has(id) : false;
  const outOfStock = book.stock === 0;

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    try {
      await add(book._id, 1);
      navigate('/cart');
    } catch (err) {
      window.alert(getErrorMessage(err));
    }
  };

  const handleWishlist = async () => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    try {
      await toggle(book._id);
    } catch (err) {
      window.alert(getErrorMessage(err));
    }
  };

  return (
    <div className="container-shell py-10">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Books', to: '/books' },
          ...(category ? [{ label: category.name, to: `/books?category=${category._id}` }] : []),
          { label: book.title },
        ]}
      />

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,320px)_1fr]">
        <div className="mx-auto w-full max-w-[300px] lg:mx-0">
          <BookCover title={book.title} author={book.author} src={book.coverImage} />
        </div>

        <div>
          {category && (
            <p className="text-x-small font-semibold uppercase tracking-widest text-muted">
              {category.name}
            </p>
          )}
          <h1 className="editorial-heading mt-2 text-display">{book.title}</h1>
          <p className="mt-1.5 text-title text-muted">by {book.author}</p>

          <div className="mt-3 flex items-center gap-3">
            <RatingStars value={book.ratingAvg} count={book.ratingCount} size="md" />
          </div>

          <div className="mt-6 flex items-baseline gap-4">
            <p className="font-serif text-heading-lg text-ink">{formatCurrency(book.price)}</p>
            <Availability stock={book.stock} />
          </div>

          {book.isbn && <p className="mt-2 text-x-small text-muted">ISBN {book.isbn}</p>}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button size="lg" disabled={outOfStock} onClick={handleAddToCart}>
              {outOfStock ? 'Out of stock' : 'Add to cart'}
            </Button>
            <button
              onClick={handleWishlist}
              aria-pressed={inWishlist}
              aria-label="Toggle wishlist"
              className={cn(
                'inline-flex items-center gap-2 rounded-xs border px-4 py-2.5 text-small font-medium transition-colors focus-ring',
                inWishlist
                  ? 'border-accent bg-accent-soft text-accent'
                  : 'border-line-strong text-body hover:border-accent hover:text-accent'
              )}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={inWishlist ? 'currentColor' : 'none'}>
                <path
                  d="M12 20.5s-7.5-4.4-9.3-9C1.2 8 3 4.8 6.4 4.8c2 0 3.7 1.2 4.6 3 .9-1.8 2.6-3 4.6-3 3.4 0 5.2 3.2 3.7 6.7-1.8 4.6-9.3 9-9.3 9z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
              {inWishlist ? 'In wishlist' : 'Add to wishlist'}
            </button>
          </div>

          <div className="mt-10 max-w-2xl">
            <h2 className="text-x-small font-semibold uppercase tracking-widest text-muted">
              About this book
            </h2>
            <p className="mt-3 text-small leading-relaxed text-body">
              {book.description || 'No description provided.'}
            </p>
          </div>
        </div>
      </div>

      <section className="mt-16 grid gap-10 lg:grid-cols-[1fr_minmax(0,420px)]">
        <div>
          <h2 className="section-title">Reviews</h2>
          <div className="mt-4">
            <ReviewList reviews={reviews} />
          </div>
        </div>
        <div>
          <ReviewForm bookId={book._id} onSubmitted={() => void refetch()} />
        </div>
      </section>
    </div>
  );
}