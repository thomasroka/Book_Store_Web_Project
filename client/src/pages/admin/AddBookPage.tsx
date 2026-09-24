import { useNavigate } from 'react-router-dom';
import { BookForm, emptyBookForm } from '../../components/BookForm';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { PageLoader } from '../../components/ui/Spinner';
import { adminService } from '../../services/admin.service';
import { categoryService } from '../../services/category.service';
import { useFetch } from '../../hooks/useFetch';
import { getErrorMessage } from '../../services/api';
import { useState } from 'react';

export function AddBookPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: categories, loading } = useFetch(() => categoryService.list(), []);

  if (loading) return <PageLoader />;
  if (categories && categories.length === 0) {
    return <ErrorMessage message="Create a category first, then add books." />;
  }

  const submit = async (values: ReturnType<typeof emptyBookForm>) => {
    setBusy(true);
    setError(null);
    try {
      const book = await adminService.createBook({
        title: values.title,
        author: values.author,
        category: values.category,
        price: Number(values.price),
        stock: Number(values.stock),
        isbn: values.isbn,
        coverImage: values.coverImage,
        description: values.description,
      });
      navigate(`/admin/books/${book._id}`);
    } catch (err) {
      setError(getErrorMessage(err));
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <Breadcrumbs items={[{ label: 'Books', to: '/admin/books' }, { label: 'Add Book' }]} />
      <h2 className="font-serif text-heading-lg text-ink">Add a new book</h2>
      {error && <ErrorMessage message={error} />}
      <BookForm
        categories={categories ?? []}
        initial={emptyBookForm(categories ?? [])}
        submitLabel="Add book"
        busy={busy}
        onSubmit={submit}
        onCancel={() => navigate('/admin/books')}
      />
    </div>
  );
}