// @ts-nocheck
/**
 * In-memory mock of the Book Store API.
 *
 * Purpose: let you explore the frontend without a database.
 * It serves the exact same routes and response shapes as the real
 * Express + MongoDB server in src/app.ts, but everything lives in RAM
 * and resets when the process stops.
 *
 * Run with:  npx tsx src/mock.ts   (serves on http://localhost:5000)
 */
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';

const PORT = 5000;
const JWT_SECRET = 'leaf-ink-mock-secret';
const COVER = (isbn) => `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;

const uploadsDir = path.resolve(__dirname, '../uploads');
fs.mkdirSync(uploadsDir, { recursive: true });
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.mimetype)) {
      cb(new Error('Only JPEG, PNG, WebP, or GIF images are allowed.'));
      return;
    }
    cb(null, true);
  },
});

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

let nextId = (prefix) => `${prefix}${++seq}`;
let seq = 1000;

const daysAgo = (n, hour = 10) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, 15, 0, 0);
  return d.toISOString();
};
const monthKey = (iso) => iso.slice(0, 7);
const round = (n) => Math.round(n * 100) / 100;

// ---------------------------------------------------------------- data
const categories = [
  { _id: 'c-fiction', name: 'Fiction', slug: 'fiction' },
  { _id: 'c-sff', name: 'Science Fiction & Fantasy', slug: 'science-fiction-fantasy' },
  { _id: 'c-classics', name: 'Classics', slug: 'classics' },
  { _id: 'c-history', name: 'History', slug: 'history' },
  { _id: 'c-science', name: 'Science', slug: 'science' },
  { _id: 'c-philosophy', name: 'Philosophy', slug: 'philosophy' },
  { _id: 'c-bio', name: 'Biography & Memoir', slug: 'biography-memoir' },
  { _id: 'c-psych', name: 'Psychology', slug: 'psychology' },
];

const bookDefs = [
  { title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '9780061120084', cat: 'c-fiction', price: 14.99, stock: 24, desc: 'A gripping, heart-wrenching, and wholly remarkable tale of coming-of-age in a South poisoned by virulent prejudice.' },
  { title: '1984', author: 'George Orwell', isbn: '9780451524935', cat: 'c-fiction', price: 12.99, stock: 18, desc: 'Winston Smith rewrites history for the Ministry of Truth in a world of perpetual war, omnipresent surveillance, and Big Brother.' },
  { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '9780743273565', cat: 'c-classics', price: 13.0, stock: 31, desc: "Jay Gatsby reinvents himself in pursuit of the American dream's elusive green light." },
  { title: 'Pride and Prejudice', author: 'Jane Austen', isbn: '9780141439518', cat: 'c-classics', price: 11.0, stock: 12, desc: "Mr. Bennet's five eligible daughters are thrust into the sparkling world of English society." },
  { title: 'Dune', author: 'Frank Herbert', isbn: '9780441172719', cat: 'c-sff', price: 16.0, stock: 42, desc: 'On the desert planet Arrakis, Paul Atreides would lead its nomadic tribes into battle against the Empire.' },
  { title: 'The Hobbit', author: 'J.R.R. Tolkien', isbn: '9780547928227', cat: 'c-sff', price: 15.99, stock: 4, desc: 'Bilbo Baggins is swept into an epic, dragon-guarded quest through Middle-earth.' },
  { title: 'Fahrenheit 451', author: 'Ray Bradbury', isbn: '9781451673319', cat: 'c-sff', price: 14.0, stock: 0, desc: 'Guy Montag is a fireman whose job is to destroy the most illegal of commodities — the printed book.' },
  { title: 'The Left Hand of Darkness', author: 'Ursula K. Le Guin', isbn: '9780441478125', cat: 'c-sff', price: 13.5, stock: 9, desc: 'A lone human emissary to Winter, a planet whose inhabitants can change gender, must overcome fear and prejudice.' },
  { title: 'Moby-Dick', author: 'Herman Melville', isbn: '9780142437247', cat: 'c-classics', price: 12.0, stock: 7, desc: 'A monumental allegory of obsession, vengeance, and fate aboard the whaling ship Pequod.' },
  { title: 'The Odyssey', author: 'Homer', isbn: '9780140268867', cat: 'c-classics', price: 15.0, stock: 15, desc: "Odysseus's ten-year journey home from the Trojan War, in Robert Fagles's celebrated translation." },
  { title: 'Sapiens', author: 'Yuval Noah Harari', isbn: '9780062316097', cat: 'c-history', price: 18.99, stock: 27, desc: 'From the emergence of Homo sapiens to the Anthropocene — how one species came to rule the planet.' },
  { title: 'A Brief History of Time', author: 'Stephen Hawking', isbn: '9780553380163', cat: 'c-science', price: 13.0, stock: 3, desc: 'From the Big Bang to black holes, Hawkings landmark book on the frontiers of cosmology.' },
  { title: 'Cosmos', author: 'Carl Sagan', isbn: '9780345539434', cat: 'c-science', price: 16.99, stock: 21, desc: "Carl Sagan's stirring exploration of the universe in thirteen interconnected chapters." },
  { title: 'The Selfish Gene', author: 'Richard Dawkins', isbn: '9780198788607', cat: 'c-science', price: 14.5, stock: 6, desc: 'An argument that evolution is driven by the gene, not the organism.' },
  { title: 'Meditations', author: 'Marcus Aurelius', isbn: '9780140449334', cat: 'c-philosophy', price: 10.0, stock: 33, desc: 'The private reflections of a Roman emperor on duty, resilience, and the conduct of a life governed by reason.' },
  { title: 'The Diary of a Young Girl', author: 'Anne Frank', isbn: '9780553296983', cat: 'c-bio', price: 9.99, stock: 19, desc: 'The diary of a young girl hiding from the Nazis — a portrait of courage and the endurance of hope.' },
  { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', isbn: '9780374533557', cat: 'c-psych', price: 17.0, stock: 11, desc: 'The two systems that drive the way we think — and the biases that shape our choices.' },
  { title: 'The Catcher in the Rye', author: 'J.D. Salinger', isbn: '9780316769488', cat: 'c-fiction', price: 12.0, stock: 0, desc: "Holden Caulfield's restless, searching voice captures the loneliness of adolescence." },
];

let books = bookDefs.map((b, i) => ({
  _id: `b-${String(i + 1).padStart(2, '0')}`,
  title: b.title,
  author: b.author,
  isbn: b.isbn,
  description: b.desc,
  price: b.price,
  coverImage: COVER(b.isbn),
  stock: b.stock,
  category: b.cat,
  ratingAvg: 0,
  ratingCount: 0,
  createdAt: daysAgo(210 - i * 3),
  updatedAt: daysAgo(210 - i * 3),
}));
const bookById = (id) => books.find((b) => b._id === id);
const catById = (id) => categories.find((c) => c._id === id);

const h = (pw) => bcrypt.hashSync(pw, 8);
let users = [
  { id: 'u-admin', name: 'Store Admin', email: 'admin@bookstore.com', passwordHash: h('admin123'), role: 'admin', createdAt: daysAgo(200) },
  { id: 'u-demo', name: 'Demo Customer', email: 'demo@bookstore.com', passwordHash: h('demo123'), role: 'customer', createdAt: daysAgo(190) },
  { id: 'u-rita', name: 'Rita Moreno', email: 'rita@example.com', passwordHash: h('rita123'), role: 'customer', createdAt: daysAgo(160) },
  { id: 'u-omar', name: 'Omar Salim', email: 'omar@example.com', passwordHash: h('omar123'), role: 'customer', createdAt: daysAgo(120) },
  { id: 'u-lena', name: 'Lena Novak', email: 'lena@example.com', passwordHash: h('lena123'), role: 'customer', createdAt: daysAgo(70) },
];

function publicUser(u) {
  const { passwordHash, ...rest } = u;
  return rest;
}

const userReviews = [
  { book: 'b-01', user: 'u-demo', rating: 5, comment: 'A quiet, devastating masterpiece. Atticus Finch is unforgettable.', status: 'approved' },
  { book: 'b-01', user: 'u-admin', rating: 4, comment: 'Beautifully written, though the pacing is slow in the middle chapters.', status: 'approved' },
  { book: 'b-05', user: 'u-demo', rating: 5, comment: 'The world-building is astonishing. Pauls journey still resonates decades later.', status: 'approved' },
  { book: 'b-02', user: 'u-demo', rating: 4, comment: 'Unsettling and essential. The appendix about Newspeak is fascinating.', status: 'approved' },
  { book: 'b-11', user: 'u-lena', rating: 5, comment: 'A sweeping, lucid history of our species. Hard to put down.', status: 'approved' },
  { book: 'b-06', user: 'u-demo', rating: 5, comment: 'Pure, joyful adventure. The perfect introduction to Middle-earth.', status: 'approved' },
  { book: 'b-09', user: 'u-demo', rating: 3, comment: 'Dense and digressive, but the final chase is worth the voyage.', status: 'pending' },
  { book: 'b-03', user: 'u-omar', rating: 4, comment: 'A shimmering portrait of longing and reinvention. Worth revisiting.', status: 'approved' },
  { book: 'b-08', user: 'u-rita', rating: 5, comment: 'Astonishing. Le Guin explores gender and trust like no one else.', status: 'pending' },
];

let reviews = userReviews.map((r, i) => ({
  _id: `r-${i + 1}`,
  ...r,
  createdAt: daysAgo(150 - i * 6),
}));

for (const b of books) {
  const approved = reviews.filter((r) => r.book === b._id && r.status === 'approved');
  if (approved.length) {
    b.ratingAvg = round(approved.reduce((s, r) => s + r.rating, 0) / approved.length);
    b.ratingCount = approved.length;
  }
}

let cartItems = [];
let wishlistItems = [];
let orderSeq = 4100;

function mkOrderItems(defs) {
  return defs.map((d) => {
    const b = bookById(d.book);
    return { book: b._id, title: b.title, author: b.author, price: b.price, quantity: d.qty, coverImage: b.coverImage };
  });
}

let orders = [
  { _id: 'o-1', orderNumber: `OBS-${orderSeq++}`, user: 'u-demo', status: 'delivered', shippingInfo: { name: 'Demo Customer', address: '14 Linden Street', city: 'Portland', postalCode: '97205', phone: '555-0142' }, items: mkOrderItems([{ book: 'b-01', qty: 1 }, { book: 'b-11', qty: 1 }]), createdAt: daysAgo(160), updatedAt: daysAgo(145) },
  { _id: 'o-2', orderNumber: `OBS-${orderSeq++}`, user: 'u-demo', status: 'shipped', shippingInfo: { name: 'Demo Customer', address: '14 Linden Street', city: 'Portland', postalCode: '97205', phone: '555-0142' }, items: mkOrderItems([{ book: 'b-05', qty: 1 }]), createdAt: daysAgo(32), updatedAt: daysAgo(28) },
  { _id: 'o-3', orderNumber: `OBS-${orderSeq++}`, user: 'u-demo', status: 'confirmed', shippingInfo: { name: 'Demo Customer', address: '14 Linden Street', city: 'Portland', postalCode: '97205', phone: '555-0142' }, items: mkOrderItems([{ book: 'b-06', qty: 2 }, { book: 'b-15', qty: 1 }]), createdAt: daysAgo(6), updatedAt: daysAgo(4) },
  { _id: 'o-4', orderNumber: `OBS-${orderSeq++}`, user: 'u-rita', status: 'pending', shippingInfo: { name: 'Rita Moreno', address: '9 Seaview Way', city: 'San Diego', postalCode: '92101', phone: '555-0177' }, items: mkOrderItems([{ book: 'b-13', qty: 1 }]), createdAt: daysAgo(2, 9), updatedAt: daysAgo(2, 9) },
  { _id: 'o-5', orderNumber: `OBS-${orderSeq++}`, user: 'u-omar', status: 'delivered', shippingInfo: { name: 'Omar Salim', address: '3 Court Road', city: 'Austin', postalCode: '78701', phone: '555-0133' }, items: mkOrderItems([{ book: 'b-03', qty: 1 }, { book: 'b-16', qty: 2 }]), createdAt: daysAgo(120), updatedAt: daysAgo(110) },
  { _id: 'o-6', orderNumber: `OBS-${orderSeq++}`, user: 'u-lena', status: 'cancelled', shippingInfo: { name: 'Lena Novak', address: '22 Beech Lane', city: 'Seattle', postalCode: '98101', phone: '555-0155' }, items: mkOrderItems([{ book: 'b-17', qty: 1 }]), createdAt: daysAgo(60), updatedAt: daysAgo(58) },
  { _id: 'o-7', orderNumber: `OBS-${orderSeq++}`, user: 'u-omar', status: 'delivered', shippingInfo: { name: 'Omar Salim', address: '3 Court Road', city: 'Austin', postalCode: '78701', phone: '555-0133' }, items: mkOrderItems([{ book: 'b-10', qty: 1 }, { book: 'b-04', qty: 1 }]), createdAt: daysAgo(95), updatedAt: daysAgo(85) },
  { _id: 'o-8', orderNumber: `OBS-${orderSeq++}`, user: 'u-lena', status: 'pending', shippingInfo: { name: 'Lena Novak', address: '22 Beech Lane', city: 'Seattle', postalCode: '98101', phone: '555-0155' }, items: mkOrderItems([{ book: 'b-07', qty: 1 }]), createdAt: daysAgo(1, 14), updatedAt: daysAgo(1, 14) },
];
for (const o of orders) {
  o.total = round(o.items.reduce((s, i) => s + i.price * i.quantity, 0));
}

// ---------------------------------------------------------------- helpers
function ok(res, data, meta, status = 200) {
  const body = { success: true, data };
  if (meta) body.meta = meta;
  return res.status(status).json(body);
}
function fail(res, status, message) {
  return res.status(status).json({ success: false, message });
}

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return fail(res, 401, 'Not authorized, token missing.');
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET);
    const user = users.find((u) => u.id === payload.id);
    if (!user) return fail(res, 401, 'Not authorized, user no longer exists.');
    req.user = user;
    next();
  } catch {
    return fail(res, 401, 'Not authorized, invalid token.');
  }
}
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') return fail(res, 403, 'Admin access required.');
  next();
}
const sign = (user) => jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

const populateBook = (b) => ({ ...b, category: catById(b.category) });
const paginate = (list, page, limit) => {
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const p = Math.min(Math.max(1, page), totalPages);
  return { page: p, limit, total, totalPages, slice: list.slice((p - 1) * limit, p * limit) };
};

// ---------------------------------------------------------------- /health
app.get('/api/v1/health', (_req, res) => ok(res, { status: 'ok', mode: 'mock' }));

// ---------------------------------------------------------------- auth
app.post('/api/v1/auth/register', async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name?.trim()) return fail(res, 400, 'Name is required.');
  if (!/.+@.+\..+/.test(email ?? '')) return fail(res, 400, 'A valid email is required.');
  if (!password || String(password).length < 6) return fail(res, 400, 'Password must be at least 6 characters.');
  if (users.some((u) => u.email.toLowerCase() === String(email).toLowerCase())) {
    return fail(res, 409, 'An account with this email already exists.');
  }
  const user = {
    id: `u-${++seq}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: bcrypt.hashSync(password, 8),
    role: 'customer',
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  return ok(res, { token: sign(user), user: publicUser(user) });
});

