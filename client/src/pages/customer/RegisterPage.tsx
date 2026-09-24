import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Field } from '../../components/ui/Field';
import { Input } from '../../components/ui/Input';
import { ErrorMessage } from '../../components/ui/ErrorMessage';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const passwordError =
    password && confirm && password !== confirm ? 'Passwords do not match.' : undefined;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      await register(name, email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-shell flex justify-center py-16">
      <div className="w-full max-w-md">
        <p className="text-x-small font-semibold uppercase tracking-widest text-accent">Join the store</p>
        <h1 className="editorial-heading mt-2 text-heading-lg">Create your account</h1>
        <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
          {error && <ErrorMessage message={error} />}
          <Field label="Full name" htmlFor="reg-name">
            <Input
              id="reg-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              placeholder="Ada Lovelace"
            />
          </Field>
          <Field label="Email" htmlFor="reg-email">
            <Input
              id="reg-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </Field>
          <Field label="Password" htmlFor="reg-password" error={passwordError}>
            <Input
              id="reg-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="At least 6 characters"
            />
          </Field>
          <Field label="Confirm password" htmlFor="reg-confirm">
            <Input
              id="reg-confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              placeholder="Repeat password"
            />
          </Field>
          <Button type="submit" fullWidth disabled={busy} size="lg">
            {busy ? 'Creating account…' : 'Create account'}
          </Button>
        </form>
        <p className="mt-6 text-center text-small text-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-accent hover:text-accent-dark">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}