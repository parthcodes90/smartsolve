# Zen2: Municipal Civic Complaint Backend (Phase-1)

Production-ready backend for a municipal grievance platform.

## Architecture Overview

- **RESTful API**: Node.js + Express
- **ORM**: Prisma (PostgreSQL on Neon DB)
- **AI Integration**: Orchestrates LLM analysis (Vision + Text) for categorization and scoring.
- **Service Layer**: Decoupled modules for Zone Resolution, Storage, AI, and Assignments.

### Intake Workflow (POST `/api/complaints`)

1. **Intake**: Accept multipart/form-data (photo, metadata, location).
2. **Storage**: Secure image upload (abstracted for cloud/local).
3. **Geo-Resolution**: Maps coordinates to a specific municipal `zone`.
4. **AI Analysis**: 
   - Classifies department (Public Works, etc.).
   - Assesses Severity (1-10), Risk (1-10), and Env. Impact (1-10).
   - Assigns Priority (LOW to CRITICAL).
5. **Assignment**: Directs the complaint to the correct departmental unit within the resolved zone.
6. **Persistence**: Transactional storage with analytics-ready fields.

## Core Services

- `StorageService`: Local FS for Phase-1, swappable for S3/Cloudinary.
- `AIService`: Strict JSON-based LLM integration with heuristic fallback.
- `ZoneService`: Bounding-box coordinate matching for municipality boundaries.
- `AssignmentService`: SLA-aware department routing.

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   Create a `.env` file based on `.env.example`.
   ```env
   DATABASE_URL="postgresql://user:password@neon-db.com/dbname"
   ```

3. **Database Migration & Seeding**:
   ```bash
   npx prisma generate
   # Run migrations (local dev)
   npx prisma migrate dev --name init
   # Seed default zones and departments
   npx prisma db seed
   ```

4. **Run Server**:
   ```bash
   npm start
   # Or for development
   npm run dev
   ```

## API Endpoint Documentation

### POST `/api/complaints`
**Content-Type**: `multipart/form-data`

| Field | Type | Required | Description |
|---|---|---|---|
| `photo` | File | Yes | Image of the issue (jpg/png) |
| `description` | String | Yes | Minimum 10 characters |
| `category` | String | Yes | Citizen-selected category (e.g. "Roads") |
| `latitude` | Number | Yes | GPS coordinates |
| `longitude` | Number | Yes | GPS coordinates |
| `user_id` | UUID | Yes | Registered citizen ID |

---
**Senior Architect Note**: Phase-1 focus is on deterministic routing and structured AI output. Authentication, Admin UI, and Live Notifications are reserved for Phase-2.