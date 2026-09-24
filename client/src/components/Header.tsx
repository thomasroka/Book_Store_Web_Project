import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { SearchBar } from './SearchBar';
import { cn } from '../utils/cn';

const accountLinks = [
  { label: 'My Orders', to: '/orders' },
  { label: 'Wishlist', to: '/wishlist' },
  { label: 'My Reviews', to: '/reviews' },
  { label: 'Profile', to: '/profile' },
];

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 focus-ring">
      <img src="/favicon.svg" alt="" width="26" height="26" className="rounded-xs" />
      <span className="font-serif text-title font-semibold tracking-tight text-ink">
        Leaf &amp; Ink
      </span>
    </Link>
  );
}

export function Header() {
  const { user, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const navLink = ({ isActive }: { isActive: boolean }) =>
    cn(
      'rounded-xs px-1 py-0.5 text-small font-medium transition-colors',
      isActive ? 'text-accent' : 'text-body hover:text-ink'
    );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="container-shell">
        <div className="flex h-16 items-center gap-6">
          <button
            className="rounded-xs p-1 text-muted hover:text-ink focus-ring lg:hidden"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>

          <Logo />

          <nav className="hidden items-center gap-5 lg:flex" aria-label="Primary">
            <NavLink to="/" className={navLink} end>
              Home
            </NavLink>
            <NavLink to="/books" className={navLink}>
              Books
            </NavLink>
            <NavLink to="/books" className={navLink}>
              Categories
            </NavLink>
          </nav>

          <div className="ml-auto hidden max-w-md flex-1 md:block">
            <SearchBar navigatesToResults />
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/cart"
              className="relative rounded-xs p-2 text-body hover:text-ink focus-ring"
              aria-label={`Cart with ${count} items`}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M3 4h2l2.4 11.4a1.5 1.5 0 001.5 1.2h8.9a1.5 1.5 0 001.5-1.2L21 8H6"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="9.5" cy="20" r="1.3" fill="currentColor" />
                <circle cx="17" cy="20" r="1.3" fill="currentColor" />
              </svg>
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-x-small font-medium text-paper">
                  {count}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative">
                <button
                  className="flex items-center gap-2 rounded-xs p-1.5 focus-ring"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-expanded={menuOpen}
                  aria-label="Account menu"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent font-serif text-small font-medium text-paper">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden text-small font-medium text-body sm:block">{user.name.split(' ')[0]}</span>
                </button>

                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} aria-hidden="true" />
                    <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-md border border-line bg-surface py-1.5 shadow-menu">
                      <div className="border-b border-line px-4 py-2">
                        <p className="truncate text-small font-medium text-ink">{user.name}</p>
                        <p className="truncate text-x-small text-muted">{user.email}</p>
                      </div>
                      <nav aria-label="Account" className="py-1">
                        {accountLinks.map((link) => (
                          <Link
                            key={link.to}
                            to={link.to}
                            onClick={() => setMenuOpen(false)}
                            className="block px-4 py-2 text-small text-body hover:bg-neutral-50 hover:text-ink"
                          >
                            {link.label}
                          </Link>
                        ))}
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setMenuOpen(false)}
                            className="block px-4 py-2 text-small font-medium text-accent hover:bg-neutral-50"
                          >
                            Admin Dashboard
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            logout();
                          }}
                          className="block w-full px-4 py-2 text-left text-small text-danger hover:bg-neutral-50"
                        >
                          Log out
                        </button>
                      </nav>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden items-center gap-1 sm:flex">
                <Link
                  to="/login"
                  className="rounded-xs px-3 py-1.5 text-small font-medium text-body hover:text-ink focus-ring"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-xs bg-accent px-3 py-1.5 text-small font-medium text-paper hover:bg-accent-dark focus-ring"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
          <div className="absolute inset-y-0 left-0 flex w-80 max-w-[85vw] flex-col bg-paper shadow-lifted">
            <div className="flex h-16 items-center justify-between border-b border-line px-5">
              <Logo />
              <button
                className="rounded-xs p-1 text-muted hover:text-ink focus-ring"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="border-b border-line px-5 py-4">
              <SearchBar navigatesToResults />
            </div>
            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-5 py-4" aria-label="Mobile">
              {[
                { label: 'Home', to: '/' },
                { label: 'Books', to: '/books' },
                { label: 'Categories', to: '/books' },
                ...(user ? accountLinks : []),
              ].map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-xs px-2 py-2.5 font-serif text-heading text-ink hover:bg-neutral-100"
                >
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-xs px-2 py-2.5 font-serif text-heading text-accent hover:bg-neutral-100"
                >
                  Admin Dashboard
                </Link>
              )}
            </nav>
            <div className="border-t border-line px-5 py-4">
              {user ? (
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    logout();
                  }}
                  className="w-full rounded-xs border border-danger px-3 py-2 text-small font-medium text-danger"
                >
                  Log out
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/login"
                    onClick={() => setDrawerOpen(false)}
                    className="rounded-xs border border-line-strong px-3 py-2 text-center text-small font-medium text-body"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setDrawerOpen(false)}
                    className="rounded-xs bg-accent px-3 py-2 text-center text-small font-medium text-paper"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}