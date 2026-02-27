# Implementing Neon Auth ("Neon Base Auth") in this project

This repo already has:
- mobile API endpoints wired for `/api/auth/*`
- backend Neon-ready PostgreSQL config via `DATABASE_URL`
- Neon packages installed in backend dependencies

It does **not** yet expose backend auth routes/middleware.

## 1) Environment variables

In `backend/.env` set:

```env
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
NEON_PROJECT_ID=<your-neon-project-id>
NEON_AUTH_SECRET=<strong-random-secret>
NEON_AUTH_URL=http://localhost:3000
```

> Keep `sslmode=require` for Neon TLS.

## 2) Add Neon Auth service

Create `backend/src/services/neonAuth.js`:

```js
const { createClient } = require('@neondatabase/neon-js');

const neon = createClient({
  projectId: process.env.NEON_PROJECT_ID,
  auth: {
    secret: process.env.NEON_AUTH_SECRET,
    baseURL: process.env.NEON_AUTH_URL,
  },
});

module.exports = neon;
```

## 3) Create auth routes matching mobile client

Create `backend/src/routes/auth.js` with:
- `POST /login`
- `POST /register`
- `GET /me`
- `POST /logout`

Return the shape mobile expects (e.g., `{ token, user }` for login/register, `{ user }` for me).

## 4) JWT/session middleware

Create `backend/src/middleware/auth.js`:

```js
module.exports = function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  // verify Neon token / session here and attach req.user
  req.user = { id: 'from-token' };
  next();
};
```

Then protect private endpoints (example: `/api/complaints/my`).

## 5) Mount routes in backend app

In `backend/src/app.js`:

```js
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
```

## 6) Update mobile token handling

In mobile login/register screens:
1. Save auth token securely (e.g., `expo-secure-store`).
2. Add `Authorization: Bearer <token>` for protected calls.
3. Clear token on logout and route to login.

## 7) Database user model

Add a `users` table (or Prisma model) with at least:
- `id`
- `email` (unique)
- `password_hash` (if using password auth)
- `created_at`

If using Neon-managed auth identities, persist external user id mapping.

## 8) Validation and security

- Validate auth payloads (`email`, `password`) via `express-validator` or `zod`.
- Hash passwords with `bcrypt` if storing locally.
- Rate limit login/register endpoints.
- Add CORS origin allowlist in production.

## 9) Smoke-test flow

1. `POST /api/auth/register`
2. `POST /api/auth/login`
3. `GET /api/auth/me` with Bearer token
4. Access protected endpoint with same token

## 10) Why this is needed in this repo

- Mobile already points to `/api/auth/login|register|me|logout`.
- Backend currently mounts only complaints/zones routes.
- So implementing `/api/auth/*` is the missing integration layer.
