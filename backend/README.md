# SmartSolve Backend

## Why this exists
The `backend/` directory was empty, which is a delivery blocker for:
- setting up CI checks for backend code,
- validating backend runtime assumptions,
- integrating frontend APIs against a running service.

This baseline keeps behavior minimal while making the backend runnable and verifiable.

## Run locally
```bash
npm start
```

## Development mode
```bash
npm run dev
```

## Available endpoint
- `GET /health` → `{ "status": "ok" }`
