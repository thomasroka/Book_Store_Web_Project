import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';

const navItems = [
  { label: 'Dashboard', to: '/admin', end: true },
  { label: 'Books', to: '/admin/books' },
  { label: 'Add Book', to: '/admin/books/new' },
  { label: 'Categories', to: '/admin/categories' },
  { label: 'Inventory', to: '/admin/inventory' },
  { label: 'Orders', to: '/admin/orders' },
  { label: 'Customers', to: '/admin/customers' },
  { label: 'Reviews', to: '/admin/reviews' },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setDrawerOpen(false);
  }, [location.pathname]);

  const SidebarContent = (
    <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4" aria-label="Admin">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            cn(
              'rounded-xs px-3 py-2 text-small font-medium transition-colors',
              isActive ? 'bg-neutral-700 text-paper' : 'text-neutral-300 hover:bg-neutral-800 hover:text-paper'
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
      <div className="mt-6 border-t border-neutral-700 px-3 pt-4">
        <Link to="/" className="block rounded-xs px-1 py-1.5 text-small text-neutral-300 hover:text-paper">
          ← Back to store
        </Link>
        <button
          onClick={logout}
          className="block w-full px-1 py-1.5 text-left text-small text-neutral-300 hover:text-paper"
        >
          Log out
        </button>
      </div>
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-neutral-900 lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-neutral-800 px-5">
          <img src="/favicon.svg" alt="" width="26" height="26" className="rounded-xs" />
          <div className="leading-tight">
            <p className="font-serif text-small font-semibold text-paper">Leaf &amp; Ink</p>
            <p className="text-x-small text-neutral-400">Admin</p>
          </div>
        </div>
        {SidebarContent}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-60">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-neutral-200 bg-surface px-4 sm:px-6">
          <button
            className="rounded-xs p-1 text-muted hover:text-ink focus-ring lg:hidden"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open admin menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
          <h1 className="truncate font-serif text-heading text-ink">
            {navItems.find((n) => (n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)))?.label ?? 'Admin'}
          </h1>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-small text-muted sm:block">{user?.email}</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent font-serif text-small font-medium text-paper">
              {user?.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </header>

        {drawerOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-ink/40" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
            <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-neutral-900">
              {SidebarContent}
            </aside>
          </div>
        )}

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}