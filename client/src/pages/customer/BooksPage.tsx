import { BookCatalog } from '../../components/BookCatalog';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';

export function BooksPage() {
  return (
    <div className="container-shell py-10">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Books' }]} />
      <BookCatalog heading="All books" />
    </div>
  );
}