app.post('/api/v1/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  const user = users.find((u) => u.email.toLowerCase() === String(email ?? '').toLowerCase());
  if (!user || !bcrypt.compareSync(String(password ?? ''), user.passwordHash)) {
    return fail(res, 401, 'Invalid email or password.');
  }
  return ok(res, { token: sign(user), user: publicUser(user) });
});

app.get('/api/v1/auth/me', auth, (req, res) => ok(res, { user: publicUser(req.user) }));
app.put('/api/v1/auth/profile', auth, (req, res) => {
  const name = String(req.body?.name ?? '').trim();
  if (!name) return fail(res, 400, 'Name is required.');
  req.user.name = name;
  return ok(res, { user: publicUser(req.user) });
});

// ---------------------------------------------------------------- categories
app.get('/api/v1/categories', (_req, res) => {
  const withCount = categories.map((c) => ({
    ...c,
    bookCount: books.filter((b) => b.category === c._id).length,
  }));
  ok(res, withCount);
});

// ---------------------------------------------------------------- books
app.get('/api/v1/books', (req, res) => {
  const { search, category, sort = 'newest' } = req.query;
  const page = Number(req.query.page ?? 1);
  const limit = Math.min(60, Math.max(1, Number(req.query.limit ?? 12)));
  let list = [...books];
  if (category) list = list.filter((b) => b.category === category);
  if (search && String(search).trim()) {
    const term = String(search).trim().toLowerCase();
    list = list.filter(
      (b) => b.title.toLowerCase().includes(term) || b.author.toLowerCase().includes(term) || b.isbn.toLowerCase().includes(term)
    );
  }
  const sorters = {
    newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    rating: (a, b) => b.ratingAvg - a.ratingAvg || b.ratingCount - a.ratingCount,
  };
  list.sort(sorters[sort] ?? sorters.newest);
  const { page: p, limit: l, total, totalPages, slice } = paginate(list, page, limit);
  ok(res, slice.map(populateBook), { page: p, limit: l, total, totalPages });
});

