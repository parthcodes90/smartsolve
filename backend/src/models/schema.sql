CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS zones (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  ward_number TEXT,
  boundary    geometry(POLYGON, 4326) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS departments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id       UUID NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
  code          TEXT NOT NULL,
  name          TEXT NOT NULL,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (zone_id, code)
);

CREATE TABLE IF NOT EXISTS complaint_categories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  base_severity   SMALLINT DEFAULT 3,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS complaints (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description                 TEXT NOT NULL,
  category_id                 UUID NOT NULL REFERENCES complaint_categories(id),
  photo_url                   TEXT,
  latitude                    DOUBLE PRECISION NOT NULL,
  longitude                   DOUBLE PRECISION NOT NULL,
  location                    geometry(POINT, 4326) GENERATED ALWAYS AS (
                                ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
                              ) STORED,
  address                     TEXT,
  submitted_by                TEXT DEFAULT 'anonymous',
  zone_id                     UUID NOT NULL REFERENCES zones(id),
  assigned_department_id      UUID NOT NULL REFERENCES departments(id),
  ai_department_code          VARCHAR(50),
  ai_reasoning                TEXT,
  severity_score              SMALLINT NOT NULL CHECK (severity_score BETWEEN 1 AND 10),
  location_sensitivity_score  SMALLINT NOT NULL CHECK (location_sensitivity_score BETWEEN 1 AND 10),
  public_risk_score           SMALLINT NOT NULL CHECK (public_risk_score BETWEEN 1 AND 10),
  priority_score              NUMERIC(3,1) NOT NULL CHECK (priority_score BETWEEN 1.0 AND 10.0),
  priority_label              TEXT NOT NULL CHECK (priority_label IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  status                      TEXT NOT NULL DEFAULT 'PENDING',
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assigned_at                 TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS assignment_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id  UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES departments(id),
  assigned_by   VARCHAR(50) DEFAULT 'AI',
  action        TEXT NOT NULL,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Spatial indexes
CREATE INDEX IF NOT EXISTS idx_zones_boundary      ON zones USING GIST (boundary);
CREATE INDEX IF NOT EXISTS idx_complaints_location ON complaints USING GIST (location);

-- Operational indexes
CREATE INDEX IF NOT EXISTS idx_complaints_status   ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_priority ON complaints(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_complaints_created  ON complaints(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaints_zone     ON complaints(zone_id);
CREATE INDEX IF NOT EXISTS idx_complaints_dept     ON complaints(assigned_department_id);
CREATE INDEX IF NOT EXISTS idx_departments_zone_code ON departments(zone_id, code);