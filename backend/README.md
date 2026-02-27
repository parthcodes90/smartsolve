# Municipal Complaint Management System — Phase 1 Backend

Node.js + Express REST API for complaint intake, zone resolution, AI scoring, and zone-scoped department assignment.

## Run

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

## Endpoints

- `POST /api/complaints` (multipart/form-data)
- `GET /api/zones`
- `GET /health`
