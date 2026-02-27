# Municipal Complaint Management System — Backend

Node.js + Express REST API for complaint intake, zone resolution, AI scoring, and department assignment.

## Run locally

```bash
npm install
npm run dev
```

## Environment

```env
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
ANTHROPIC_API_KEY=sk-ant-...
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
PORT=3000
```

## DB setup

```bash
psql $DATABASE_URL -f src/models/schema.sql
psql $DATABASE_URL -f src/models/seed.sql
```

## API endpoints

- `POST /api/complaints` (multipart/form-data)
- `GET /api/complaints`
- `GET /api/complaints/:id`
- `GET /api/zones`
- `GET /api/departments`
- `GET /health`

## Deploy backend on Vercel

This folder contains `vercel.json` and `api/index.js` for serverless deployment.

1. Import `backend` as a Vercel project.
2. Build & output are handled by `vercel.json`.
3. Add required environment variables (`DATABASE_URL`, `ANTHROPIC_API_KEY`, `CLOUDINARY_URL`).
4. Deploy.
5. Use deployed API URL in frontend as `VITE_API_URL=https://<backend-domain>/api`.

