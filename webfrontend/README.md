# SmartSolve Admin Web Frontend

React + Vite admin dashboard for complaints, zones, and departments.

## Local development

```bash
npm install
cp .env.example .env
npm run dev
```

By default, the frontend reads API base URL from `VITE_API_URL`.

Example:

```env
VITE_API_URL=http://localhost:3000/api
```

## Connect frontend to backend

1. Run backend (`backend/`) locally on port `3000`, or deploy it first.
2. Set `VITE_API_URL` to your backend API base (must include `/api`).
3. Start frontend and verify data loads in:
   - `/admin/overview`
   - `/admin/complaints`
   - `/admin/zones`
   - `/admin/departments`

## Deploy frontend on Vercel

This folder contains `vercel.json` with SPA rewrites for React Router.

1. Import `webfrontend` as a Vercel project.
2. Framework preset: **Vite**.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Add environment variable:
   - `VITE_API_URL=https://<your-backend-domain>/api`
6. Deploy.

