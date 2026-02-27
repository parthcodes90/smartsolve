# Neon-ready Auth Setup

This backend now includes JWT auth routes compatible with the mobile app endpoints:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

## Added files
- `src/services/neonAuth.js`
- `src/middleware/auth.js`
- `src/routes/auth.js`
- `db/migrations/001-create-users.sql`

## Environment variables
Set these in `backend/.env`:

```env
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
NEON_AUTH_SECRET=<strong-random-secret>
NEON_PROJECT_ID=<your-neon-project-id>
NEON_AUTH_URL=http://localhost:3000
```

## Install dependencies
```bash
cd backend
npm install bcryptjs jsonwebtoken express-rate-limit
```

## Run migration
```bash
psql "$DATABASE_URL" -f backend/db/migrations/001-create-users.sql
```

## Quick test
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"me@example.com","password":"secret123"}'

curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"me@example.com","password":"secret123"}'

curl http://localhost:3000/api/auth/me -H "Authorization: Bearer <token>"
```
