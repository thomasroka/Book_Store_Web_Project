import type { Review } from '../types';
import { RatingStars } from './ui/RatingStars';
import { formatDate } from '../utils/format';

function reviewerName(review: Review): string {
  if (typeof review.user === 'string') return 'Reader';
  return review.user.name;
}

export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <p className="py-6 text-small text-muted">No published reviews yet. Be the first to write one.</p>
    );
  }

  return (
    <ul className="divide-y divide-line">
      {reviews.map((review) => (
        <li key={review._id} className="py-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft font-serif text-small font-medium text-accent">
                {reviewerName(review).charAt(0).toUpperCase()}
              </span>
              <div>
                <p className="text-small font-medium text-ink">{reviewerName(review)}</p>
                <p className="text-x-small text-muted">{formatDate(review.createdAt)}</p>
              </div>
            </div>
            <RatingStars value={review.rating} />
          </div>
          {review.comment && <p className="mt-3 text-small leading-relaxed text-body">{review.comment}</p>}
        </li>
      ))}
    </ul>
  );
}