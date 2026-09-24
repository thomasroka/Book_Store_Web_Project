import { Link, useNavigate } from 'react-router-dom';
import type { Book } from '../types';
import { formatCurrency } from '../utils/format';
import { BookCover } from './BookCover';
import { RatingStars } from './ui/RatingStars';
import { Button } from './ui/Button';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';
import { cn } from '../utils/cn';

interface BookCardProps {
  book: Book;
}

function Availability({ stock }: { stock: number }) {
  if (stock === 0) return <span className="text-x-small text-danger">Out of stock</span>;
  if (stock <= 5) return <span className="text-x-small text-warning">Low stock — {stock} left</span>;
  return (
    <span className="inline-flex items-center gap-1 text-x-small text-success">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" />
      In stock
    </span>
  );
}

function CategoryName({ book }: { book: Book }) {
  if (typeof book.category === 'string') return null;
  return (
    <Link
      to={`/books?category=${book.category._id}`}
      className="text-x-small font-medium uppercase tracking-wide text-muted hover:text-accent"
    >
      {book.category.name}
    </Link>
  );
}

export function BookCard({ book }: BookCardProps) {
  const { user } = useAuth();
  const { add } = useCart();
  const navigate = useNavigate();
  const outOfStock = book.stock === 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await add(book._id, 1);
    } catch (err) {
      window.alert(getErrorMessage(err));
    }
  };

  const availability = <Availability stock={book.stock} />;

  return (
    <article className="group flex flex-col">
      <Link to={`/books/${book._id}`} className="block focus-ring">
        <BookCover
          title={book.title}
          author={book.author}
          src={book.coverImage}
          className="transition-transform duration-200 group-hover:shadow-lifted"
        />
      </Link>

      <div className="mt-3 flex flex-1 flex-col gap-1">
        <CategoryName book={book} />
        <h3 className="font-serif text-title font-medium leading-snug text-ink">
          <Link to={`/books/${book._id}`} className="hover:underline">
            {book.title}
          </Link>
        </h3>
        <p className="text-x-small text-muted">{book.author}</p>

        <div className="mt-1">
          <RatingStars value={book.ratingAvg} count={book.ratingCount} />
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div>
            <p className="font-medium text-ink">{formatCurrency(book.price)}</p>
            {availability}
          </div>
        </div>

        <div className="mt-3">
          <Button
            size="sm"
            variant="secondary"
            fullWidth
            disabled={outOfStock}
            onClick={handleAddToCart}
            className={cn(outOfStock && 'opacity-50')}
          >
            {outOfStock ? 'Out of stock' : 'Add to cart'}
          </Button>
        </div>
      </div>
    </article>
  );
}