import { useSearchParams } from 'react-router-dom';
import { BookCatalog } from '../../components/BookCatalog';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';

export function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get('q') ?? '';

  return (
    <div className="container-shell py-10">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Search' }]} />
      <BookCatalog initialQuery={q} heading={q ? `Results for “${q}”` : 'Search the store'} />
    </div>
  );
}