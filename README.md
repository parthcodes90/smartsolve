# SmartSolve

SmartSolve is a civic issue management platform for municipalities. It includes:
- a **mobile app** for citizens to submit complaints,
- a **backend API** for complaint processing, zoning, assignment, and auth,
- a **web dashboard** for operational visibility.

## Repository Structure

- `mobile/` — Expo + React Native citizen app
- `backend/` — Node.js + Express API with PostgreSQL/Neon
- `webfrontend/` — React + Vite web dashboard
- `docs/` — implementation notes and integration docs

## Core Features

### Citizen complaint workflow
- Create complaints with description, category, location, and optional photo upload
- Automatic zone resolution from complaint coordinates
- AI-assisted (or heuristic fallback) priority scoring
- Department auto-assignment based on zone and category/classification

### Authentication
- JWT-based auth endpoints in backend:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/me`
  - `POST /api/auth/logout`
- Secure token storage in mobile via Expo Secure Store

### Operations & data
- Zone listing endpoints for municipality boundaries/wards
- Assignment logs for traceability
- Health check endpoint for service monitoring

## Tech Stack

### Mobile (`mobile/`)
- **Expo** + **React Native**
- **Expo Router** for navigation
- **TypeScript**
- **Axios** for API calls
- **expo-secure-store** for auth token persistence

### Backend (`backend/`)
- **Node.js** + **Express** (CommonJS)
- **PostgreSQL** (Neon-compatible connection)
- **pg** for DB access
- **Prisma** (present for schema/client tooling)
- **Multer** for file upload handling
- **Cloudinary** integration for media storage
- **jsonwebtoken** + **bcryptjs** for auth/security
- **express-validator** + **express-rate-limit** for auth request hardening
- Optional **Anthropic SDK** for AI scoring

### Web Dashboard (`webfrontend/`)
- **React** + **Vite**
- **React Router**
- **TanStack Query**
- **Recharts** for visualizations
- **Tailwind CSS**

## Getting Started

## 1) Backend

```bash
cd backend
npm install
npm run dev
```

Required environment variables (example):

```env
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
ANTHROPIC_API_KEY=sk-ant-...
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
NEON_AUTH_SECRET=replace-with-strong-secret
PORT=3000
```

Initialize database (SQL schema + seed):

```bash
cd backend
psql "$DATABASE_URL" -f src/models/schema.sql
psql "$DATABASE_URL" -f src/models/seed.sql
```

Auth users table migration:

```bash
psql "$DATABASE_URL" -f db/migrations/001-create-users.sql
```

## 2) Mobile App

```bash
cd mobile
npm install
npx expo start
```

Set API URL for mobile (if needed):

```env
EXPO_PUBLIC_API_URL=http://<your-local-ip>:3000
```

## 3) Web Dashboard

```bash
cd webfrontend
npm install
npm run dev
```

## API Overview

- `GET /health`
- `POST /api/complaints`
- `GET /api/zones`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

## Notes

- This repository currently contains both SQL-based data models and Prisma schema artifacts.
- AI scoring gracefully falls back to deterministic heuristics when AI credentials are missing.
- Neon-specific auth service scaffolding exists in `backend/src/services/neonAuth.js` for future managed-auth integrations.