app.get('/api/v1/books/featured', (_req, res) => {
  const sorted = [...books].sort((a, b) => b.ratingAvg - a.ratingAvg || b.ratingCount - a.ratingCount).slice(0, 8);
  ok(res, sorted.map(populateBook));
});

app.get('/api/v1/books/new', (_req, res) => {
  const sorted = [...books].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8);
  ok(res, sorted.map(populateBook));
});

app.get('/api/v1/books/:id', (req, res) => {
  const book = bookById(req.params.id);
  if (!book) return fail(res, 404, 'Book not found.');
  const rv = reviews
    .filter((r) => r.book === book._id && r.status === 'approved')
    .map((r) => ({ ...r, user: { _id: r.user, name: users.find((u) => u.id === r.user)?.name || 'Reader' } }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  ok(res, { book: populateBook(book), reviews: rv });
});

// ---------------------------------------------------------------- reviews
app.get('/api/v1/reviews/book/:bookId', (req, res) => {
  const rv = reviews
    .filter((r) => r.book === req.params.bookId && r.status === 'approved')
    .map((r) => ({
      ...r,
      user: { _id: r.user, name: users.find((u) => u.id === r.user)?.name || 'Reader' },
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  ok(res, rv);
});

app.post('/api/v1/reviews/book/:bookId', auth, (req, res) => {
  const book = bookById(req.params.bookId);
  if (!book) return fail(res, 404, 'Book not found.');
  const rating = Number(req.body?.rating);
  if (!rating || rating < 1 || rating > 5) return fail(res, 400, 'Rating must be between 1 and 5.');
  if (reviews.some((r) => r.book === book._id && r.user === req.user.id)) {
    return fail(res, 409, 'You have already reviewed this book.');
  }
  const review = {
    _id: `r-${++seq}`,
    book: book._id,
    user: req.user.id,
    rating,
    comment: String(req.body?.comment ?? '').trim(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  reviews.unshift(review);
  ok(res, { ...review, user: { _id: req.user.id, name: req.user.name } });
});

app.get('/api/v1/reviews/mine', auth, (req, res) => {
  const mine = reviews
    .filter((r) => r.user === req.user.id)
    .map((r) => {
      const b = bookById(r.book);
      return { ...r, user: { _id: r.user, name: req.user.name }, book: b ? { _id: b._id, title: b.title, author: b.author, coverImage: b.coverImage } : r.book };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  ok(res, mine);
});

// ---------------------------------------------------------------- cart
const cartFor = (userId) => {
  const items = cartItems
    .filter((i) => i.user === userId)
    .map((i) => ({ ...i, book: populateBook(bookById(i.book)) }));
  return { items, total: round(items.reduce((s, i) => s + i.book.price * i.quantity, 0)) };
};

app.get('/api/v1/cart', auth, (req, res) => ok(res, cartFor(req.user.id)));
app.post('/api/v1/cart', auth, (req, res) => {
  const book = bookById(String(req.body?.bookId ?? ''));
  if (!book) return fail(res, 404, 'Book not found.');
  if (book.stock <= 0) return fail(res, 400, 'This book is currently out of stock.');
  const existing = cartItems.find((i) => i.user === req.user.id && i.book === book._id);
  if (existing) existing.quantity = Math.min(existing.quantity + Number(req.body?.quantity ?? 1), book.stock);
  else cartItems.push({ _id: `ci-${++seq}`, user: req.user.id, book: book._id, quantity: Number(req.body?.quantity ?? 1) });
  const item = cartItems.find((i) => i.user === req.user.id && i.book === book._id);
  ok(res, { ...item, book: populateBook(book) }, undefined, 201);
});

app.put('/api/v1/cart/:id', auth, (req, res) => {
  const item = cartItems.find((i) => i._id === req.params.id && i.user === req.user.id);
  if (!item) return fail(res, 404, 'Cart item not found.');
  const book = bookById(item.book);
  const qty = Number(req.body?.quantity ?? 1);
  if (qty < 1) return fail(res, 400, 'Quantity must be at least 1.');
  item.quantity = Math.min(qty, book.stock);
  ok(res, { ...item, book: populateBook(book) });
});

app.delete('/api/v1/cart/:id', auth, (req, res) => {
  const idx = cartItems.findIndex((i) => i._id === req.params.id && i.user === req.user.id);
  if (idx === -1) return fail(res, 404, 'Cart item not found.');
  cartItems.splice(idx, 1);
  ok(res, { id: req.params.id });
});

app.delete('/api/v1/cart', auth, (req, res) => {
  cartItems = cartItems.filter((i) => i.user !== req.user.id);
  ok(res, { cleared: true });
});

// ---------------------------------------------------------------- wishlist
const wishFor = (userId) =>
  wishlistItems
    .filter((i) => i.user === userId)
    .map((i) => ({ ...i, book: populateBook(bookById(i.book)) }));

app.get('/api/v1/wishlist', auth, (req, res) => ok(res, wishFor(req.user.id)));
app.post('/api/v1/wishlist', auth, (req, res) => {
  const book = bookById(String(req.body?.bookId ?? ''));
  if (!book) return fail(res, 404, 'Book not found.');
  const existing = wishlistItems.find((i) => i.user === req.user.id && i.book === book._id);
  if (existing) return ok(res, { ...existing, book: populateBook(book) });
  const item = { _id: `wi-${++seq}`, user: req.user.id, book: book._id };
  wishlistItems.push(item);
  ok(res, { ...item, book: populateBook(book) });
});
app.delete('/api/v1/wishlist/:bookId', auth, (req, res) => {
  wishlistItems = wishlistItems.filter((i) => !(i.user === req.user.id && i.book === req.params.bookId));
  ok(res, { id: req.params.bookId });
});

// ---------------------------------------------------------------- orders
const populateOrder = (o) => ({
  ...o,
  user: { _id: o.user, name: users.find((u) => u.id === o.user)?.name || 'Unknown', email: users.find((u) => u.id === o.user)?.email || '' },
});

app.post('/api/v1/orders', auth, (req, res) => {
  const { name, address, city, postalCode, phone } = req.body || {};
  if (![name, address, city, postalCode, phone].every((v) => v && String(v).trim())) {
    return fail(res, 400, 'Please fill in all shipping details.');
  }
  const cart = cartFor(req.user.id);
  if (!cart.items.length) return fail(res, 400, 'Your cart is empty.');
  for (const item of cart.items) {
    const b = bookById(item.book._id);
    if (item.quantity > b.stock) return fail(res, 400, `Not enough stock for "${b.title}".`);
  }
  for (const item of cart.items) bookById(item.book._id).stock -= item.quantity;
  cartItems = cartItems.filter((i) => i.user !== req.user.id);
  const order = {
    _id: `o-${++seq}`,
    orderNumber: `OBS-${orderSeq++}`,
    user: req.user.id,
    status: 'pending',
    shippingInfo: { name, address, city, postalCode, phone },
    items: cart.items.map((i) => ({ book: i.book._id, title: i.book.title, author: i.book.author, price: i.book.price, quantity: i.quantity, coverImage: i.book.coverImage })),
    total: cart.total,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  orders.push(order);
  ok(res, populateOrder(order), undefined, 201);
});

app.get('/api/v1/orders', auth, (req, res) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);
  const mine = orders.filter((o) => o.user === req.user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const pag = paginate(mine, page, limit);
  ok(res, pag.slice.map(populateOrder), { page: pag.page, limit: pag.limit, total: pag.total, totalPages: pag.totalPages });
});

app.get('/api/v1/orders/:id', auth, (req, res) => {
  const order = orders.find((o) => o._id === req.params.id && o.user === req.user.id);
  if (!order) return fail(res, 404, 'Order not found.');
  ok(res, populateOrder(order));
});

// ---------------------------------------------------------------- admin
const requireAdminMw = [auth, requireAdmin];

app.post('/api/v1/admin/uploads', requireAdminMw, upload.single('file'), (req, res) => {
  if (!req.file) return fail(res, 400, 'No image file provided.');
  ok(res, { url: `http://localhost:${PORT}/uploads/${req.file.filename}` }, undefined, 201);
});

app.get('/api/v1/admin/stats', requireAdminMw, (_req, res) => {
  const active = orders.filter((o) => o.status !== 'cancelled');
  const revenue = round(active.reduce((s, o) => s + o.total, 0));
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: d.toLocaleDateString('en-US', { month: 'short' }) });
  }
  const monthly = months.map((m) => {
    const inMonth = orders.filter((o) => monthKey(o.createdAt) === m.key);
    return {
      month: m.label,
      revenue: round(inMonth.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0)),
      orders: inMonth.length,
    };
  });
  const byTitle = {};
  for (const o of orders) {
    if (o.status === 'cancelled') continue;
    for (const i of o.items) {
      byTitle[i.title] = byTitle[i.title] || { quantity: 0, revenue: 0 };
      byTitle[i.title].quantity += i.quantity;
      byTitle[i.title].revenue += round(i.price * i.quantity);
    }
  }
  const topBooks = Object.entries(byTitle)
    .map(([title, v]) => {
      const b = books.find((x) => x.title === title);
      return { _id: b?._id || title, title, coverImage: b?.coverImage || '', quantity: v.quantity, revenue: round(v.revenue) };
    })
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);
  ok(res, {
    revenue,
    orders: orders.length,
    books: books.length,
    customers: users.filter((u) => u.role === 'customer').length,
    lowStock: books.filter((b) => b.stock > 0 && b.stock < 5).length,
    pendingReviews: reviews.filter((r) => r.status === 'pending').length,
    monthly,
    recentOrders: [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5).map(populateOrder),
    topBooks,
  });
});

app.get('/api/v1/admin/books', requireAdminMw, (req, res) => {
  const { search, category } = req.query;
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  let list = [...books];
  if (category) list = list.filter((b) => b.category === category);
  if (String(req.query.lowStock) === 'true') list = list.filter((b) => b.stock > 0 && b.stock < 5);
  if (search && String(search).trim()) {
    const term = String(search).trim().toLowerCase();
    list = list.filter((b) => b.title.toLowerCase().includes(term) || b.author.toLowerCase().includes(term) || b.isbn.includes(term));
  }
  const pag = paginate(list, page, limit);
  ok(res, pag.slice.map(populateBook), { page: pag.page, limit: pag.limit, total: pag.total, totalPages: pag.totalPages });
});

app.get('/api/v1/admin/books/:id', requireAdminMw, (req, res) => {
  const book = bookById(req.params.id);
  if (!book) return fail(res, 404, 'Book not found.');
  ok(res, populateBook(book));
});

app.post('/api/v1/admin/books', requireAdminMw, (req, res) => {
  const { title, author, category, price, stock } = req.body || {};
  if (!title?.trim() || !author?.trim()) return fail(res, 400, 'Title and author are required.');
  if (!catById(category)) return fail(res, 400, 'Please choose a valid category.');
  const book = {
    _id: `b-${++seq}`,
    title: title.trim(),
    author: author.trim(),
    isbn: String(req.body?.isbn ?? '').trim(),
    description: String(req.body?.description ?? '').trim(),
    price: Number(price) || 0,
    stock: Number(stock) || 0,
    coverImage: req.body?.coverImage || COVER(String(req.body?.isbn ?? '').trim()) || '',
    category,
    ratingAvg: 0,
    ratingCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  books.push(book);
  ok(res, populateBook(book), undefined, 201);
});

app.put('/api/v1/admin/books/:id', requireAdminMw, (req, res) => {
  const book = bookById(req.params.id);
  if (!book) return fail(res, 404, 'Book not found.');
  const assigns = ['title', 'author', 'isbn', 'description', 'coverImage'];
  for (const key of assigns) if (req.body?.[key] !== undefined) book[key] = String(req.body[key]).trim();
  if (req.body?.price !== undefined) book.price = Number(req.body.price);
  if (req.body?.stock !== undefined) book.stock = Number(req.body.stock);
  if (req.body?.category !== undefined) {
    if (!catById(req.body.category)) return fail(res, 400, 'Please choose a valid category.');
    book.category = req.body.category;
  }
  book.updatedAt = new Date().toISOString();
  ok(res, populateBook(book));
});

app.patch('/api/v1/admin/books/:id/stock', requireAdminMw, (req, res) => {
  const book = bookById(req.params.id);
  if (!book) return fail(res, 404, 'Book not found.');
  const stock = Number(req.body?.stock);
  if (!Number.isFinite(stock) || stock < 0) return fail(res, 400, 'Stock must be 0 or more.');
  book.stock = stock;
  book.updatedAt = new Date().toISOString();
  ok(res, populateBook(book));
});

app.delete('/api/v1/admin/books/:id', requireAdminMw, (req, res) => {
  const idx = books.findIndex((b) => b._id === req.params.id);
  if (idx === -1) return fail(res, 404, 'Book not found.');
  reviews = reviews.filter((r) => r.book !== req.params.id);
  cartItems = cartItems.filter((i) => i.book !== req.params.id);
  wishlistItems = wishlistItems.filter((i) => i.book !== req.params.id);
  books.splice(idx, 1);
  ok(res, { id: req.params.id });
});

app.get('/api/v1/admin/orders', requireAdminMw, (req, res) => {
  const { status, search } = req.query;
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  let list = [...orders];
  if (status) list = list.filter((o) => o.status === status);
  if (search && String(search).trim()) {
    const term = String(search).trim().toLowerCase();
    const u = users.find((x) => x.name.toLowerCase().includes(term) || x.email.toLowerCase().includes(term));
    list = list.filter((o) => o.orderNumber.toLowerCase().includes(term) || (u && o.user === u.id));
  }
  const pag = paginate(list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)), page, limit);
  ok(res, pag.slice.map(populateOrder), { page: pag.page, limit: pag.limit, total: pag.total, totalPages: pag.totalPages });
});

app.patch('/api/v1/admin/orders/:id/status', requireAdminMw, (req, res) => {
  const order = orders.find((o) => o._id === req.params.id);
  if (!order) return fail(res, 404, 'Order not found.');
  const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  if (!statuses.includes(req.body?.status)) return fail(res, 400, 'Invalid status.');
  order.status = req.body.status;
  order.updatedAt = new Date().toISOString();
  ok(res, populateOrder(order));
});

app.get('/api/v1/admin/customers', requireAdminMw, (req, res) => {
  const { search } = req.query;
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  let list = users.filter((u) => u.role === 'customer');
  if (search && String(search).trim()) {
    const term = String(search).trim().toLowerCase();
    list = list.filter((u) => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));
  }
  const customers = list.map((u) => {
    const theirs = orders.filter((o) => o.user === u.id);
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      createdAt: u.createdAt,
      orders: theirs.length,
      spent: round(theirs.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0)),
    };
  });
  const pag = paginate(customers, page, limit);
  ok(res, pag.slice, { page: pag.page, limit: pag.limit, total: pag.total, totalPages: pag.totalPages });
});

