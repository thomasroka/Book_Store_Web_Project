import { useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { reviewService } from '../services/review.service';
import { getErrorMessage } from '../services/api';
import { cn } from '../utils/cn';
import { Button } from './ui/Button';
import { Textarea } from './ui/Textarea';
import { ErrorMessage } from './ui/ErrorMessage';

interface ReviewFormProps {
  bookId: string;
  onSubmitted: () => void;
}

export function ReviewForm({ bookId, onSubmitted }: ReviewFormProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!user) return null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (rating < 1) {
      setError('Please choose a rating.');
      return;
    }
    setBusy(true);
    try {
      await reviewService.create(bookId, { rating, comment });
      setRating(0);
      setComment('');
      onSubmitted();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-6 space-y-4 rounded-md border border-line bg-surface p-5" noValidate>
      <p className="text-small font-medium text-ink">Write a review</p>
      {error && <ErrorMessage message={error} />}

      <div>
        <p className="text-x-small font-semibold uppercase tracking-wide text-muted">Your rating</p>
        <div className="mt-1.5 flex items-center gap-0.5" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={`${star} star${star > 1 ? 's' : ''}`}
              className="p-0.5 focus-ring"
            >
              <svg width="22" height="22" viewBox="0 0 24 24">
                <path
                  fill={star <= (hoverRating || rating) ? '#9A6B1D' : 'none'}
                  stroke={star <= (hoverRating || rating) ? '#9A6B1D' : '#9B958A'}
                  strokeWidth="1.2"
                  d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.3l-5.8 3.1 1.1-6.5L2.6 9.3l6.5-.9z"
                />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-x-small font-semibold uppercase tracking-wide text-muted">Your thoughts</p>
        <Textarea
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={1000}
          placeholder="What did you think of the writing, pacing, or story?"
          className="mt-1.5"
        />
      </div>

      <Button type="submit" disabled={busy} className={cn(busy && 'opacity-60')}>
        {busy ? 'Submitting…' : 'Submit review'}
      </Button>
      <p className="text-x-small text-muted">Reviews are held for moderation before they appear publicly.</p>
    </form>
  );
}