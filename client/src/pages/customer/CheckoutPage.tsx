import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { orderService } from '../../services/order.service';
import { getErrorMessage } from '../../services/api';
import { formatCurrency } from '../../utils/format';
import { Button } from '../../components/ui/Button';
import { Field } from '../../components/ui/Field';
import { Input } from '../../components/ui/Input';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { EmptyState } from '../../components/ui/EmptyState';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';

interface FormState {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
}

const emptyForm: FormState = { name: '', address: '', city: '', postalCode: '', phone: '' };

export function CheckoutPage() {
  const { items, total, count, clear } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const order = await orderService.checkout(form);
      await clear();
      navigate(`/order-success/${order._id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (items.length === 0 && !busy) {
    return (
      <div className="container-shell py-10">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Checkout' }]} />
        <div className="mt-10">
          <EmptyState
            title="Your cart is empty"
            description="Add some books before heading to checkout."
            action={
              <Link to="/books">
                <Button>Browse books</Button>
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container-shell py-10">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Checkout' }]} />
      <h1 className="editorial-heading mt-3 text-display">Checkout</h1>

      <form onSubmit={submit} className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]" noValidate>
        <section>
          <h2 className="text-x-small font-semibold uppercase tracking-widest text-muted">
            Shipping details
          </h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <Field label="Full name" htmlFor="co-name">
              <Input id="co-name" value={form.name} onChange={set('name')} required minLength={2} autoComplete="name" />
            </Field>
            <Field label="Phone (optional)" htmlFor="co-phone">
              <Input id="co-phone" value={form.phone} onChange={set('phone')} autoComplete="tel" />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Street address" htmlFor="co-address">
                <Input id="co-address" value={form.address} onChange={set('address')} required minLength={5} autoComplete="street-address" />
              </Field>
            </div>
            <Field label="City" htmlFor="co-city">
              <Input id="co-city" value={form.city} onChange={set('city')} required autoComplete="address-level2" />
            </Field>
            <Field label="Postal code" htmlFor="co-postal">
              <Input id="co-postal" value={form.postalCode} onChange={set('postalCode')} required autoComplete="postal-code" />
            </Field>
          </div>

          {error && (
            <div className="mt-6">
              <ErrorMessage message={error} />
            </div>
          )}

          <div className="mt-8 rounded-xs border border-info bg-info-soft px-4 py-3 text-x-small text-info">
            Demo checkout — no payment is processed. Your order is placed and tracked by status
            (pending → confirmed → shipped → delivered) by the admin.
          </div>
        </section>

        <aside className="h-fit lg:sticky lg:top-24">
          <div className="rounded-md border border-line bg-surface p-6">
            <h2 className="font-serif text-heading text-ink">Order summary</h2>
            <ul className="mt-4 space-y-3 text-small">
              {items.map((item) => (
                <li key={item._id} className="flex justify-between gap-3">
                  <span className="min-w-0 flex-1 truncate text-muted">
                    {item.book.title}
                    <span className="text-neutral-400"> × {item.quantity}</span>
                  </span>
                  <span className="font-medium text-ink">
                    {formatCurrency(item.book.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between border-t border-line pt-3 text-title font-medium text-ink">
              <span>Total ({count} {count === 1 ? 'book' : 'books'})</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <Button type="submit" fullWidth size="lg" disabled={busy} className="mt-6">
              {busy ? 'Placing order…' : 'Place order'}
            </Button>
            <p className="mt-3 text-center text-x-small text-muted">Free shipping on all orders.</p>
          </div>
        </aside>
      </form>
    </div>
  );
}