const reviewForAdmin = (r) => ({
  ...r,
  user: { _id: r.user, name: users.find((u) => u.id === r.user)?.name || 'Unknown', email: users.find((u) => u.id === r.user)?.email || '' },
  book: (() => {
    const b = bookById(r.book);
    return b ? { _id: b._id, title: b.title, coverImage: b.coverImage, author: b.author } : r.book;
  })(),
});

app.get('/api/v1/admin/reviews', requireAdminMw, (req, res) => {
  const { status } = req.query;
  let list = [...reviews];
  if (status) list = list.filter((r) => r.status === status);
  ok(res, list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(reviewForAdmin));
});

app.patch('/api/v1/admin/reviews/:id', requireAdminMw, (req, res) => {
  const review = reviews.find((r) => r._id === req.params.id);
  if (!review) return fail(res, 404, 'Review not found.');
  const statuses = ['pending', 'approved', 'rejected'];
  if (!statuses.includes(req.body?.status)) return fail(res, 400, 'Invalid status.');
  review.status = req.body.status;
  const book = bookById(review.book);
  const approved = reviews.filter((r) => r.book === book._id && r.status === 'approved');
  book.ratingAvg = approved.length ? round(approved.reduce((s, r) => s + r.rating, 0) / approved.length) : 0;
  book.ratingCount = approved.length;
  ok(res, { id: review._id, status: review.status });
});

