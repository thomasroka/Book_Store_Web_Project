import { useState, type FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../services/api';
import { formatDate } from '../../utils/format';
import { Button } from '../../components/ui/Button';
import { Field } from '../../components/ui/Field';
import { Input } from '../../components/ui/Input';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { PageLoader } from '../../components/ui/Spinner';

export function ProfilePage() {
  const { user, loaded, updateProfileName } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!loaded || !user) return <PageLoader />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setBusy(true);
    try {
      await updateProfileName(name);
      setSaved(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-shell py-10">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Profile' }]} />
      <h1 className="editorial-heading mt-3 text-display">Your profile</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,440px)_1fr]">
        <form onSubmit={submit} className="space-y-5 rounded-md border border-line bg-surface p-6" noValidate>
          <p className="text-x-small font-semibold uppercase tracking-widest text-muted">Account details</p>
          {error && <ErrorMessage message={error} />}
          {saved && (
            <p className="rounded-xs border border-success bg-success-soft px-3 py-2 text-small text-success">
              Profile updated.
            </p>
          )}
          <Field label="Full name" htmlFor="profile-name">
            <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
          </Field>
          <Field label="Email" htmlFor="profile-email" hint="Email cannot be changed.">
            <Input id="profile-email" value={user.email} disabled />
          </Field>
          <Button type="submit" disabled={busy || name === user.name}>
            {busy ? 'Saving…' : 'Save changes'}
          </Button>
        </form>

        <section>
          <p className="text-x-small font-semibold uppercase tracking-widest text-muted">Account overview</p>
          <dl className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="rounded-md border border-line bg-surface p-5">
              <dt className="text-x-small text-muted">Member since</dt>
              <dd className="mt-1 font-serif text-heading text-ink">{formatDate(user.createdAt)}</dd>
            </div>
            <div className="rounded-md border border-line bg-surface p-5">
              <dt className="text-x-small text-muted">Role</dt>
              <dd className="mt-1 font-serif text-heading capitalize text-ink">{user.role}</dd>
            </div>
            <div className="rounded-md border border-line bg-surface p-5">
              <dt className="text-x-small text-muted">Account</dt>
              <dd className="mt-1 font-serif text-heading text-ink">Active</dd>
            </div>
          </dl>
          <p className="mt-4 text-x-small text-muted">
            Manage your purchases from{' '}
            <a href="/orders" className="font-medium text-accent hover:text-accent-dark">
              My Orders
            </a>
            , your saved books in{' '}
            <a href="/wishlist" className="font-medium text-accent hover:text-accent-dark">
              Wishlist
            </a>
            , and your feedback under{' '}
            <a href="/reviews" className="font-medium text-accent hover:text-accent-dark">
              My Reviews
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}