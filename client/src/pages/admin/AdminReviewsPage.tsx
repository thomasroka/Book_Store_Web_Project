import { useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import { useFetch } from '../../hooks/useFetch';
import { getErrorMessage } from '../../services/api';
import { formatDate } from '../../utils/format';
import { type ReviewStatus } from '../../types';
import { cn } from '../../utils/cn';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { RatingStars } from '../../components/ui/RatingStars';
import { BookCover } from '../../components/BookCover';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageLoader } from '../../components/ui/Spinner';
import { ErrorMessage } from '../../components/ui/ErrorMessage';

const tabs: Array<{ label: string; value: ReviewStatus | 'all' }> = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'All', value: 'all' },
];

function reviewerName(review: { user: { _id: string; name: string } | string }): string {
  return typeof review.user === 'string' ? 'Unknown' : review.user.name;
}

export function AdminReviewsPage() {
  const [tab, setTab] = useState<ReviewStatus | 'all'>('pending');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [pendingMsg, setPendingMsg] = useState<{ id: string; type: 'approve' | 'reject' } | null>(null);

  const { data: reviews, loading, error, refetch } = useFetch(
    () => adminService.listReviews(tab === 'all' ? undefined : tab),
    [tab]
  );

  const decide = async (id: string, action: 'approve' | 'reject') => {
    setPendingMsg({ id, type: action });
    try {
      await adminService.moderateReview(id, action === 'approve' ? 'approved' : 'rejected');
      void refetch();
    } catch (err) {
      window.alert(getErrorMessage(err));
    } finally {
      setPendingMsg(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await adminService.deleteReview(deleting);
      setDeleting(null);
      void refetch();
    } catch (err) {
      window.alert(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1 border-b border-line">
        {tabs.map((tabItem) => (
          <button
            key={tabItem.value}
            onClick={() => setTab(tabItem.value)}
            className={cn(
              '-mb-px border-b-2 px-4 py-2.5 text-small font-medium transition-colors focus-ring',
              tab === tabItem.value
                ? 'border-accent text-accent'
                : 'border-transparent text-muted hover:text-ink'
            )}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      {loading && <PageLoader />}
      {error && <ErrorMessage message={error} />}
      {!loading && !error && reviews && reviews.length === 0 && (
        <EmptyState title="Nothing here" description={`No reviews in the “${tab}” state.`} />
      )}

      {!loading && !error && reviews && reviews.length > 0 && (
        <ul className="space-y-3">
          {reviews.map((review) => {
            const book = typeof review.book === 'string' ? null : review.book;
            return (
              <li key={review._id} className="rounded-md border border-line bg-surface p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <RatingStars value={review.rating} />
                  <StatusBadge status={review.status} />
                  <span className="text-x-small text-muted">{formatDate(review.createdAt)}</span>
                </div>
                {review.comment && <p className="mt-3 text-small leading-relaxed text-body">{review.comment}</p>}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {book && (
                      <div className="w-8">
                        <BookCover title={book.title} author={book.author} src={book.coverImage} />
                      </div>
                    )}
                    <div>
                      {book ? (
                        <Link to={`/admin/books/${book._id}`} className="text-small font-medium text-ink hover:underline">
                          {book.title}
                        </Link>
                      ) : (
                        <p className="text-small text-muted">Book</p>
                      )}
                      <p className="text-x-small text-muted">
                        by {reviewerName(review)} · {typeof review.user !== 'string' ? review.user._id.slice(-6) : '…'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {review.status !== 'approved' && (
                      <Button size="sm" disabled={Boolean(pendingMsg)} onClick={() => void decide(review._id, 'approve')}>
                        Approve
                      </Button>
                    )}
                    {review.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={Boolean(pendingMsg)}
                        onClick={() => void decide(review._id, 'reject')}
                      >
                        Reject
                      </Button>
                    )}
                    <Button size="sm" variant="danger" onClick={() => setDeleting(review._id)}>
                      Delete
                    </Button>
                  </div>
                </div>
                {review.status === 'pending' && !deleting && (
                  <p className="mt-3 text-x-small text-muted">
                    Approving publishes the review on the book page and updates its rating.
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={deleting !== null}
        title="Delete review"
        message="Permanently remove this review? It will also be removed from the book's rating."
        confirmLabel="Delete review"
        destructive
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}