app.delete('/api/v1/admin/reviews/:id', requireAdminMw, (req, res) => {
  const idx = reviews.findIndex((r) => r._id === req.params.id);
  if (idx === -1) return fail(res, 404, 'Review not found.');
  const [gone] = reviews.splice(idx, 1);
  const book = bookById(gone.book);
  const approved = reviews.filter((r) => r.book === book._id && r.status === 'approved');
  book.ratingAvg = approved.length ? round(approved.reduce((s, r) => s + r.rating, 0) / approved.length) : 0;
  book.ratingCount = approved.length;
  ok(res, { id: gone._id });
});

// ---------------------------------------------------------------- 404 + boot
app.use('/api/v1', (_req, res) => fail(res, 404, 'Route not found.'));

app.use((err, _req, res, _next) => {
  const status = err instanceof multer.MulterError || String(err?.message ?? '').includes('Only JPEG') ? 400 : 500;
  fail(res, status, err?.message || 'Something went wrong.');
});

app.listen(PORT, () => {
  console.log('Mock API listening on http://localhost:5000/api/v1');
  console.log('Demo login:    demo@bookstore.com / demo123      (customer)');
  console.log('Admin login:   admin@bookstore.com / admin123    (admin)');
  console.log('Data is in-memory and resets on restart.');
});