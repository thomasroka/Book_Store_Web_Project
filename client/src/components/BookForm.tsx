import { useState, type ChangeEvent, type FormEvent } from 'react';
import type { Book } from '../types';
import { adminService } from '../services/admin.service';
import { getErrorMessage } from '../services/api';
import { cn } from '../utils/cn';
import { Button } from './ui/Button';
import { Field } from './ui/Field';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Textarea } from './ui/Textarea';
import { ErrorMessage } from './ui/ErrorMessage';
import { BookCover } from './BookCover';

export interface BookFormValues {
  title: string;
  author: string;
  category: string;
  isbn: string;
  price: string;
  stock: string;
  coverImage: string;
  description: string;
}

export function emptyBookForm(categories: Array<{ _id: string; name: string }>): BookFormValues {
  return {
    title: '',
    author: '',
    category: categories[0]?._id ?? '',
    isbn: '',
    price: '',
    stock: '0',
    coverImage: '',
    description: '',
  };
}

export function bookToForm(book: Book): BookFormValues {
  return {
    title: book.title,
    author: book.author,
    category: typeof book.category === 'string' ? book.category : book.category?._id ?? '',
    isbn: book.isbn ?? '',
    price: String(book.price),
    stock: String(book.stock),
    coverImage: book.coverImage ?? '',
    description: book.description ?? '',
  };
}

interface BookFormProps {
  categories: Array<{ _id: string; name: string }>;
  initial: BookFormValues;
  submitLabel: string;
  busy?: boolean;
  onSubmit: (values: BookFormValues) => Promise<void> | void;
  onCancel?: () => void;
}

export function BookForm({ categories, initial, submitLabel, busy = false, onSubmit, onCancel }: BookFormProps) {
  const [values, setValues] = useState<BookFormValues>(initial);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const set = (key: keyof BookFormValues) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setValues((prev) => ({ ...prev, [key]: e.target.value }));

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) {
      setUploadError('Only JPEG, PNG, WebP, or GIF images are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be smaller than 5 MB.');
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      const { url } = await adminService.uploadImage(file);
      setValues((prev) => ({ ...prev, coverImage: url }));
    } catch (err) {
      setUploadError(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!values.title.trim() || !values.author.trim()) {
      setError('Title and author are required.');
      return;
    }
    if (!values.category) {
      setError('Please choose a category.');
      return;
    }
    const price = Number(values.price);
    if (Number.isNaN(price) || price < 0) {
      setError('Price must be zero or more.');
      return;
    }
    const stock = Number(values.stock);
    if (Number.isNaN(stock) || !Number.isInteger(stock) || stock < 0) {
      setError('Stock must be a whole number of zero or more.');
      return;
    }
    await onSubmit(values);
  };

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      {error && <ErrorMessage message={error} />}

      <div className="rounded-md border border-line bg-surface p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Title" htmlFor="bf-title">
            <Input id="bf-title" value={values.title} onChange={set('title')} required placeholder="The Great Gatsby" />
          </Field>
          <Field label="Author" htmlFor="bf-author">
            <Input id="bf-author" value={values.author} onChange={set('author')} required placeholder="F. Scott Fitzgerald" />
          </Field>
          <Field label="Category" htmlFor="bf-category">
            <Select id="bf-category" value={values.category} onChange={set('category')} required>
              {categories.length === 0 && <option value="">No categories — add one first</option>}
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="ISBN" htmlFor="bf-isbn">
            <Input id="bf-isbn" value={values.isbn} onChange={set('isbn')} placeholder="9780743273565" />
          </Field>
          <Field label="Price (USD)" htmlFor="bf-price">
            <Input
              id="bf-price"
              type="number"
              min="0"
              step="0.01"
              value={values.price}
              onChange={set('price')}
              required
              placeholder="14.99"
            />
          </Field>
          <Field label="Stock" htmlFor="bf-stock">
            <Input id="bf-stock" type="number" min="0" step="1" value={values.stock} onChange={set('stock')} required />
          </Field>
        </div>
      </div>

      <div className="rounded-md border border-line bg-surface p-6">
        <div className="grid gap-5">
          <Field label="Cover photo" htmlFor="bf-cover-file" hint="Upload a JPEG, PNG, WebP, or GIF under 5 MB.">
            <div className="flex items-center gap-5">
              <div className="w-24 shrink-0">
                <BookCover title={values.title || 'Book cover'} author={values.author} src={values.coverImage || undefined} />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="bf-cover-file"
                  className={cn(
                    'inline-flex cursor-pointer items-center justify-center gap-2 rounded-sm border border-line-strong px-4 py-2 text-small font-medium text-accent transition-colors duration-150 hover:border-accent hover:bg-accent-soft focus-ring',
                    uploading && 'cursor-wait border-line text-neutral-400 hover:border-line hover:bg-transparent'
                  )}
                >
                  {uploading ? 'Uploading…' : 'Upload photo'}
                  <input
                    id="bf-cover-file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    disabled={uploading}
                    onChange={handleFile}
                  />
                </label>
                {uploadError && <p className="text-x-small text-danger">{uploadError}</p>}
              </div>
            </div>
          </Field>
          <Field label="Cover image URL" htmlFor="bf-cover" hint="Leave blank to use a generated placeholder, or set a URL from a cover service.">
            <Input
              id="bf-cover"
              value={values.coverImage}
              onChange={set('coverImage')}
              placeholder="https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg"
            />
          </Field>
          <Field label="Description" htmlFor="bf-desc">
            <Textarea
              id="bf-desc"
              rows={6}
              value={values.description}
              onChange={set('description')}
              placeholder="A short editorial description of the book…"
            />
          </Field>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" size="lg" disabled={busy}>
          {busy ? 'Saving…' : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}