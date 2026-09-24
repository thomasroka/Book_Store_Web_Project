import { Link } from 'react-router-dom';
import { reviewService } from '../../services/review.service';
import { useFetch } from '../../hooks/useFetch';
import { formatDate } from '../../utils/format';
import { type ReviewStatus } from '../../types';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { RatingStars } from '../../components/ui/RatingStars';
import { BookCover } from '../../components/BookCover';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { PageLoader } from '../../components/ui/Spinner';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';

export function MyReviewsPage() {
  const { data, loading, error } = useFetch(() => reviewService.mine(), []);

  return (
    <div className="container-shell py-10">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'My Reviews' }]} />
      <h1 className="editorial-heading mt-3 text-display">My reviews</h1>

      {loading && <div className="mt-8"><PageLoader /></div>}
      {error && <div className="mt-8"><ErrorMessage message={error} /></div>}
      {!loading && !error && data && data.length === 0 && (
        <div className="mt-8">
          <EmptyState
            title="You haven't reviewed anything yet"
            description="Share your thoughts on a book you've read from its detail page."
            action={
              <Link to="/books">
                <Button>Browse books</Button>
              </Link>
            }
          />
        </div>
      )}

      {!loading && !error && data && data.length > 0 && (
        <ul className="mt-8 divide-y divide-line rounded-md border border-line bg-surface">
          {data.map((review) => {
            const book = typeof review.book === 'string' ? null : review.book;
            return (
              <li key={review._id} className="flex gap-4 px-5 py-4">
                {book && (
                  <div className="w-14 shrink-0">
                    <Link to={`/books/${book._id}`}>
                      <BookCover title={book.title} author={book.author} src={book.coverImage} />
                    </Link>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  {book ? (
                    <Link to={`/books/${book._id}`} className="font-serif text-title font-medium text-ink hover:underline">
                      {book.title}
                    </Link>
                  ) : (
                    <p className="font-serif text-title font-medium text-ink">Book</p>
                  )}
                  <div className="mt-1 flex items-center gap-3">
                    <RatingStars value={review.rating} />
                    <StatusBadge status={review.status as ReviewStatus} />
                    <span className="text-x-small text-muted">{formatDate(review.createdAt)}</span>
                  </div>
                  {review.comment && <p className="mt-2 text-small text-body">{review.comment}</p>}
                  {review.status === 'pending' && (
                    <p className="mt-2 text-x-small text-warning">
                      Awaiting moderation before it appears on the book page.
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}