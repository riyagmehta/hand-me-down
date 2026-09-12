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

### Checkout and inventory

`POST /api/orders` (`controllers/orders/placeOrder.js`) is the purchase
flow -- products had a `counts` field from the start, but nothing ever
decremented it before this.

- **No overselling under concurrency.** The stock check and the decrement
  are one atomic `findOneAndUpdate` (`{ counts: { $gte: quantity } }` /
  `$inc -quantity`), not a separate read-then-write. Two buyers racing the
  last unit of an item can't both see enough stock and both proceed --
  MongoDB's per-document write atomicity serializes them, so the second
  request's filter is evaluated against the already-decremented document
  and fails to match instead of overselling.
- **Idempotent by a unique index, not just an upfront check.** Each
  request carries a client-generated `idempotencyKey`. An early
  `findOne` short-circuits the common retry case, but the actual
  guarantee is a **unique index** on that field: if two requests race
  with the same key, only one order insert can win, and the loser
  compensates by giving back the stock it reserved and returns the
  winner's order instead of creating a duplicate. The same compensation
  runs if order creation fails for any other reason, so a mid-flight
  failure never leaves stock silently short.
- Tested against a real in-memory MongoDB with actual concurrent
  requests (`Promise.all`, not mocked timing) for both the oversell case
  and the shared-idempotency-key case.
- Orders can be cancelled (`PUT /api/orders/:oid/cancel`, either party --
  buyer or seller) which restocks the product. The status flip
  (`"placed"` -> `"cancelled"`) is itself an atomic conditional update
  filtered on `status: "placed"`, so two concurrent cancel attempts on
  the same order can't both succeed -- same pattern as the stock
  decrement. If the restock fails after the flip, the cancellation is
  rolled back rather than leaving stock permanently short.
- `GET /api/orders` (buyer or seller) backs a `/orders` page showing
  purchase and sale history with a cancel action.

### Tests

Controller tests spin up a real in-memory MongoDB per test file
(`test/setup.js`) rather than mocking Mongoose, so they exercise actual
queries, indexes, and atomic operators -- including genuine concurrent
requests against the same document for the checkout race conditions
above. Run serially (`jest --runInBand`) -- running many suites in
parallel starts too many concurrent in-memory MongoDB instances and
gets flaky under load.

---

This section will keep growing as the project moves past checkout into
the geospatial and search work described in-repo.
