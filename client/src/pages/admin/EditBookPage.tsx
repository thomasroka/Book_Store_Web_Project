import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BookForm, bookToForm } from '../../components/BookForm';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { PageLoader } from '../../components/ui/Spinner';
import { adminService } from '../../services/admin.service';
import { categoryService } from '../../services/category.service';
import { useFetch } from '../../hooks/useFetch';
import { getErrorMessage } from '../../services/api';

export function EditBookPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const { data: categories } = useFetch(() => categoryService.list(), []);
  const { data: book, loading, error: loadError } = useFetch(() => adminService.getBook(id!), [id]);

  if (loading) return <PageLoader />;
  if (loadError || !book) return <ErrorMessage message={loadError ?? 'Book not found.'} />;

  const submit = async (values: ReturnType<typeof bookToForm>) => {
    setBusy(true);
    setError(null);
    try {
      await adminService.updateBook(book._id, {
        title: values.title,
        author: values.author,
        category: values.category,
        price: Number(values.price),
        stock: Number(values.stock),
        isbn: values.isbn,
        coverImage: values.coverImage,
        description: values.description,
      });
      navigate('/admin/books');
    } catch (err) {
      setError(getErrorMessage(err));
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await adminService.deleteBook(book._id);
      navigate('/admin/books');
    } catch (err) {
      window.alert(getErrorMessage(err));
      setDeleting(false);
      setShowDelete(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Books', to: '/admin/books' },
          { label: book.title },
        ]}
      />
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-heading-lg text-ink">Edit book</h2>
        <Button variant="danger" onClick={() => setShowDelete(true)}>
          Delete book
        </Button>
      </div>
      {error && <ErrorMessage message={error} />}
      <BookForm
        categories={categories ?? []}
        initial={bookToForm(book)}
        submitLabel="Save changes"
        busy={busy}
        onSubmit={submit}
        onCancel={() => navigate('/admin/books')}
      />
      <div className="text-x-small text-muted">
        Stock updates belong on the{' '}
        <Link to="/admin/inventory" className="font-medium text-accent hover:underline">
          Inventory
        </Link>{' '}
        page.
      </div>

      <ConfirmDialog
        open={showDelete}
        title="Delete book"
        message={`Permanently remove "${book.title}" from the store? This cannot be undone.`}
        confirmLabel="Delete book"
        destructive
        busy={deleting}
        onConfirm={confirmDelete}
        onClose={() => setShowDelete(false)}
      />
    </div>
  );
}