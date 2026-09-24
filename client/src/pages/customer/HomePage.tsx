import { Link } from 'react-router-dom';
import { bookService } from '../../services/book.service';
import { categoryService } from '../../services/category.service';
import { useFetch } from '../../hooks/useFetch';
import { BookGrid } from '../../components/BookGrid';
import { PageLoader } from '../../components/ui/Spinner';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { Button } from '../../components/ui/Button';

export function HomePage() {
  const featured = useFetch(() => bookService.featured(), []);
  const arrivals = useFetch(() => bookService.newArrivals(), []);
  const categories = useFetch(() => categoryService.list(), []);

  return (
    <div>
      <section className="border-b border-line bg-surface">
        <div className="container-shell flex flex-col items-start gap-6 py-16 md:flex-row md:items-end md:justify-between md:py-24">
          <div className="max-w-2xl">
            <p className="text-x-small font-semibold uppercase tracking-widest text-accent">
              An independent online bookstore
            </p>
            <h1 className="mt-3 font-serif text-display-lg font-medium tracking-tightest text-ink">
              Books worth
              <br />
              taking your time with.
            </h1>
            <p className="mt-4 max-w-xl text-small text-body">
              A carefully curated shelf of classic fiction, science, philosophy, and above — chosen for
              readers who care about the page as much as the story.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link to="/books">
                <Button size="lg">Browse all books</Button>
              </Link>
              <Link
                to="/books?sort=rating"
                className="rounded-xs px-2 py-2 text-small font-medium text-accent hover:text-accent-dark"
              >
                Highest rated →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell mt-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-x-small font-semibold uppercase tracking-widest text-muted">Reader favorites</p>
            <h2 className="section-title mt-1.5">Featured titles</h2>
          </div>
          <Link to="/books" className="text-small font-medium text-accent hover:text-accent-dark">
            View all →
          </Link>
        </div>
        <div className="mt-8">
          {featured.loading && <PageLoader />}
          {featured.error && <ErrorMessage message={featured.error} />}
          {featured.data && <BookGrid books={featured.data} />}
        </div>
      </section>

      <section className="container-shell mt-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-x-small font-semibold uppercase tracking-widest text-muted">Just added</p>
            <h2 className="section-title mt-1.5">New arrivals</h2>
          </div>
          <Link to="/books?sort=newest" className="text-small font-medium text-accent hover:text-accent-dark">
            View all →
          </Link>
        </div>
        <div className="mt-8">
          {arrivals.loading && <PageLoader />}
          {arrivals.error && <ErrorMessage message={arrivals.error} />}
          {arrivals.data && <BookGrid books={arrivals.data} />}
        </div>
      </section>

      <section className="container-shell mt-20">
        <div className="rounded-md border border-line bg-surface px-8 py-10">
          <p className="text-x-small font-semibold uppercase tracking-widest text-muted">Browse by subject</p>
          <h2 className="section-title mt-1.5">Explore the shelves</h2>
          <div className="mt-6 flex flex-wrap gap-2.5">
            {(categories.data ?? []).map((cat) => (
              <Link
                key={cat._id}
                to={`/books?category=${cat._id}`}
                className="rounded-sm border border-line-strong px-4 py-2 text-small font-medium text-body transition-colors hover:border-accent hover:text-accent"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}