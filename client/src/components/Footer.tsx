import { Link } from 'react-router-dom';

const columns = [
  {
    title: 'Books',
    links: [
      { label: 'All Books', to: '/books' },
      { label: 'Fiction', to: '/books' },
      { label: 'Classics', to: '/books' },
      { label: 'Science', to: '/books' },
    ],
  },
  {
    title: 'Customer Care',
    links: [
      { label: 'My Orders', to: '/orders' },
      { label: 'Wishlist', to: '/wishlist' },
      { label: 'My Reviews', to: '/reviews' },
      { label: 'Profile', to: '/profile' },
      { label: 'Cart', to: '/cart' },
    ],
  },
  {
    title: 'Store',
    links: [
      { label: 'About Leaf & Ink', to: '/' },
      { label: 'New Arrivals', to: '/books' },
      { label: 'Best Sellers', to: '/books' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-surface">
      <div className="container-shell py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <img src="/favicon.svg" alt="" width="26" height="26" className="rounded-xs" />
              <span className="font-serif text-title font-semibold text-ink">Leaf &amp; Ink Books</span>
            </div>
            <p className="mt-3 max-w-sm text-small text-muted">
              An independent online bookstore. A carefully curated shelf, considered covers, and fast
              delivery — for readers who take their time.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-x-small font-semibold uppercase tracking-wide text-ink">{col.title}</h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-small text-muted hover:text-accent">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-shell flex flex-col items-center justify-between gap-2 py-5 text-x-small text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} Leaf &amp; Ink Books.</p>
        </div>
      </div>
    </footer>
  );
}