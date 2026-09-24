import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="container-shell flex flex-col items-center py-32 text-center">
      <p className="font-serif text-display-lg text-line-strong">404</p>
      <h1 className="editorial-heading mt-2 text-heading-lg">Page not found</h1>
      <p className="mt-3 max-w-sm text-small text-muted">
        The page you're looking for may have been moved, or never existed under this address.
      </p>
      <div className="mt-8 flex gap-3">
        <Link to="/">
          <Button>Back to home</Button>
        </Link>
        <Link to="/books">
          <Button variant="secondary">Browse books</Button>
        </Link>
      </div>
    </div>
  );
}