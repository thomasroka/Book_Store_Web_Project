# Leaf & Ink — Online Book Store

A full-stack online bookstore: a customer storefront and an admin dashboard in one
TypeScript monorepo.

- **Client** — React 18 · TypeScript · Vite · React Router · Tailwind CSS · Axios · Recharts
- **Server** — Node.js · Express · TypeScript · MongoDB (Mongoose) · JWT · bcrypt

The checkout is a **demo flow with no payment processing** — orders are created and tracked
by status (`pending → confirmed → shipped → delivered`).

---

## Getting started

### 1. Prerequisites

- Node.js 20+ (tested on 22)
- A MongoDB database. This project was built for **MongoDB Atlas** —
  create a free cluster at <https://www.mongodb.com/cloud/atlas> and copy the connection string.

### 2. Configure the server

```bash
cd server
cp .env.example .env
```

Edit `server/.env` and set your Atlas connection string:

```
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/bookstore
JWT_SECRET=<a-long-random-string>
```

### 3. Install & seed

```bash
# server
cd server
npm install
npm run seed          # creates demo data (see credentials below)

# client
cd ../client
npm install
```

### 4. Run

```bash
# terminal 1
cd server
npm run dev           # API on http://localhost:5000/api/v1

# terminal 2
cd client
npm run dev           # storefront on http://localhost:5173
```

Open <http://localhost:5173>. The client proxies `/api` to the server, so the server must
be running.

### Demo accounts

| Role     | Email                | Password  |
| -------- | -------------------- | --------- |
| Admin    | `admin@bookstore.com`| `admin123`|
| Customer | `demo@bookstore.com` | `demo123` |

---

## Project structure

```
OnlineBookStore/
├── server/                     Express + TypeScript REST API
│   ├── src/
│   │   ├── config/             env loading, MongoDB connection
│   │   ├── controllers/        request handlers
│   │   ├── middleware/         JWT auth, role guard, validation, error handling
│   │   ├── models/             Mongoose: User, Category, Book, CartItem,
│   │   │                       WishlistItem, Review, Order
│   │   ├── routes/             /api/v1/* route tables
│   │   ├── services/           business logic (books, orders, reviews, stats)
│   │   ├── utils/              ApiError, async handler, JWT, helpers
│   │   ├── types/              shared types + Express request augmentation
│   │   ├── app.ts              Express app
│   │   ├── server.ts           entry point
│   │   └── seed.ts             demo data script
│   └── .env / .env.example
└── client/                     React + Vite + Tailwind storefront
    ├── src/
    │   ├── assets/
    │   ├── components/         domain + reusable UI kit (components/ui/)
    │   ├── pages/customer/     storefront pages
    │   ├── pages/admin/        dashboard pages
    │   ├── layouts/            customer + admin shells
    │   ├── context/            auth, cart, wishlist state
    │   ├── hooks/              data fetching hooks
    │   ├── services/           typed Axios API wrappers
    │   ├── types/              shared API types
    │   ├── utils/              formatting, classnames, storage
    │   ├── styles/             Tailwind tokens + base styles
    │   └── routes/             route table with guards
    └── .env                    VITE_API_URL
```

### Features

**Storefront**
- Browse, search (title/author/ISBN), filter by category, sort by price/rating/newest
- Book detail pages with stock status, ratings, and customer reviews
- Cart, wishlist, demo checkout with shipping details, order history and order tracking
- Authentication (register / login), profile editing, "my reviews"

**Admin dashboard** (`/admin` — admin role only)
- Overview stats, 6-month revenue chart, top sellers, recent orders
- Books: full CRUD with category management and cover photo upload (`POST /admin/uploads`)
- Categories: create / rename / delete (protected when books are assigned)
- Inventory: search + low-stock filter, inline stock editing
- Orders: filter by status, update status through the fulfillment lifecycle
- Customers: searchable list with order counts and lifetime spend
- Reviews: moderation queue (approve / reject / delete)

### REST API summary (base `/api/v1`)

| Group     | Endpoints                                                        |
| --------- | ---------------------------------------------------------------- |
| Auth      | `POST /auth/register` · `POST /auth/login` · `GET /auth/me` · `PUT /auth/profile` |
| Books     | `GET /books` (search/category/sort/page) · `GET /books/featured` · `GET /books/new` · `GET /books/:id` |
| Category  | `GET /categories` · `POST` · `PUT /:id` · `DELETE /:id` (admin)   |
| Cart      | `GET` · `POST` · `PUT /:id` · `DELETE /:id` · `DELETE` (auth)     |
| Wishlist  | `GET` · `POST` · `DELETE /:bookId` (auth)                         |
| Reviews   | `GET /reviews/book/:bookId` · `POST /reviews/book/:bookId` · `GET /reviews/mine` |
| Orders    | `POST /orders` (checkout, no payment) · `GET /orders` · `GET /orders/:id` (auth) |
| Admin     | `GET /admin/stats` · books CRUD + stock · orders + status · customers · reviews (admin) |

Requests use `Authorization: Bearer <jwt>`. The client attaches this automatically and
redirects to `/login` on a 401.

## Scripts

- **server**: `npm run dev` · `npm run build` · `npm start` · `npm run seed` · `npm run typecheck`
- **client**: `npm run dev` · `npm run build` · `npm run preview` · `npm run typecheck`

## Notes

- Book cover art is loaded from the public
  [Open Library Covers API](https://openlibrary.org/developers/api) for seeded titles.
- Reviews submitted by customers start as `pending` until an admin approves them.
- Stock is decremented when an order is placed and enforced at the cart and checkout level.
- Admin-uploaded cover photos are stored in `server/uploads/` (gitignored) and served at `/uploads`.