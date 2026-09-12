# Hand Me Down

A secondhand marketplace where users list and browse used items (books,
household goods, etc.) for local pickup, with per-user wishlists.

Live: https://hand-me-down-chi.vercel.app/

## Stack

- **Framework:** Next.js 13 (pages router) -- both the frontend and the
  `/api/*` backend live in this one app.
- **Database:** MongoDB via Mongoose.
- **Auth:** JWT stored in an httpOnly cookie, bcrypt-hashed passwords.
- **Images:** Cloudinary.
- **Tests:** Jest + `mongodb-memory-server` (real in-memory MongoDB, not
  mocks) + `node-mocks-http`.

## Getting started

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and fill in:

- `MONGODB_URI` -- a MongoDB connection string (e.g. a free Atlas M0 cluster).
- `CDN_CLOUD_NAME` / `CDN_API_KEY` / `CDN_API_SECRET` -- a Cloudinary account
  (used for product/avatar image uploads).
- `JWT_SECRETS` -- any long random string used to sign auth tokens.

```bash
npm test         # run the test suite (jest --runInBand)
npm run build    # production build
```

## Architecture

Routes under `pages/api/**` are thin dispatchers on `req.method` that call
into `controllers/**`, which hold the actual request handling and talk to
the Mongoose models in `models/**` directly. There's no separate service
or repository layer -- controllers are the business logic layer.

### Auth

- Login (`controllers/auth/loginUser.js`) verifies the password with
  `bcrypt.compare` against the stored hash, then signs a JWT
  (`{ uid }`, 7-day expiry) and sets it as an **httpOnly** cookie named
  `token`. Non-sensitive `email`/`name` cookies are set alongside it,
  readable client-side, purely so the nav bar can show who's signed in
  without an extra request.
- Every API route that mutates or reads private data is wrapped in
  `lib/requireAuth.js`, which reads the `token` cookie, verifies its
  signature with `jsonwebtoken`, and attaches `req.user = { uid }` to the
  request -- or returns 401. Browsing endpoints (product/user listing)
  stay public; everything else requires this.
- Ownership, not just authentication, is enforced per-endpoint: a user can
  only update their own profile, a seller can only update their own
  product listings (enforced atomically in the update query itself, not
  as a separate check), and the wishlist endpoints operate on
  `req.user.uid` from the verified token -- never on a client-supplied id.
- `GET /api/auth/me` returns the authenticated user's identity; pages use
  it instead of decoding the JWT client-side, since the token cookie is
  httpOnly and unreadable by browser JS by design.
- Logout (`POST /api/auth/logout`) clears all three auth cookies
  server-side; a client can't clear an httpOnly cookie itself.

### Tests

Controller tests spin up a real in-memory MongoDB per test file
(`test/setup.js`) rather than mocking Mongoose, so they exercise actual
queries, indexes, and atomic operators. Run serially
(`jest --runInBand`) -- running many suites in parallel starts too many
concurrent in-memory MongoDB instances and gets flaky under load.

---

This section will keep growing as the project moves past security
hardening into the inventory/checkout, geospatial, and search work
described in-repo.
